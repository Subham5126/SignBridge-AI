from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import routers
from app.api.routes import nlp, stats, auth, dataset
from app.api.websockets import sign_recognition, speech

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for SignBridge AI Platform",
    version="1.0.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(nlp.router, prefix=f"{settings.API_V1_STR}/nlp", tags=["NLP"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["Stats"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(dataset.router, prefix=f"{settings.API_V1_STR}/dataset", tags=["Dataset"])

# WebSocket Routers
app.include_router(sign_recognition.router, tags=["WebSockets (Sign)"])
app.include_router(speech.router, tags=["WebSockets (Speech)"])

@app.get("/")
def root():
    return {"message": "Welcome to SignBridge AI Backend"}
