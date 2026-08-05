import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import json
import os

from app.ml.model import SignClassifier

class ISLDataset(Dataset):
    def __init__(self, csv_path):
        self.data = pd.read_csv(csv_path)
        
        # Extract features (first 63 columns) and labels (last column)
        self.X = self.data.iloc[:, :-1].values.astype(np.float32)
        
        # Convert string labels to integers
        labels = self.data.iloc[:, -1].values
        
        # Create a mapping of string -> int
        self.classes = sorted(list(set(labels)))
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}
        self.idx_to_class = {i: c for i, c in enumerate(self.classes)}
        
        self.y = np.array([self.class_to_idx[label] for label in labels], dtype=np.int64)
        
        # Save mapping for inference
        os.makedirs("models", exist_ok=True)
        with open("models/class_mapping.json", "w") as f:
            json.dump(self.idx_to_class, f)
            
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return torch.tensor(self.X[idx]), torch.tensor(self.y[idx])

def train_model():
    print("--- STARTING PYTORCH TRAINING ---")
    
    # Load data
    csv_path = "data/isl_landmarks.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Run data_collection.py first.")
        return
        
    dataset = ISLDataset(csv_path)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    print(f"Loaded {len(dataset)} samples.")
    print(f"Classes: {dataset.classes}")
    
    # Initialize Model, Loss, Optimizer
    model = SignClassifier(input_size=63, num_classes=len(dataset.classes))
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Training Loop
    epochs = 50
    model.train()
    
    for epoch in range(epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, labels in dataloader:
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            # Backward pass and optimize
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
            # Calculate accuracy
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
        epoch_loss = running_loss / len(dataloader)
        epoch_acc = 100 * correct / total
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch+1}/{epochs}], Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.2f}%")
            
    # Save Model
    model_path = "models/sign_model.pt"
    torch.save(model.state_dict(), model_path)
    print(f"\nTraining Complete! Model weights saved to {model_path}")
    print("You can now restart your FastAPI server to use the trained PyTorch model.")

if __name__ == "__main__":
    train_model()
