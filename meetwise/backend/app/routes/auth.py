from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import hash_passwod, verify_password, create_access_token

router = APIRouter()

users_db = {}

class userRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: userRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = hash_passwod(user.password)
    users_db[user.email]= {
        "username": user.username,
        "email": user.email,
        "password": hashed_pw

    }
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

