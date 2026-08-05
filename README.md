# 🤟 SignBridge AI — Real-Time Sign Language Recognition Platform

A full-stack AI-powered platform that translates **ASL (American Sign Language) hand gestures** into text in real time using a webcam. Built with React, FastAPI, MediaPipe, and PyTorch.

---

## 🎯 Features

| Feature | Status |
|---|---|
| **Real-Time Sign-to-Text** | ✅ Working |
| **ASL Alphabet Recognition (A–Z)** | ✅ Trained on 87k+ images |
| **Hand Landmark Visualization** | ✅ Skeleton overlay on webcam |
| **AI Sentence Correction** | ✅ GPT-4o-mini integration |
| **Speech Mode (Whisper STT)** | 🔜 Placeholder |
| **Text-to-Sign Conversion** | 🔜 Placeholder |
| **Learning Mode** | 🔜 Placeholder |
| **User Auth & Stats (Supabase)** | 🔜 Placeholder |

---

## 🏗️ Project Structure

```
SignConnect/
├── src/                          # Frontend (React + Vite)
│   ├── components/
│   │   ├── features/             # Feature components
│   │   │   ├── SignRecognitionCamera.jsx
│   │   │   ├── TextToSign.jsx
│   │   │   ├── SpeechMode.jsx
│   │   │   ├── TwoWayConversation.jsx
│   │   │   └── LearningMode.jsx
│   │   ├── layout/               # App shell / navigation
│   │   └── ui/                   # Reusable UI primitives
│   ├── pages/                    # Route-level pages
│   ├── stores/                   # Zustand state management
│   ├── data/                     # Static data (sign dictionary)
│   ├── App.jsx                   # Router & layout
│   ├── main.jsx                  # Vite entry point
│   └── index.css                 # Global styles
│
├── backend/                      # Backend (FastAPI + Python)
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/           # REST endpoints
│   │   │   │   ├── nlp.py        # AI sentence correction
│   │   │   │   └── stats.py      # User statistics
│   │   │   └── websockets/       # WebSocket endpoints
│   │   │       ├── sign_recognition.py
│   │   │       └── speech.py
│   │   ├── core/
│   │   │   └── config.py         # App settings (Pydantic)
│   │   ├── ml/                   # Machine Learning pipeline
│   │   │   ├── model.py          # PyTorch MLP architecture
│   │   │   ├── train.py          # Training script
│   │   │   ├── data_collection.py            # Webcam data recorder
│   │   │   └── extract_landmarks_from_images.py  # Kaggle dataset converter
│   │   ├── services/             # Business logic
│   │   │   ├── sign_service.py   # MediaPipe + PyTorch inference
│   │   │   ├── llm_service.py    # OpenAI GPT integration
│   │   │   └── speech_service.py # Whisper STT (placeholder)
│   │   └── main.py               # FastAPI app entry point
│   ├── data/                     # Training data (gitignored)
│   ├── models/                   # Trained model weights (gitignored)
│   ├── hand_landmarker.task      # MediaPipe model (gitignored)
│   ├── requirements.txt
│   └── .env                      # API keys (gitignored)
│
├── public/                       # Static assets
├── index.html                    # Vite HTML entry
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **pip** (Python package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SignConnect.git
cd SignConnect
```

### 2. Frontend Setup

```bash
npm install
npm run dev
# → http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Download Required Files

These files are **not included in the repo** due to size. Download them manually:

| File | Where to Place | Download |
|---|---|---|
| `hand_landmarker.task` | `backend/` | [MediaPipe Models](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker#models) |
| ASL Alphabet Dataset | `backend/data/dataset/` | [Kaggle ASL Alphabet](https://www.kaggle.com/datasets/grassknoted/asl-alphabet) |

### 5. Train the Model

```bash
cd backend

# Extract landmarks from dataset images
python -m app.ml.extract_landmarks_from_images --dataset data/dataset/asl_alphabet_train/asl_alphabet_train

# Train the PyTorch model
python -m app.ml.train
```

### 6. Set Up Environment Variables

Create `backend/.env`:

```env
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### 7. Run the Backend

```bash
cd backend
uvicorn app.main:app --reload
# → http://localhost:8000
```

### 8. Open the App

Visit `http://localhost:5173`, allow camera access, and start signing!

---

## 🧠 How It Works

```
Webcam Frame → MediaPipe Hand Landmarker → 21 landmarks (63 floats)
    → PyTorch MLP Classifier → Predicted Letter (A–Z / SPACE / DEL)
    → Hold-to-Confirm (1s hold) → Append to text
    → (Optional) GPT-4o-mini → Corrected sentence
```

### ML Pipeline

1. **Data**: ASL Alphabet dataset (87k images, 29 classes: A–Z + SPACE + DEL + NOTHING)
2. **Feature Extraction**: MediaPipe extracts 21 hand landmarks (x, y, z) = 63 features per image
3. **Model**: 3-layer MLP with BatchNorm + Dropout (63 → 128 → 64 → 29)
4. **Inference**: Real-time via WebSocket, ~10 FPS frame processing

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Zustand, Framer Motion, TailwindCSS 4 |
| **Backend** | FastAPI, Uvicorn, WebSockets |
| **ML / AI** | MediaPipe, PyTorch, OpenAI GPT-4o-mini |
| **UI** | Radix UI, Lucide Icons, Recharts |

---

## 👥 Team

Built by **Team SignConnect** as a college project.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
