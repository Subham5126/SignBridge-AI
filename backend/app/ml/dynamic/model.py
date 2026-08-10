import torch
import torch.nn as nn
import torch.nn.functional as F

class DynamicSignLSTM(nn.Module):
    """
    Temporal Neural Network for Dynamic Sign Phrase Recognition.
    Input: (batch_size, sequence_length=30, input_dim=126)
    Output: (batch_size, num_classes)
    """
    def __init__(self, input_dim: int = 126, hidden_dim: int = 64, num_classes: int = 2, dropout: float = 0.1):
        super(DynamicSignLSTM, self).__init__()
        flat_dim = 30 * input_dim  # 3780 temporal features
        self.fc1 = nn.Linear(flat_dim, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, num_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x shape: (batch_size, 30, 126)
        flat_x = x.view(x.size(0), -1)  # (batch_size, 3780)
        out = F.relu(self.fc1(flat_x))
        out = self.dropout(out)
        out = F.relu(self.fc2(out))
        logits = self.fc3(out)
        return logits
