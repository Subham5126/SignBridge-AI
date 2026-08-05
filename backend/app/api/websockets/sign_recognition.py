import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.services.sign_service import predict_gesture

router = APIRouter()

@router.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive frame data (e.g., base64 string or binary)
            data = await websocket.receive_text()
            
            # Predict gesture using MediaPipe + PyTorch
            # This is non-blocking to allow continuous streaming
            # In production, use asyncio.to_thread or process pool for CPU intensive tasks
            result = await asyncio.to_thread(predict_gesture, data)
            
            # Send prediction back to client
            await websocket.send_json(result)
            
    except WebSocketDisconnect:
        print("Client disconnected from /ws/recognize")
