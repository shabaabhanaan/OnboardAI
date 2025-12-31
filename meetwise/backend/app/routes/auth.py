from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user  
)
from app.core.database import get_db
from app.models.models import User
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    plan: str = "free"

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate plan
    if user.plan not in ["free", "pro", "team"]:
        user.plan = "free"
    
    # Create new user
    hashed_pw = hash_password(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw,
        plan=user.plan,
        meetings_this_month=0,
        last_reset=datetime.now(),
        created_at=datetime.now()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User registered successfully", "plan": db_user.plan}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create token
    token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "plan": db_user.plan,
        "username": db_user.username
    }

@router.get("/me")
def get_user_info(db: Session = Depends(get_db), email: str = Depends(get_current_user)):
    """Get current user information including plan"""
    
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_date = datetime.now()
    if db_user.last_reset.month != current_date.month or db_user.last_reset.year != current_date.year:
        db_user.meetings_this_month = 0
        db_user.last_reset = current_date
        db.commit()
    
    return {
        "email": db_user.email,
        "username": db_user.username,
        "plan": db_user.plan,
        "meetings_this_month": db_user.meetings_this_month
    }
