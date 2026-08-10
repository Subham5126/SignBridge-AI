import os
import json
import torch
import torch.nn.functional as F
import numpy as np
from typing import List, Dict, Any, Optional

from app.ml.dynamic.model import DynamicSignLSTM
from app.ml.dynamic.preprocess import normalize_landmarks_frame, pad_or_truncate_sequence

MODELS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../models")
)

class DynamicSignService:
    def __init__(self):
        self.model: Optional[DynamicSignLSTM] = None
        self.labels: Dict[str, str] = {}
        self.is_loaded = False
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.load_model()

    def load_model(self):
        model_path = os.path.join(MODELS_DIR, "dynamic_sign_model.pt")
        labels_path = os.path.join(MODELS_DIR, "dynamic_labels.json")

        if not os.path.exists(model_path) or not os.path.exists(labels_path):
            print("INFO: Dynamic sign model file not found. Dynamic recognition running in fallback mode.")
            self.is_loaded = False
            return

        try:
            with open(labels_path, "r", encoding="utf-8") as f:
                self.labels = json.load(f)

            num_classes = len(self.labels) if self.labels else 5
            self.model = DynamicSignLSTM(input_dim=126, hidden_dim=64, num_classes=num_classes)
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            print("Successfully loaded PyTorch DynamicSignLSTM model!")
        except Exception as e:
            print(f"Error loading DynamicSignLSTM model: {e}")
            self.is_loaded = False

    def predict_sequence(self, raw_frames: List[List[List[float]]]) -> Dict[str, Any]:
        """
        Runs sliding-window PyTorch inference on a 30-frame sequence.
        """
        if not self.is_loaded or self.model is None:
            return {
                "available": False,
                "error": "Dynamic phrase model is not available yet.",
                "sign": None,
                "confidence": 0.0
            }

        if len(raw_frames) < 10:
            return {
                "available": True,
                "sign": None,
                "confidence": 0.0,
                "progress": len(raw_frames) / 30.0
            }

        seq = pad_or_truncate_sequence(raw_frames, target_len=30)  # (30, 126)

        # Check motion energy (velocity features are indices 63 to 126)
        velocities = seq[:, 63:]
        motion_energy = float(np.mean(np.abs(velocities)))

        # If hand is static (holding still) or motion is negligible, return neutral state
        if motion_energy < 0.006:
            return {
                "available": True,
                "sign": None,
                "confidence": 0.0,
                "motion_energy": motion_energy,
                "progress": min(1.0, len(raw_frames) / 30.0)
            }

        input_tensor = torch.tensor(seq, dtype=torch.float32).unsqueeze(0).to(self.device)  # (1, 30, 126)

        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = F.softmax(logits, dim=1)[0]
            confidence, predicted_idx = torch.max(probs, dim=0)

        conf_val = float(confidence.item())
        pred_key = str(int(predicted_idx.item()))
        raw_label = self.labels.get(pred_key, "UNKNOWN")

        # Format label to clean human-readable phrase ("THANK_YOU" -> "THANK YOU")
        predicted_label = raw_label.replace("_", " ")

        return {
            "available": True,
            "sign": predicted_label if conf_val >= 0.70 else None,
            "confidence": round(conf_val, 4),
            "raw_label": predicted_label,
            "motion_energy": motion_energy,
            "progress": min(1.0, len(raw_frames) / 30.0)
        }

# Global singleton instance
dynamic_service = DynamicSignService()
