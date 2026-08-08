import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import base64
import time
import os

# Helper to resolve asset paths across local and Docker container environments
def get_asset_path(filename):
    candidates = [
        filename,
        os.path.join(os.path.dirname(__file__), '../../', filename),
        os.path.join(os.path.dirname(__file__), '../', filename),
        os.path.join('/app', filename),
    ]
    for path in candidates:
        if os.path.exists(path):
            return os.path.abspath(path)
    return filename

# Initialize the HandLandmarker using the Tasks API
task_model_path = get_asset_path('hand_landmarker.task')
base_options = python.BaseOptions(model_asset_path=task_model_path)
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
    mapping_path = get_asset_path('models/class_mapping.json')
    model_path = get_asset_path('models/sign_model.pt')

    # Load class mapping
    with open(mapping_path, 'r') as f:
        mapping = json.load(f)
        class_mapping = {int(k): v for k, v in mapping.items()}
        
    # Load model
    pytorch_model = SignClassifier(input_size=63, num_classes=len(class_mapping))
    pytorch_model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
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
            wrist = landmarks[0]
            for lm in landmarks:
                features.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])
                
            input_tensor = torch.tensor([features], dtype=torch.float32)
            
            with torch.no_grad():
                outputs = pytorch_model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                
                class_idx = predicted.item()
                sign = class_mapping[class_idx]
                conf_score = int(confidence.item() * 100)
                
                # Skip 'nothing', 'all', or invalid classes — they mean no gesture
                if sign.lower() in ['nothing', 'all', 'unknown']:
                    return "UNKNOWN", 0
                
                if conf_score >= 50:
                    return sign, conf_score
        except Exception as e:
            print(f"Inference error: {e}")
            
    # 2. No trained model available — return UNKNOWN
    return "UNKNOWN", 0

class NormalizedLandmark:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

def predict_gesture(data_input) -> dict:
    """
    Takes either landmark array or base64 frame, and returns a prediction.
    """
    try:
        # 1. Fast-path: Landmark array passed directly from frontend (0.1ms execution!)
        if isinstance(data_input, dict) and "landmarks" in data_input:
            lm_list = data_input["landmarks"]
            if lm_list and len(lm_list) == 21:
                landmarks = [NormalizedLandmark(lm.get("x", 0), lm.get("y", 0), lm.get("z", 0)) for lm in lm_list]
                sign, confidence = classify_landmarks(landmarks)
                return {
                    "sign": sign,
                    "confidence": confidence,
                    "landmarks": lm_list,
                    "timestamp": time.time()
                }

        # 2. String input (JSON or Base64)
        if isinstance(data_input, str):
            data_str = data_input.strip()
            if data_str.startswith("{") and "landmarks" in data_str:
                import json as json_lib
                try:
                    parsed = json_lib.loads(data_str)
                    return predict_gesture(parsed)
                except Exception:
                    pass

            # Base64 image fallback
            frame_data_b64 = data_str
            if "," in frame_data_b64:
                frame_data_b64 = frame_data_b64.split(",")[1]
                
            img_bytes = base64.b64decode(frame_data_b64)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"error": "Invalid frame"}

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            detection_result = landmarker.detect(mp_image)
            
            if detection_result.hand_landmarks:
                for hand_landmarks in detection_result.hand_landmarks:
                    sign, confidence = classify_landmarks(hand_landmarks)
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
