from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.llm_service import correct_sentence, ask_asl_tutor

router = APIRouter()

class SentenceRequest(BaseModel):
    raw_text: str

class SentenceResponse(BaseModel):
    corrected_text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class TutorRequest(BaseModel):
    user_query: str
    chat_history: Optional[List[ChatMessage]] = []

class TutorResponse(BaseModel):
    response_text: str

@router.post("/correct", response_model=SentenceResponse)
async def correct_nlp_sentence(request: SentenceRequest):
    """
    Endpoint to process a sequence of signs and return a natural sentence.
    """
    corrected = correct_sentence(request.raw_text)
    return SentenceResponse(corrected_text=corrected)

@router.post("/tutor", response_model=TutorResponse)
async def ask_tutor_endpoint(request: TutorRequest):
    """
    Endpoint for AI ASL Tutor queries.
    """
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.chat_history] if request.chat_history else []
    reply = ask_asl_tutor(request.user_query, history_dicts)
    return TutorResponse(response_text=reply)
