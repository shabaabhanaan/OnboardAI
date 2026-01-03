
import requests
import json

api_key = "AIzaSyB3c1h0buJ3Fi9AkXNMIOJ6c4UueKQcouc"

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"

headers = {
    'Content-Type': 'application/json'
}

data = {
    "contents": [{
        "parts": [{"text": "Hello"}]
    }]
}

try:
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        print("Key is VALID for Google Gemini API.")
    else:
        print(f"Key check failed using Google API. Status: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error checking key: {e}")
