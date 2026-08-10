import os
import json
import time
import numpy as np

BASE_DATASET_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../data/dynamic_signs")
)

def generate_hello_sequence(sample_idx: int) -> dict:
    """
    Generates realistic 30-frame sequence for HELLO (waving motion side-to-side near face).
    """
    frames = []
    # Add random variations per sample
    wave_freq = 0.35 + np.random.uniform(-0.05, 0.05)
    wave_amp = 0.18 + np.random.uniform(-0.03, 0.03)
    base_y = -0.15 + np.random.uniform(-0.02, 0.02)

    for t in range(30):
        wrist_x = wave_amp * np.sin(wave_freq * t)
        wrist_y = base_y + 0.02 * np.cos(0.2 * t)
        wrist_z = 0.0

        landmarks = []
        # Wrist (0)
        landmarks.append([wrist_x, wrist_y, wrist_z])

        # 20 hand finger joints relative to wrist
        for i in range(1, 21):
            finger_grp = (i - 1) // 4
            joint_in_finger = (i - 1) % 4 + 1

            # Fingers extend upward and sway during wave
            offset_x = (finger_grp - 2) * 0.04 + 0.03 * np.sin(wave_freq * t + finger_grp * 0.2)
            offset_y = -0.05 * joint_in_finger + 0.01 * np.cos(wave_freq * t)
            offset_z = 0.01 * joint_in_finger

            landmarks.append([wrist_x + offset_x, wrist_y + offset_y, wrist_z + offset_z])

        frames.append({"landmarks": landmarks})

    return {
        "label": "HELLO",
        "human_readable_label": "HELLO",
        "timestamp": int(time.time() * 1000) + sample_idx,
        "frame_count": 30,
        "frames": frames
    }

def generate_thank_you_sequence(sample_idx: int) -> dict:
    """
    Generates realistic 30-frame sequence for THANK YOU (chin-to-chest forward palm movement).
    """
    frames = []
    start_y = -0.28 + np.random.uniform(-0.02, 0.02)
    end_y = 0.05 + np.random.uniform(-0.02, 0.02)
    speed = np.random.uniform(0.9, 1.1)

    for t in range(30):
        progress = (t / 29.0) * speed
        progress = min(1.0, progress)

        wrist_x = 0.02 * np.sin(progress * np.pi)
        wrist_y = start_y + (end_y - start_y) * progress
        wrist_z = 0.08 * progress  # Moves forward toward camera

        landmarks = []
        # Wrist (0)
        landmarks.append([wrist_x, wrist_y, wrist_z])

        # 20 hand finger joints relative to wrist (palm facing inward then outward)
        for i in range(1, 21):
            finger_grp = (i - 1) // 4
            joint_in_finger = (i - 1) % 4 + 1

            offset_x = (finger_grp - 2) * 0.035
            offset_y = -0.04 * joint_in_finger - 0.02 * progress
            offset_z = 0.02 * joint_in_finger + 0.03 * progress

            landmarks.append([wrist_x + offset_x, wrist_y + offset_y, wrist_z + offset_z])

        frames.append({"landmarks": landmarks})

    return {
        "label": "THANK_YOU",
        "human_readable_label": "THANK YOU",
        "timestamp": int(time.time() * 1000) + sample_idx,
        "frame_count": 30,
        "frames": frames
    }

def generate_dataset(num_samples_per_class: int = 50):
    hello_dir = os.path.join(BASE_DATASET_DIR, "HELLO")
    thank_you_dir = os.path.join(BASE_DATASET_DIR, "THANK_YOU")
    os.makedirs(hello_dir, exist_ok=True)
    os.makedirs(thank_you_dir, exist_ok=True)

    print(f"Generating {num_samples_per_class} natural gesture sequences for HELLO and THANK YOU...")

    for i in range(num_samples_per_class):
        hello_seq = generate_hello_sequence(i)
        with open(os.path.join(hello_dir, f"seq_natural_hello_{i+1:03d}.json"), "w", encoding="utf-8") as f:
            json.dump(hello_seq, f, indent=2)

        thank_you_seq = generate_thank_you_sequence(i)
        with open(os.path.join(thank_you_dir, f"seq_natural_thank_you_{i+1:03d}.json"), "w", encoding="utf-8") as f:
            json.dump(thank_you_seq, f, indent=2)

    print(f"Successfully generated dataset with {num_samples_per_class * 2} total sequences!")

if __name__ == "__main__":
    generate_dataset(50)
