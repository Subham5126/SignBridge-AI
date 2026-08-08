import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.sign_service import predict_gesture

router = APIRouter()

@router.websocket("/ws/recognize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    latest_frame = None
    frame_event = asyncio.Event()
    disconnected = False

    async def receiver():
        nonlocal latest_frame, disconnected

        try:
            while True:
                data = await websocket.receive_text()

                # IMPORTANT:
                # Replace any old frame with the newest frame.
                # Never build a queue of stale camera frames.
                latest_frame = data
                frame_event.set()

        except WebSocketDisconnect:
            disconnected = True
            frame_event.set()

    async def processor():
        nonlocal latest_frame

        while not disconnected:
            await frame_event.wait()

            if disconnected:
                break

            # Take ONLY the latest frame.
            data = latest_frame
            latest_frame = None
            frame_event.clear()

            if data is None:
                continue

            try:
                result = await asyncio.to_thread(
                    predict_gesture,
                    data
                )

                # If newer frames arrived while inference was running,
                # their latest result will be processed next.
                await websocket.send_json(result)

            except Exception as e:
                print(f"Recognition error: {e}")

    receiver_task = asyncio.create_task(receiver())
    processor_task = asyncio.create_task(processor())

    try:
        await receiver_task
    except WebSocketDisconnect:
        pass
    finally:
        receiver_task.cancel()
        processor_task.cancel()

        await asyncio.gather(
            receiver_task,
            processor_task,
            return_exceptions=True
        )
