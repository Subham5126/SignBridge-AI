from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import correct_sentence

router = APIRouter()

class SentenceRequest(BaseModel):
    raw_text: str

class SentenceResponse(BaseModel):
    corrected_text: str

@router.post("/correct", response_model=SentenceResponse)
async def correct_nlp_sentence(request: SentenceRequest):
    """
    Endpoint to process a sequence of signs and return a natural sentence.
    """
    corrected = correct_sentence(request.raw_text)
    return SentenceResponse(corrected_text=corrected)
