import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import base64
import time
import os

# Initialize the HandLandmarker using the Tasks API
base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5
)
landmarker = vision.HandLandmarker.create_from_options(options)

import torch
from app.ml.model import SignClassifier
import json

# Initialize PyTorch Model
pytorch_model = None
class_mapping = {}

try:
    # Load class mapping
    with open('models/class_mapping.json', 'r') as f:
        mapping = json.load(f)
        class_mapping = {int(k): v for k, v in mapping.items()}
        
    # Load model
    pytorch_model = SignClassifier(input_size=63, num_classes=len(class_mapping))
    pytorch_model.load_state_dict(torch.load('models/sign_model.pt', map_location=torch.device('cpu')))
    pytorch_model.eval()
    print("Successfully loaded PyTorch SignClassifier model!")
except Exception as e:
    print(f"PyTorch model not found or failed to load. Run train.py first! Error: {e}")

# Classify using PyTorch or fallback heuristic
def classify_landmarks(landmarks):
    # 1. If PyTorch model is available, use Neural Network inference
    if pytorch_model is not None and class_mapping:
        try:
            features = []
            for lm in landmarks:
                features.extend([lm.x, lm.y, lm.z])
                
            input_tensor = torch.tensor([features], dtype=torch.float32)
            
            with torch.no_grad():
                outputs = pytorch_model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                
                class_idx = predicted.item()
                sign = class_mapping[class_idx]
                conf_score = int(confidence.item() * 100)
                
                # Skip 'nothing' class — it means no meaningful sign
                if sign.lower() == 'nothing':
                    return "UNKNOWN", 0
                
                if conf_score >= 50:
                    return sign, conf_score
        except Exception as e:
            print(f"Inference error: {e}")
            
    # 2. No trained model available — return UNKNOWN
    return "UNKNOWN", 0

def predict_gesture(frame_data_b64: str) -> dict:
    """
    Takes a base64 encoded frame, extracts landmarks with MediaPipe Tasks API,
    and returns a prediction.
    """
    try:
        # Strip the data URL prefix if present
        if "," in frame_data_b64:
            frame_data_b64 = frame_data_b64.split(",")[1]
            
        # Decode base64 to numpy array
        img_bytes = base64.b64decode(frame_data_b64)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Invalid frame"}

        # MediaPipe expects RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        # Process frame
        detection_result = landmarker.detect(mp_image)
        
        if detection_result.hand_landmarks:
            for hand_landmarks in detection_result.hand_landmarks:
                sign, confidence = classify_landmarks(hand_landmarks)
                
                # Format landmarks for the frontend to render the skeleton
                formatted_landmarks = [
                    {"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks
                ]
                
                return {
                    "sign": sign,
                    "confidence": confidence,
                    "landmarks": formatted_landmarks,
                    "timestamp": time.time()
                }
                
        return {"sign": None, "confidence": 0, "landmarks": []}
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": str(e)}
