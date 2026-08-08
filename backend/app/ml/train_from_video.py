import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import json
import os
import sys

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Append project path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from app.ml.model import SignClassifier

def find_model():
    """Find hand_landmarker.task in common locations."""
    candidates = [
        'hand_landmarker.task',
        '../hand_landmarker.task',
        os.path.join(os.path.dirname(__file__), '../../hand_landmarker.task'),
        os.path.join(os.path.dirname(__file__), '../../../hand_landmarker.task'),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def extract_landmarks_from_video(video_path, label=None, max_samples=500):
    """
    Extracts 21 3D hand landmarks (63 normalized values) from a video file.
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        return []

    model_path = find_model()
    if not model_path:
        print("ERROR: Could not find hand_landmarker.task file.")
        return []

    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.3,
        min_hand_presence_confidence=0.3,
        min_tracking_confidence=0.3
    )
    landmarker = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(video_path)
    landmarks_list = []
    frame_count = 0
    extracted_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or extracted_count >= max_samples:
            break
            
        frame_count += 1
        if frame_count % 2 != 0:
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = landmarker.detect(mp_image)

        if result.hand_landmarks:
            hand_landmarks = result.hand_landmarks[0]
            wrist = hand_landmarks[0]
            row = []
            for lm in hand_landmarks:
                row.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])
            
            if label:
                row.append(label)
            landmarks_list.append(row)
            extracted_count += 1

    cap.release()
    print(f"Extracted {len(landmarks_list)} hand landmark frames from '{os.path.basename(video_path)}'")
    return landmarks_list

def process_video_folder_and_train(video_folder="data/videos", csv_output="data/isl_landmarks.csv"):
    """
    Processes all videos in video_folder (named A.mp4, B.mp4, or A_sign.mp4),
    extracts landmarks into CSV, and trains the PyTorch SignClassifier model.
    """
    os.makedirs(video_folder, exist_ok=True)
    os.makedirs(os.path.dirname(csv_output), exist_ok=True)
    os.makedirs("models", exist_ok=True)

    video_files = [f for f in os.listdir(video_folder) if f.endswith(('.mp4', '.avi', '.mov', '.mkv'))]
    
    if not video_files:
        print(f"\n=======================================================")
        print(f"[!] NO VIDEOS FOUND IN '{video_folder}'")
        print(f"=======================================================")
        print(f"To train the PyTorch model on your YouTube video:")
        print(f"1. Download your video into: {os.path.abspath(video_folder)}")
        print(f"2. Rename video files to match letter names (e.g. A.mp4, B.mp4 ... Z.mp4)")
        print(f"   OR put individual letter videos inside {video_folder}")
        print(f"3. Run training: python app/ml/train_from_video.py\n")
        return

    all_landmarks = []
    
    for vf in video_files:
        # Determine label from filename (e.g. A.mp4 -> 'A', B_test.mp4 -> 'B')
        base_name = os.path.splitext(vf)[0].upper()
        label = base_name.split('_')[0]
        
        video_path = os.path.join(video_folder, vf)
        landmarks = extract_landmarks_from_video(video_path, label=label)
        all_landmarks.extend(landmarks)

    if not all_landmarks:
        print("No valid hand landmarks were detected in the videos. Make sure hands are clearly visible!")
        return

    # Columns: x0, y0, z0 ... x20, y20, z20, label
    columns = [f"lm_{i}_{c}" for i in range(21) for c in ['x', 'y', 'z']] + ['label']
    df = pd.DataFrame(all_landmarks, columns=columns)
    
    # Merge with existing dataset if present
    if os.path.exists(csv_output):
        try:
            existing_df = pd.read_csv(csv_output)
            df = pd.concat([existing_df, df], ignore_index=True)
            print(f"Merged with existing dataset ({len(existing_df)} previous rows).")
        except Exception as e:
            print(f"Notice: {e}")

    df.to_csv(csv_output, index=False)
    print(f"Saved total {len(df)} landmark samples to '{csv_output}'.")

    # Train PyTorch Model
    print("\n--- TRAINING PYTORCH MODEL ON NEW VIDEO DATA ---")
    from app.ml.train import train_model
    train_model()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract landmarks from videos and train PyTorch ASL model")
    parser.add_argument("--folder", type=str, default="data/videos", help="Folder containing sign videos")
    args = parser.parse_args()
    
    process_video_folder_and_train(video_folder=args.folder)
