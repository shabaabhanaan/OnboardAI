import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def process_meeting_notes(title: str, notes: str):
    prompt = f"""
    Summarize the following meeting notes in 5 bullet points.
    Extract all action items with responsible persons if mentioned.
    Assign priority for each action item: High, Medium, or Low.
    Meeting Notes:
    {notes}
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    result_text = response.choices[0].message.content
    return result_text
