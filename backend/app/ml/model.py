import torch
import torch.nn as nn
import torch.nn.functional as F

class SignClassifier(nn.Module):
    def __init__(self, input_size=63, num_classes=3):
        """
        Lightweight MLP for Sign Language Classification.
        input_size: 21 landmarks * 3 coordinates (x, y, z) = 63
        """
        super(SignClassifier, self).__init__()
        
        self.fc1 = nn.Linear(input_size, 128)
        self.bn1 = nn.BatchNorm1d(128)
        self.dropout1 = nn.Dropout(0.3)
        
        self.fc2 = nn.Linear(128, 64)
        self.bn2 = nn.BatchNorm1d(64)
        self.dropout2 = nn.Dropout(0.2)
        
        self.fc3 = nn.Linear(64, num_classes)
        
    def forward(self, x):
        # Forward pass with ReLU activation, BatchNorm, and Dropout
        x = F.relu(self.bn1(self.fc1(x)))
        x = self.dropout1(x)
        
        x = F.relu(self.bn2(self.fc2(x)))
        x = self.dropout2(x)
        
        # We don't apply softmax here because we will use CrossEntropyLoss
        # during training, which applies LogSoftmax internally.
        x = self.fc3(x)
        return x
