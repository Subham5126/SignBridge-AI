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
                {"role": "system", "content": "You are an expert Sign Language Assistant. The user input contains raw recognized sign letters or broken words. Transform it into a grammatically correct, natural English sentence. Capitalize appropriately and fix typos or missed letters if context allows. Output only the final corrected sentence without explanations or quotes."},
                {"role": "user", "content": raw_text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return f"[Error connecting to AI] {raw_text.capitalize()}."

