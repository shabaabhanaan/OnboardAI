from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.auth_service import hash_password, verify_password, create_access_token
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# In-memory user database
users_db = {}

# Track user usage (meetings created per month)
user_usage_db = {}

class userRegister(BaseModel):
    username: str
    email: str
    password: str
    plan: str = "free"  # Default to free plan

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: userRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate plan
    if user.plan not in ["free", "pro", "team"]:
        user.plan = "free"
    
    hashed_pw = hash_password(user.password)
    users_db[user.email]= {
        "username": user.username,
        "email": user.email,
        "password": hashed_pw,
        "plan": user.plan,
        "created_at": datetime.now().isoformat()
    }
    
    # Initialize usage tracking
    user_usage_db[user.email] = {
        "meetings_this_month": 0,
        "last_reset": datetime.now().isoformat()
    }
    
    return {"message": "User registered successfully", "plan": user.plan}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token, 
        "token_type": "bearer",
        "plan": db_user.get("plan", "free"),
        "username": db_user.get("username")
    }

@router.get("/me")
def get_user_info(email: str = Depends(get_current_user)):
    """Get current user information including plan"""
    from app.core.middleware import get_current_user
    
    db_user = users_db.get(email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    usage = user_usage_db.get(email, {"meetings_this_month": 0})
    
    return {
        "email": db_user["email"],
        "username": db_user["username"],
        "plan": db_user.get("plan", "free"),
        "meetings_this_month": usage.get("meetings_this_month", 0)
    }

