
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session
import hashlib
import os
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.auth_service import get_current_user
from app.models.models import User

router = APIRouter()

# PayHere Configuration
MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "121XXXX")
MERCHANT_SECRET = os.getenv("PAYHERE_MERCHANT_SECRET", "4515XXX")
CURRENCY = "LKR"

class PaymentHashRequest(BaseModel):
    amount: float
    order_id: str

@router.post("/hash")
def generate_payhere_hash(
    request: PaymentHashRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate the hash required by PayHere for the frontend form.
    Hash = md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
    """
    try:
        amount_formatted = "{:.2f}".format(request.amount) # Format to 2 decimal places
        
        # 1. Hash the secret
        secret_hash = hashlib.md5(MERCHANT_SECRET.encode('utf-8')).hexdigest().upper()
        
        # 2. Construct the string to hash
        hash_string = f"{MERCHANT_ID}{request.order_id}{amount_formatted}{CURRENCY}{secret_hash}"
        
        # 3. Generate final hash
        final_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
        
        return {
            "hash": final_hash,
            "merchant_id": MERCHANT_ID,
            "currency": CURRENCY,
            "amount_formatted": amount_formatted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notify")
async def payhere_webhook(
    merchant_id: str = Form(...),
    order_id: str = Form(...),
    payhere_amount: str = Form(...),
    payhere_currency: str = Form(...),
    status_code: str = Form(...),
    md5sig: str = Form(...),
    custom_1: Optional[str] = Form(None), # Stores user_id
    db: Session = Depends(get_db)
):
    """
    Webhook to handle PayHere payment notifications.
    """
    # 1. Verify Signature
    secret_hash = hashlib.md5(MERCHANT_SECRET.encode('utf-8')).hexdigest().upper()
    sign_string = f"{merchant_id}{order_id}{payhere_amount}{payhere_currency}{status_code}{secret_hash}"
    local_md5sig = hashlib.md5(sign_string.encode('utf-8')).hexdigest().upper()

    if local_md5sig != md5sig:
        # Signature mismatch - potential fraud
        print(f"Payment Signature Mismatch for Order {order_id}")
        return {"status": "failed", "message": "Invalid Signature"}

    # 2. Check Payment Status (2 = Success)
    if status_code == "2":
        # Payment Success
        user_id = custom_1
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.plan = "pro" # Upgrade user
                db.commit()
                print(f"User {user_id} upgraded to Pro via PayHere")
        
    return {"status": "ok"}
