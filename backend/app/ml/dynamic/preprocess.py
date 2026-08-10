import os
import json
import numpy as np
from typing import Tuple, List, Dict

DATASET_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../data/dynamic_signs")
)

LABEL_MAP = {
    "HELLO": 0,
    "THANK_YOU": 1,
    "HOW_ARE_YOU": 2,
    "I_NEED_HELP": 3,
    "GOOD_MORNING": 4
}

SEQUENCE_LENGTH = 30  # Fixed 30 frames per sample
LANDMARK_DIM = 126    # 63 spatial coordinates + 63 motion velocities

def normalize_landmarks_frame(landmarks: List[List[float]]) -> np.ndarray:
    """
    Normalizes 21 3D points relative to wrist (point 0) and scales by maximum hand distance.
    """
    arr = np.array(landmarks, dtype=np.float32)
    if arr.shape[0] != 21 or arr.shape[1] < 3:
        return np.zeros((63,), dtype=np.float32)

    wrist = arr[0]
    normalized = arr - wrist

    # Scale invariance: divide by max Euclidean distance from wrist
    dists = np.linalg.norm(normalized, axis=1)
    max_dist = np.max(dists)
    if max_dist > 1e-6:
        normalized = normalized / max_dist

    return normalized.flatten()  # 63 features

def pad_or_truncate_sequence(frames_landmarks: List[List[List[float]]], target_len: int = 30) -> np.ndarray:
    """
    Extracts spatial coordinates + velocity vectors, then pads/truncates to target_len.
    """
    processed_frames = []
    prev_norm = None

    for frame in frames_landmarks:
        norm = normalize_landmarks_frame(frame)
        if prev_norm is None:
            velocity = np.zeros_like(norm)
        else:
            velocity = norm - prev_norm
        prev_norm = norm

        feat = np.hstack([norm, velocity])  # 126 features per frame
        processed_frames.append(feat)

    arr = np.array(processed_frames, dtype=np.float32)

    num_frames = arr.shape[0]
    if num_frames == 0:
        return np.zeros((target_len, LANDMARK_DIM), dtype=np.float32)

    if num_frames >= target_len:
        idx = np.linspace(0, num_frames - 1, target_len, dtype=int)
        return arr[idx]
    else:
        pad_size = target_len - num_frames
        last_frame = arr[-1:]
        padding = np.repeat(last_frame, pad_size, axis=0)
        return np.vstack([arr, padding])

def load_dataset(dataset_dir: str = DATASET_DIR) -> Tuple[np.ndarray, np.ndarray, Dict[int, str]]:
    """
    Loads all sequence JSON files from dataset_dir.
    Dynamically maps active classes present in dataset.
    """
    X_list = []
    y_list = []

    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir, exist_ok=True)
        return np.empty((0, SEQUENCE_LENGTH, LANDMARK_DIM)), np.empty((0,)), {}

    # Discover active directories with saved JSON sequences
    active_labels = []
    for entry in os.listdir(dataset_dir):
        label_path = os.path.join(dataset_dir, entry)
        if os.path.isdir(label_path):
            files = [f for f in os.listdir(label_path) if f.endswith(".json")]
            if len(files) >= 3:
                active_labels.append(entry)

    active_labels.sort()
    label_to_idx = {name: idx for idx, name in enumerate(active_labels)}
    idx_to_label = {idx: name for idx, name in enumerate(active_labels)}

    for label_name, label_idx in label_to_idx.items():
        label_path = os.path.join(dataset_dir, label_name)
        for fname in os.listdir(label_path):
            if fname.endswith(".json"):
                fpath = os.path.join(label_path, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    raw_frames = [frame.get("landmarks", []) for frame in data.get("frames", [])]
                    if len(raw_frames) >= 5:
                        seq = pad_or_truncate_sequence(raw_frames, SEQUENCE_LENGTH)
                        X_list.append(seq)
                        y_list.append(label_idx)
                except Exception as e:
                    print(f"Error loading {fpath}: {e}")

    if not X_list:
        return np.empty((0, SEQUENCE_LENGTH, LANDMARK_DIM)), np.empty((0,)), idx_to_label

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)

    return X, y, idx_to_label

if __name__ == "__main__":
    X, y, labels = load_dataset()
    print(f"Loaded dataset: X shape = {X.shape}, y shape = {y.shape}")
