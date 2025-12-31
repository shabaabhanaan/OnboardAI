from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db

router = APIRouter(prefix="/api/user", tags=["user"])   

@router.get("/me")
def get_my_profile(
    email: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the profile of the currently authenticated user.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"error": "User not found"}
    
    return {
        "email": user.email,
        "username": user.username,
        "plan": user.plan,
        "meetings_this_month": user.meetings_this_month,
        "created_at": user.created_at
    }