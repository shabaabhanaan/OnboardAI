
import os
import json
import subprocess
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Get absolute path to the wrapper script
current_dir = os.path.dirname(os.path.abspath(__file__))
# wrapper is in backend root
BACKEND_ROOT = os.path.dirname(os.path.dirname(current_dir))
WRAPPER_PATH = os.path.join(BACKEND_ROOT, "bytez_wrapper.mjs")

def call_bytez_ai(command: str, payload: Any) -> Any:
    """
    Calls the node.js Bytez wrapper.
    """
    try:
        # Convert payload to JSON string (or file string for transcribe)
        if command == 'chat':
            arg = json.dumps(payload)
        else:
            arg = str(payload)

        # Run node script
        result = subprocess.run(
            ["node", WRAPPER_PATH, command, arg],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )

        if result.returncode != 0:
            print(f"Bytez Error Output: {result.stderr}")
            raise Exception(f"Bytez process failed: {result.stderr}")

        # Parse JSON output
        output_str = result.stdout.strip()
        if not output_str:
             raise Exception("Empty response from AI wrapper")

        data = json.loads(output_str)
        
        if "error" in data:
            raise Exception(data["error"])
            
        return data["output"]

    except Exception as e:
        print(f"Error calling Bytez AI: {str(e)}")
        raise e

def process_meeting_notes(title: str, notes: str) -> Dict[str, Any]:
    """
    Process meeting notes using Bytez (GPT-4o) to generate summary and action items.
    """
    system_prompt = """You are an expert meeting assistant. Analyze the provided meeting notes and extract:
    1. A concise summary (2-3 paragraphs)
    2. A list of action items with assignees (if mentioned) and priority (High/Medium/Low)
    
    Return ONLY valid JSON in the following format:
    {
        "summary": "...",
        "action_items": [
            {"description": "...", "assignee": "...", "priority": "..."}
        ]
    }
    """

    user_prompt = f"Meeting Title: {title}\n\nNotes:\n{notes}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response_obj = call_bytez_ai('chat', messages)
        
        # Check structure
        content = ""
        if isinstance(response_obj, dict) and 'content' in response_obj:
             content = response_obj['content']
        elif isinstance(response_obj, str):
             content = response_obj
        else:
             content = str(response_obj)

        # Cleanup markdown code blocks if present
        content = content.replace("```json", "").replace("```", "").strip()
        
        return json.loads(content)

    except Exception as e:
        print(f"Error processing meeting notes: {str(e)}")
        # Fallback
        return {
            "summary": "Failed to generate summary.",
            "action_items": []
        }

def transcribe_meeting_audio(file_path: str) -> str:
    """
    Transcribe audio file using Bytez (Whisper).
    """
    try:
        # Call Bytez with 'transcribe' command and file path
        response = call_bytez_ai('transcribe', file_path)
        
        # Assuming output is the text string or object with text
        if isinstance(response, dict) and 'text' in response:
            return response['text']
        else:
            return str(response)

    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        raise Exception(f"Failed to transcribe audio: {str(e)}")
