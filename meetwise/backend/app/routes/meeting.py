from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.ai_processing import process_meeting_notes, transcribe_meeting_audio
from app.core.middleware import get_current_user
from app.core.database import get_db
from app.models.models import User, Meeting as MeetingModel
from typing import Optional, List
from datetime import datetime
import uuid
import shutil
import os

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

class MeetingCreate(BaseModel):
    title: str
    notes: str

class ActionItem(BaseModel):
    description: str  # Matches AI prompt 'description'
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
    
    class Config:
        from_attributes = True


@router.post("/upload", response_model=MeetingResponse)
def upload_meeting(
    file: UploadFile = File(...),
    title: str = Form(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """
    Upload an audio/video file for transcription and processing.
    """
    # Get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check plan limits (simple check for now)
    if user.plan == "free":
        # Check meeting count
        if user.meetings_this_month >= 5:
             raise HTTPException(
                status_code=403,
                detail="Free plan limit reached (5 meetings/month). Please upgrade to Pro."
            )

    # Validate file type
    if not file.content_type.startswith(('audio/', 'video/')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload audio or video.")

    # Save temp file
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Transcribe
        transcribed_text = transcribe_meeting_audio(temp_filename)
        
        # Combine with notes if provided
        full_text = transcribed_text
        if notes:
            full_text = f"{notes}\n\nRunning Transcription:\n{transcribed_text}"
            
        # Process with AI
        ai_result = process_meeting_notes(title, full_text)
        
        # Create meeting record
        meeting_id = str(uuid.uuid4())
        db_meeting = MeetingModel(
            id=meeting_id,
            title=title,
            notes=full_text,
            summary=ai_result.get("summary", ""),
            key_points=ai_result.get("key_points", []),
            action_items=ai_result.get("action_items", []),
            created_at=datetime.now(),
            user_id=user.id
        )
        
        db.add(db_meeting)
        
        # Update usage
        if user.plan == "free":
            user.meetings_this_month += 1
            
        db.commit()
        db.refresh(db_meeting)
        
        return MeetingResponse(
            id=db_meeting.id,
            title=db_meeting.title,
            notes=db_meeting.notes,
            summary=db_meeting.summary,
            key_points=db_meeting.key_points,
            action_items=db_meeting.action_items,
            created_at=db_meeting.created_at.isoformat(),
            user_email=email
        )
        
    except Exception as e:
        import logging
        logging.error(f"Error processing meeting (upload): {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
        
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@router.post("", response_model=MeetingResponse)
def create_meeting(
    meeting: MeetingCreate, 
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """
    Create a new meeting and process it with AI.
    Free users limited to 5 meetings/month.
    """
    # Get user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check usage limits for free plan
    if user.plan == "free":
        # Reset monthly counter if needed
        current_date = datetime.now()
        if user.last_reset.month != current_date.month or user.last_reset.year != current_date.year:
            user.meetings_this_month = 0
            user.last_reset = current_date
            db.commit()
        
        # Check limit
        if user.meetings_this_month >= 5:
            raise HTTPException(
                status_code=403,
                detail="Free plan limit reached (5 meetings/month). Please upgrade to Pro for unlimited meetings."
            )
    
    # Process meeting with AI
    ai_result = process_meeting_notes(meeting.title, meeting.notes)
    
    # Create meeting
    meeting_id = str(uuid.uuid4())
    db_meeting = MeetingModel(
        id=meeting_id,
        title=meeting.title,
        notes=meeting.notes,
        summary=ai_result.get("summary", ""),
        key_points=ai_result.get("key_points", []),
        action_items=ai_result.get("action_items", []),
        created_at=datetime.now(),
        user_id=user.id
    )
    
    db.add(db_meeting)
    
    # Update usage counter for free users
    if user.plan == "free":
        user.meetings_this_month += 1
    
    db.commit()
    db.refresh(db_meeting)
    
    return MeetingResponse(
        id=db_meeting.id,
        title=db_meeting.title,
        notes=db_meeting.notes,
        summary=db_meeting.summary,
        key_points=db_meeting.key_points,
        action_items=db_meeting.action_items,
        created_at=db_meeting.created_at.isoformat(),
        user_email=email
    )

@router.get("", response_model=List[MeetingResponse])
def list_meetings(
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """Get all meetings for the authenticated user."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meetings = db.query(MeetingModel).filter(
        MeetingModel.user_id == user.id
    ).order_by(MeetingModel.created_at.desc()).all()
    
    return [
        MeetingResponse(
            id=m.id,
            title=m.title,
            notes=m.notes,
            summary=m.summary,
            key_points=m.key_points,
            action_items=m.action_items,
            created_at=m.created_at.isoformat(),
            user_email=email
        )
        for m in meetings
    ]

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """Get a specific meeting by ID."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meeting = db.query(MeetingModel).filter(
        MeetingModel.id == meeting_id,
        MeetingModel.user_id == user.id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        notes=meeting.notes,
        summary=meeting.summary,
        key_points=meeting.key_points,
        action_items=meeting.action_items,
        created_at=meeting.created_at.isoformat(),
        user_email=email
    )

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user)
):
    """Delete a meeting."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    meeting = db.query(MeetingModel).filter(
        MeetingModel.id == meeting_id,
        MeetingModel.user_id == user.id
    ).first()
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    
    return {"message": "Meeting deleted successfully"}
