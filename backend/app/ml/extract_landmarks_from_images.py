"""
extract_landmarks_from_images.py

Converts an image-based sign language dataset (from Kaggle or any folder)
into the landmark CSV format that train.py expects.

Expected folder structure:
    dataset/
        HELLO/
            img1.jpg
            img2.jpg
        THANK_YOU/
            img1.jpg
        PLEASE/
            img1.jpg
        ...

Usage:
    python -m app.ml.extract_landmarks_from_images --dataset path/to/dataset
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import pandas as pd
import os
import argparse
import glob

def find_model():
    """Find hand_landmarker.task in common locations."""
    candidates = [
        'hand_landmarker.task',
        '../hand_landmarker.task',
        os.path.join(os.path.dirname(__file__), '../../hand_landmarker.task'),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def extract_landmarks_from_dataset(dataset_path: str, output_csv: str = 'data/isl_landmarks.csv', max_per_class: int = 0):
    print(f"\n--- LANDMARK EXTRACTION FROM IMAGE DATASET ---")
    print(f"Dataset: {dataset_path}")

    model_path = find_model()
    if not model_path:
        print("ERROR: Could not find hand_landmarker.task file.")
        return

    print(f"Using model: {model_path}")

    # Init MediaPipe HandLandmarker in static image mode
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.3,  # Lower threshold for dataset images
        min_hand_presence_confidence=0.3,
        min_tracking_confidence=0.3
    )
    landmarker = vision.HandLandmarker.create_from_options(options)

    # Discover class folders
    class_dirs = [d for d in os.listdir(dataset_path) 
                  if os.path.isdir(os.path.join(dataset_path, d))]
    
    if not class_dirs:
        print(f"ERROR: No subdirectories found in {dataset_path}")
        print("Expected structure: dataset/CLASS_NAME/image.jpg")
        return

    print(f"Found {len(class_dirs)} classes: {class_dirs}\n")

    dataset = []
    total_processed = 0
    total_failed = 0

    for class_name in sorted(class_dirs):
        class_path = os.path.join(dataset_path, class_name)
        
        # Support jpg, jpeg, png, bmp
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp', '*.JPG', '*.PNG']:
            image_files.extend(glob.glob(os.path.join(class_path, ext)))

        if not image_files:
            print(f"  [SKIP] {class_name}: no images found")
            continue

        if max_per_class > 0 and len(image_files) > max_per_class:
            image_files = image_files[:max_per_class]

        class_success = 0
        
        for img_path in image_files:
            try:
                # Read and convert image
                frame = cv2.imread(img_path)
                if frame is None:
                    continue
                
                # Resize to reasonable size for MediaPipe (improves speed)
                frame = cv2.resize(frame, (640, 480))
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
                result = landmarker.detect(mp_image)

                if result.hand_landmarks:
                    hand = result.hand_landmarks[0]
                    
                    # Flatten 21 landmarks × 3 = 63 features (wrist-relative)
                    wrist = hand[0]
                    row = []
                    for lm in hand:
                        row.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])
                    
                    # Normalize label: replace underscores and uppercased
                    label = class_name.upper().replace('_', ' ')
                    row.append(label)
                    dataset.append(row)
                    class_success += 1
                    total_processed += 1
                else:
                    total_failed += 1

            except Exception as e:
                total_failed += 1
                continue

        print(f"  [OK] {class_name}: {class_success}/{len(image_files)} images extracted")

    if not dataset:
        print("\nERROR: No landmarks were extracted from any images.")
        print("Make sure your images clearly show a hand in good lighting.")
        return

    # Build DataFrame and save
    columns = []
    for i in range(21):
        columns.extend([f"lm_{i}_x", f"lm_{i}_y", f"lm_{i}_z"])
    columns.append("label")

    df = pd.DataFrame(dataset, columns=columns)
    
    os.makedirs(os.path.dirname(output_csv) if os.path.dirname(output_csv) else '.', exist_ok=True)
    df.to_csv(output_csv, index=False)

    print(f"\n--- DONE ---")
    print(f"Total extracted: {total_processed} landmarks")
    print(f"Total failed (no hand detected): {total_failed}")
    print(f"Dataset saved to: {output_csv}")
    print(f"\nClass distribution:")
    print(df['label'].value_counts().to_string())
    print(f"\nNow run: python -m app.ml.train")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract MediaPipe landmarks from image dataset')
    parser.add_argument('--dataset', required=True, help='Path to dataset root folder (with class subfolders)')
    parser.add_argument('--output', default='data/isl_landmarks.csv', help='Output CSV path')
    parser.add_argument('--max_per_class', type=int, default=0, help='Max images to process per class (0 = all)')
    args = parser.parse_args()
    
    extract_landmarks_from_dataset(args.dataset, args.output, args.max_per_class)
