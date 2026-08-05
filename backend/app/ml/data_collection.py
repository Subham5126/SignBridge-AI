import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import pandas as pd
import time
import os

# Define the signs you want to record
# To add a new sign, just add it to this list
SIGNS = ["HELLO", "THANK YOU", "PLEASE", "VICTORY", "GOOD"]
NUM_SAMPLES_PER_SIGN = 100 # How many frames to record per sign

def main():
    print("Initializing MediaPipe...")
    
    # Check if model exists in root or relative paths
    model_path = 'hand_landmarker.task'
    if not os.path.exists(model_path):
        model_path = '../hand_landmarker.task'
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), '../../hand_landmarker.task')
            if not os.path.exists(model_path):
                print("ERROR: Could not find hand_landmarker.task.")
                return

    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1, # Limit to 1 hand for simpler training
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    landmarker = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(0)
    
    dataset = []

    print("\n--- DATA COLLECTION MODE ---")
    print("Press 'q' at any time to quit.")
    
    for sign in SIGNS:
        print(f"\nGet ready to record: {sign}")
        print("Waiting 3 seconds...")
        
        # Countdown
        for i in range(3, 0, -1):
            ret, frame = cap.read()
            if not ret: continue
            
            # Draw countdown
            frame = cv2.flip(frame, 1)
            cv2.putText(frame, f"Recording '{sign}' in {i}...", (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
            cv2.imshow("Data Collection", frame)
            cv2.waitKey(1000)
            
        print(f"Recording {NUM_SAMPLES_PER_SIGN} samples for '{sign}'...")
        
        samples_collected = 0
        
        while samples_collected < NUM_SAMPLES_PER_SIGN:
            ret, frame = cap.read()
            if not ret:
                break
                
            frame = cv2.flip(frame, 1) # Mirror
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            
            # Detect landmarks
            result = landmarker.detect(mp_image)
            
            if result.hand_landmarks:
                # We extract the first hand found
                hand = result.hand_landmarks[0]
                
                # Flatten the 21 landmarks into a single array of 63 floats (x, y, z)
                row = []
                for lm in hand:
                    row.extend([lm.x, lm.y, lm.z])
                    
                # Add the label
                row.append(sign)
                dataset.append(row)
                samples_collected += 1
                
                # Draw visual feedback
                cv2.putText(frame, f"Recording {sign}: {samples_collected}/{NUM_SAMPLES_PER_SIGN}", 
                            (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                            
            else:
                cv2.putText(frame, "No hand detected!", (20, 40), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            cv2.imshow("Data Collection", frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                cap.release()
                cv2.destroyAllWindows()
                return

    cap.release()
    cv2.destroyAllWindows()
    
    print("\n--- RECORDING COMPLETE ---")
    
    # Save to CSV
    columns = []
    for i in range(21):
        columns.extend([f"lm_{i}_x", f"lm_{i}_y", f"lm_{i}_z"])
    columns.append("label")
    
    df = pd.DataFrame(dataset, columns=columns)
    
    os.makedirs("data", exist_ok=True)
    csv_path = "data/isl_landmarks.csv"
    df.to_csv(csv_path, index=False)
    
    print(f"Successfully saved {len(dataset)} samples to {csv_path}")
    print("You can now run train.py to train your model!")

if __name__ == "__main__":
    main()
