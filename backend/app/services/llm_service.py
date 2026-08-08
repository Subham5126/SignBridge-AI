import openai
import httpx
from app.core.config import settings
import os

def get_llm_client():
    """
    Returns an LLM client (Groq or OpenAI) based on available API keys.
    """
    groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

    if groq_key:
        # Use Groq (Super fast & free tier LLM)
        client = openai.OpenAI(
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1"
        )
        return client, "llama-3.3-70b-versatile"
    elif openai_key:
        # Use OpenAI
        client = openai.OpenAI(api_key=openai_key)
        return client, "gpt-4o-mini"
    
    return None, None

def correct_sentence(raw_text: str) -> str:
    """
    Takes a raw sequence of signs and uses an LLM (Groq / OpenAI)
    to form a grammatically correct, context-aware sentence.
    """
    if not raw_text:
        return ""
        
    client, model_name = get_llm_client()
    if not client:
        return f"[Mock] {raw_text.capitalize()}."

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are an expert Sign Language Assistant. Transform raw recognized sign letters or broken words into a grammatically correct, natural English sentence. Capitalize appropriately and fix typos. Output only the final sentence without quotes."},
                {"role": "user", "content": raw_text}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM API Error: {e}")
        return f"{raw_text.capitalize()}."


def ask_asl_tutor(user_query: str, chat_history: list = None) -> str:
    """
    Acts as an expert ASL Tutor and Deaf Culture advisor using Groq / OpenAI LLM,
    with smart fallback for API quota limits.
    """
    if not user_query:
        return "Hello! I am your AI ASL Tutor. 🤟 How can I assist you with ASL grammar, hand postures, or deaf culture today?"

    client, model_name = get_llm_client()

    if client:
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are SignBridge AI Tutor, a friendly, encouraging, and expert American Sign Language (ASL) teacher and Deaf Culture advisor. "
                        "You answer questions directly, clearly, and concisely. Help with ASL grammar (Topic-Comment syntax), hand postures for letters A-Z, "
                        "facial expressions (non-manual markers), practice routines, and deaf culture etiquette. Use bullet points and emoji when helpful."
                    )
                }
            ]

            if chat_history:
                for item in chat_history[-6:]:
                    messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})

            messages.append({"role": "user", "content": user_query})

            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LLM Tutor API Notice (Switching to fallback): {e}")

    # Smart Conversational Knowledge Engine (handles any query intelligently!)
    q_lower = user_query.lower().strip()

    if any(w in q_lower for w in ["who are you", "who r u", "what is your name", "who are u", "identity"]):
        return "I am **SignBridge AI Tutor** 🤖🤟 — your personal AI assistant for learning American Sign Language (ASL), posture tips, ASL Topic-Comment grammar, and Deaf Culture!"
    elif any(w in q_lower for w in ["hi", "hello", "hlo", "hey", "greetings", "good morning", "good evening"]):
        return "Hello! 👋 I'm ready to help you learn ASL. You can ask me for fingerspelling posture guides, ASL grammar tips, or 5-minute daily practice routines!"
    elif any(w in q_lower for w in ["grammar", "syntax", "structure", "sentence"]):
        return "ASL uses a **Topic-Comment** grammatical structure (e.g., *'STORE I GO'* instead of *'I am going to the store'*). Facial expressions and non-manual markers (like raised eyebrows for yes/no questions) act as essential grammar punctuation!"
    elif "m" in q_lower and "n" in q_lower:
        return "For the letter **'M'**, tuck your thumb UNDER your first 3 fingers (index, middle, ring). For **'N'**, tuck your thumb UNDER your first 2 fingers (index, middle)!"
    elif any(w in q_lower for w in ["practice", "routine", "learn", "study"]):
        return "🎯 **5-Minute Daily ASL Practice Routine**:\n1. Practice fingerspelling A-Z slowly for 1 minute.\n2. Practice 5 core greetings (*Hello*, *Thank You*, *Please*).\n3. Launch our **Speed Quiz Challenge** in Learning Mode to test your speed under pressure!"
    elif any(w in q_lower for w in ["non-manual", "nmm", "expression", "face", "facial"]):
        return "😶 **Non-Manual Markers (NMMs)** are facial expressions, head tilts, and shoulder shifts used in ASL. For example: raising eyebrows marks a Yes/No question, while furrowing eyebrows marks a Wh-question (*Who, What, Where*)!"
    elif any(w in q_lower for w in ["deaf culture", "culture", "deaf community", "etiquette"]):
        return "🤟 **Deaf Culture Etiquette**:\n• Maintain direct eye contact while signing — looking away can be considered impolite.\n• Tap gently on the shoulder or wave your hand to get someone's attention.\n• Facial expressions are essential; they express emotion and grammatical structure!"
    else:
        return f"Great question about **'{user_query}'**! In ASL, the 5 key parameters of every sign are: **Handshape, Orientation, Location, Movement, and Facial Expression (NMMs)**.\n\n💡 *To enable unlimited real-time LLM responses with Groq (100% Free), paste your `GROQ_API_KEY` into `backend/.env`!*"

