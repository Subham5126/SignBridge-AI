import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader
import numpy as np

from app.ml.dynamic.preprocess import load_dataset, LABEL_MAP
from app.ml.dynamic.model import DynamicSignLSTM

MODELS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../models")
)

def train_dynamic_model(epochs: int = 80, batch_size: int = 16, lr: float = 0.002):
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    print("Loading dataset for dynamic sign training...")
    X, y, inv_label_map = load_dataset()

    if len(X) == 0:
        print("ERROR: No dataset samples found in backend/data/dynamic_signs/")
        print("Please collect landmark sequences using /app/dataset recorder first.")
        return False

    print(f"Dataset shape: X = {X.shape}, y = {y.shape}")

    # Convert to PyTorch Tensors
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)

    # Dataset & DataLoader
    dataset = TensorDataset(X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    num_classes = max(2, len(inv_label_map))
    model = DynamicSignLSTM(input_dim=126, hidden_dim=64, num_classes=num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    model.train()

    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, targets in loader:
            inputs, targets = inputs.to(device), targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs, 1)
            total += targets.size(0)
            correct += (predicted == targets).sum().item()

        scheduler.step()
        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100.0

        if epoch % 10 == 0 or epoch == epochs:
            print(f"Epoch [{epoch}/{epochs}] - Loss: {epoch_loss:.4f} | Accuracy: {epoch_acc:.2f}%")

    # Save model weights
    model_path = os.path.join(MODELS_DIR, "dynamic_sign_model.pt")
    torch.save(model.state_dict(), model_path)
    print(f"Successfully saved PyTorch model to {model_path}")

    # Save labels JSON
    labels_path = os.path.join(MODELS_DIR, "dynamic_labels.json")
    labels_dict = {str(k): v.replace("_", " ") for k, v in inv_label_map.items()}
    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump(labels_dict, f, indent=2)
    print(f"Successfully saved labels to {labels_path}")

    return True

if __name__ == "__main__":
    train_dynamic_model()
