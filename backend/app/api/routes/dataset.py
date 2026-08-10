import os
import json
import time
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

VALID_LABELS = {
    "HELLO": "HELLO",
    "THANK_YOU": "THANK YOU",
    "HOW_ARE_YOU": "HOW ARE YOU",
    "I_NEED_HELP": "I NEED HELP",
    "GOOD_MORNING": "GOOD MORNING"
}

BASE_DATASET_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../data/dynamic_signs")
)

class FrameLandmarks(BaseModel):
    landmarks: List[List[float]] # 21 [x, y, z] points

class SequencePayload(BaseModel):
    label: str
    frames: List[FrameLandmarks]

@router.post("/save-sequence")
def save_sequence(payload: SequencePayload):
    label = payload.label.upper().replace(" ", "_")
    if label not in VALID_LABELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid label '{payload.label}'. Must be one of {list(VALID_LABELS.keys())}"
        )

    if not payload.frames or len(payload.frames) < 5:
        raise HTTPException(
            status_code=400,
            detail="Sequence too short. Must contain at least 5 frames."
        )

    label_dir = os.path.join(BASE_DATASET_DIR, label)
    os.makedirs(label_dir, exist_ok=True)

    timestamp = int(time.time() * 1000)
    filename = f"sequence_{timestamp}.json"
    file_path = os.path.join(label_dir, filename)

    sequence_data = {
        "label": label,
        "human_readable_label": VALID_LABELS[label],
        "timestamp": timestamp,
        "frame_count": len(payload.frames),
        "frames": [f.dict() for f in payload.frames]
    }

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(sequence_data, f, indent=2)

    return {
        "status": "success",
        "message": f"Saved {len(payload.frames)} frames for {label}",
        "file": filename,
        "label": label
    }

@router.get("/stats")
def get_dataset_stats():
    os.makedirs(BASE_DATASET_DIR, exist_ok=True)
    stats = {}

    for key in VALID_LABELS.keys():
        label_dir = os.path.join(BASE_DATASET_DIR, key)
        if os.path.exists(label_dir):
            files = [f for f in os.listdir(label_dir) if f.endswith(".json")]
            stats[key] = len(files)
        else:
            stats[key] = 0

    total_sequences = sum(stats.values())
    return {
        "total_sequences": total_sequences,
        "by_label": stats,
        "target_per_label": 50
    }

class FrameExtractPayload(BaseModel):
    image_b64: str

@router.post("/extract-frame-landmarks")
def extract_frame_landmarks(payload: FrameExtractPayload):
    from app.services.sign_service import extract_landmarks_from_base64
    landmarks = extract_landmarks_from_base64(payload.image_b64)
    return {
        "has_hand": len(landmarks) == 21,
        "landmarks": landmarks
    }
