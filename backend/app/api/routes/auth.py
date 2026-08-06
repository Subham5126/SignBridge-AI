from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
from app.core.config import settings

router = APIRouter()

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    _GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    _GOOGLE_AUTH_AVAILABLE = False

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class SaveHistoryRequest(BaseModel):
    user_id: str
    raw_text: str
    corrected_text: Optional[str] = ""
    confidence: Optional[float] = 90.0

class GoogleAuthRequest(BaseModel):
    credential: str

@router.post("/register")
def register_user(user_data: UserRegister):
    """
    Register user via Supabase Auth API
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY or "xyzcompany" in settings.SUPABASE_URL:
        # Fallback local demo auth
        return {
            "status": "success",
            "message": "User registered (Local Demo Mode)",
            "user": {
                "id": "demo_user_1",
                "email": user_data.email,
                "name": user_data.name
            }
        }
    
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    url = f"{settings.SUPABASE_URL}/auth/v1/signup"
    payload = {
        "email": user_data.email,
        "password": user_data.password,
        "data": {"name": user_data.name}
    }
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, json=payload, headers=headers)
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.json().get("msg", "Supabase auth failed"))
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login_user(credentials: UserLogin):
    """
    Authenticate user via Supabase Auth API
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY or "xyzcompany" in settings.SUPABASE_URL:
        return {
            "access_token": "demo_access_token",
            "token_type": "bearer",
            "user": {
                "id": "demo_user_1",
                "email": credentials.email,
                "name": credentials.email.split("@")[0].capitalize()
            }
        }
    
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = {
        "email": credentials.email,
        "password": credentials.password
    }
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, json=payload, headers=headers)
        if res.status_code >= 400:
            raise HTTPException(status_code=res.status_code, detail=res.json().get("error_description", "Invalid login"))
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google")
def google_auth(req: GoogleAuthRequest):
    """
    Verify a Google Identity Services ID token and return user profile.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured on the server (GOOGLE_CLIENT_ID missing).",
        )

    if not _GOOGLE_AUTH_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="google-auth package is not installed on the server.",
        )

    try:
        idinfo = google_id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    return {
        "status": "success",
        "user": {
            "id": idinfo["sub"],
            "email": idinfo.get("email"),
            "user_metadata": {
                "name": idinfo.get("name"),
                "avatar_url": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified"),
                "provider": "google",
            },
        },
    }

@router.post("/history")
def save_translation_history(req: SaveHistoryRequest):
    """
    Save translation history entry to database
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY or "xyzcompany" in settings.SUPABASE_URL:
        return {"status": "success", "saved": True, "mode": "demo"}
    
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    url = f"{settings.SUPABASE_URL}/rest/v1/translations"
    payload = req.model_dump()
    
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, json=payload, headers=headers)
        return {"status": "success", "code": res.status_code}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

