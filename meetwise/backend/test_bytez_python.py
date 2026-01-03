
from app.services.ai_processing import process_meeting_notes

title = "Test Meeting"
notes = "Discussed the new product launch. Everyone agreed to launch on Friday. John needs to prepare the marketing materials. Sarah will upgrade the servers."

print("Testing process_meeting_notes with Bytez...")
try:
    result = process_meeting_notes(title, notes)
    print("Result:")
    print(result)
except Exception as e:
    print(f"Error: {e}")
