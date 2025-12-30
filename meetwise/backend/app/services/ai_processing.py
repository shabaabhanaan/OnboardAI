from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

# Initialize OpenAI client with modern API
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def process_meeting_notes(title: str, notes: str):
    """
    Process meeting notes using OpenAI to generate summary and action items.
    Returns a structured dictionary with summary and action items.
    """
    prompt = f"""You are an AI assistant that helps process meeting notes.

Meeting Title: {title}

Meeting Notes:
{notes}

Please analyze these meeting notes and provide:
1. A concise summary (3-5 bullet points covering key discussion points)
2. A list of action items with priority levels

Return your response in the following JSON format:
{{
    "summary": "A brief summary of the meeting in 2-3 sentences",
    "key_points": ["point 1", "point 2", "point 3"],
    "action_items": [
        {{"task": "description of task", "priority": "High|Medium|Low", "assignee": "person name or null"}}
    ]
}}

Be specific and extract all actionable items mentioned in the notes."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using gpt-3.5-turbo for cost efficiency
            messages=[
                {"role": "system", "content": "You are a helpful assistant that processes meeting notes and extracts key information in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # Lower temperature for more consistent output
            response_format={"type": "json_object"}
        )
        
        result_text = response.choices[0].message.content
        
        # Parse JSON response
        try:
            parsed_result = json.loads(result_text)
            return parsed_result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "summary": result_text,
                "key_points": [],
                "action_items": []
            }
            
    except Exception as e:
        # Handle OpenAI API errors gracefully
        print(f"Error processing meeting notes: {str(e)}")
        return {
            "summary": f"Error processing meeting: {str(e)}",
            "key_points": ["Unable to process meeting notes due to an error"],
            "action_items": []
        }
