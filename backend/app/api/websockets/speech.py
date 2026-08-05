from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.services.speech_service import process_audio

router = APIRouter()

@router.websocket("/ws/speech")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive audio chunk
            audio_chunk = await websocket.receive_bytes()
            
            # Process with Whisper (async)
            transcript = await asyncio.to_thread(process_audio, audio_chunk)
            
            if transcript:
                await websocket.send_json({"text": transcript})
            
    except WebSocketDisconnect:
        print("Client disconnected from /ws/speech")
