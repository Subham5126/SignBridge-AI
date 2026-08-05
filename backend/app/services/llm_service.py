import openai
from app.core.config import settings
import os

def correct_sentence(raw_text: str) -> str:
    """
    Takes a raw sequence of signs and uses an LLM (e.g. OpenAI GPT-4)
    to form a grammatically correct, context-aware sentence.
    """
    if not raw_text:
        return ""
        
    if not settings.OPENAI_API_KEY:
        # Fallback if no key is provided
        return f"[Mock] {raw_text.capitalize()}."

    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a sign language translator. Convert the given sequence of broken words/signs into a grammatically correct and natural English sentence. Do not add any conversational filler. Only return the translated sentence."},
                {"role": "user", "content": raw_text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return f"[Error connecting to AI] {raw_text.capitalize()}."

