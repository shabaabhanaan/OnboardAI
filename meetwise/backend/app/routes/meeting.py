from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ai_processing import process_meeting_notes

router = APIRouter()

class MeetingRequest(BaseModel):
    title: str
    notes: str

class MeetingResponse(BaseModel):
    summary: str
    action_items: list

@router.post("/process-meeting", response_model=MeetingResponse)
def process_meeting(meeting: MeetingRequest):
    ai_output = process_meeting_notes(meeting.title, meeting.notes)

    summary = ai_output.split("Action Items:")[0].strip()
    action_items_text = ai_output.split("Action Items:")[-1].strip()
    action_items = [{"task": line, "priority": "Medium"} for line in action_items_text.split("\n") if line]

    return {"summary": summary, "action_items": action_items}
