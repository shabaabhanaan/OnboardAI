
from app.services.auth_service import hash_password, verify_password

try:
    print("Testing hash_password...")
    pw = "password123"
    hashed = hash_password(pw)
    print(f"Hash success: {hashed[:10]}...")
    
    print("Testing verify_password...")
    valid = verify_password(pw, hashed)
    print(f"Verify result: {valid}")
except Exception as e:
    print(f"Error: {e}")
