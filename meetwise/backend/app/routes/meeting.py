from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.ai_processing import process_meeting_notes
from app.core.middleware import get_current_user
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

# In-memory database for meetings
meetings_db = {}

class MeetingCreate(BaseModel):
    title: str
    notes: str

class ActionItem(BaseModel):
    task: str
    priority: str
    assignee: Optional[str] = None

class MeetingResponse(BaseModel):
    id: str
    title: str
    notes: str
    summary: str
    key_points: List[str]
    action_items: List[ActionItem]
    created_at: str
    user_email: str

@router.post("", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, user_email: str = Depends(get_current_user)):
    """
    Create a new meeting and process it with AI.
    Requires authentication. Free users limited to 5 meetings/month.
    """
    # Import here to avoid circular import
    from app.routes.auth import users_db, user_usage_db
    from datetime import datetime
    
    # Get user plan
    user = users_db.get(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_plan = user.get("plan", "free")
    
    # Check usage limits for free plan
    if user_plan == "free":
        usage = user_usage_db.get(user_email, {"meetings_this_month": 0})
        
        # Reset monthly counter if needed (simple month check)
        last_reset = usage.get("last_reset", datetime.now().isoformat())
        last_reset_date = datetime.fromisoformat(last_reset)
        current_date = datetime.now()
        
        # If month changed, reset counter
        if last_reset_date.month != current_date.month or last_reset_date.year != current_date.year:
            usage["meetings_this_month"] = 0
            usage["last_reset"] = current_date.isoformat()
        
        # Check if limit reached
        if usage["meetings_this_month"] >= 5:
            raise HTTPException(
                status_code=403, 
                detail="Free plan limit reached (5 meetings/month). Please upgrade to Pro for unlimited meetings."
            )
    
    # Process meeting notes with AI
    ai_result = process_meeting_notes(meeting.title, meeting.notes)
    
    # Generate unique ID
    meeting_id = str(uuid.uuid4())
    
    # Create meeting record
    meeting_data = {
        "id": meeting_id,
        "title": meeting.title,
        "notes": meeting.notes,
        "summary": ai_result.get("summary", ""),
        "key_points": ai_result.get("key_points", []),
        "action_items": ai_result.get("action_items", []),
        "created_at": datetime.now().isoformat(),
        "user_email": user_email
    }
    
    # Store in database
    meetings_db[meeting_id] = meeting_data
    
    # Update usage counter for free users
    if user_plan == "free":
        usage = user_usage_db.get(user_email, {"meetings_this_month": 0, "last_reset": datetime.now().isoformat()})
        usage["meetings_this_month"] = usage.get("meetings_this_month", 0) + 1
        user_usage_db[user_email] = usage
    
    return meeting_data

@router.get("", response_model=List[MeetingResponse])
def list_meetings(user_email: str = Depends(get_current_user)):
    """
    Get all meetings for the authenticated user.
    """
    user_meetings = [
        meeting for meeting in meetings_db.values()
        if meeting["user_email"] == user_email
    ]
    
    # Sort by created_at descending (newest first)
    user_meetings.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_meetings

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, user_email: str = Depends(get_current_user)):
    """
    Get a specific meeting by ID.
    """
    meeting = meetings_db.get(meeting_id)
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if meeting belongs to user
    if meeting["user_email"] != user_email:
        raise HTTPException(status_code=403, detail="Not authorized to access this meeting")
    
    return meeting

@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: str, user_email: str = Depends(get_current_user)):
    """
    Delete a meeting.
    """
    meeting = meetings_db.get(meeting_id)
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if meeting belongs to user
    if meeting["user_email"] != user_email:
        raise HTTPException(status_code=403, detail="Not authorized to delete this meeting")
    
    del meetings_db[meeting_id]
    
    return {"message": "Meeting deleted successfully"}
