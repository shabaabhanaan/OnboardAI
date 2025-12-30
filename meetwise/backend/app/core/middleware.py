from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional

SECRET_KEY = "your_secret_key_here"  # Should match auth_service.py
ALGORITHM = "HS256"

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Verify JWT token and return the user email.
    Raises HTTPException if token is invalid.
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
            
        return email
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

def get_current_user(email: str = Depends(verify_token)) -> str:
    """
    Dependency to get current authenticated user email.
    Use this in route handlers that require authentication.
    """
    return email
