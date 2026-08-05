from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class UserStatsResponse(BaseModel):
    streak: int
    total_signs: int
    accuracy: int
    practice_minutes: int
    recent_activity: List[Dict[str, Any]]

@router.get("/{user_id}", response_model=UserStatsResponse)
async def get_user_stats(user_id: str):
    """
    Retrieve learning statistics for a specific user.
    Integrates with the Database (Supabase/PostgreSQL).
    """
    # Fetch from DB logic goes here...
    
    # Mock data for now
    return UserStatsResponse(
        streak=12,
        total_signs=142,
        accuracy=88,
        practice_minutes=420,
        recent_activity=[
            {"sign": "Hello", "accuracy": 95, "timestamp": "2026-08-04T10:00:00Z"},
            {"sign": "Thank You", "accuracy": 92, "timestamp": "2026-08-04T10:05:00Z"}
        ]
    )
