import os
import sys
import cv2
import json
import time
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.services.sign_service import get_asset_path

BASE_DATASET_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../data/dynamic_signs")
)

def init_landmarker():
    task_model_path = get_asset_path('hand_landmarker.task')
    base_options = python.BaseOptions(model_asset_path=task_model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=2,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )
    return vision.HandLandmarker.create_from_options(options)

def extract_landmarks_from_video(video_path: str, label: str, clip_duration_frames: int = 30) -> int:
    """
    Extracts landmark sequence JSON files from an MP4/WEBM video file.
    """
    label_upper = label.upper().replace(" ", "_")
    output_dir = os.path.join(BASE_DATASET_DIR, label_upper)
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return 0

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video stream from {video_path}")
        return 0

    landmarker = init_landmarker()

    sequence_buffer = []
    saved_count = 0
    frame_idx = 0

    print(f"Processing video '{video_path}' for label '{label_upper}'...")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        try:
            res = landmarker.detect(mp_image)
            if res.hand_landmarks and len(res.hand_landmarks) > 0:
                hand = res.hand_landmarks[0]
                landmarks = [[lm.x, lm.y, lm.z] for lm in hand]
                sequence_buffer.append({"landmarks": landmarks})

                if len(sequence_buffer) >= clip_duration_frames:
                    timestamp = int(time.time() * 1000) + saved_count
                    filename = f"seq_vid_{timestamp}.json"
                    file_path = os.path.join(output_dir, filename)

                    seq_data = {
                        "label": label_upper,
                        "human_readable_label": label,
                        "timestamp": timestamp,
                        "frame_count": len(sequence_buffer),
                        "frames": list(sequence_buffer)
                    }

                    with open(file_path, "w", encoding="utf-8") as f:
                        json.dump(seq_data, f, indent=2)

                    saved_count += 1
                    # Sliding step by 15 frames for 50% overlap data augmentation!
                    sequence_buffer = sequence_buffer[15:]
            else:
                # Reset buffer if hand lost for 5+ consecutive frames
                if len(sequence_buffer) > 0:
                    sequence_buffer = []

        except Exception as e:
            print(f"Frame {frame_idx} error: {e}")

    cap.release()
    print(f"Successfully extracted {saved_count} landmark sequences for {label_upper} from video!")
    return saved_count

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_video_dataset.py <video_path> <label>")
        print("Example: python extract_video_dataset.py samples/hello.mp4 HELLO")
    else:
        vpath = sys.argv[1]
        vlabel = sys.argv[2]
        extract_landmarks_from_video(vpath, vlabel)
