import requests
import uuid
import sys

BASE_URL = "http://localhost:8001" # Using the port from the terminal info
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "Password123!"
TEST_USERNAME = "CRUD Tester"

def run_tests():
    print(f"Starting CRUD Tests with email: {TEST_EMAIL}")
    
    # 1. Register
    print("\n1. Testing Registration...")
    reg_data = {
        "username": TEST_USERNAME,
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "plan": "free"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=reg_data)
    if response.status_code != 200:
        print(f"FAILED: Registration failed with {response.status_code}: {response.text}")
        return
    print("SUCCESS: Registration successful")

    # 2. Login
    print("\n2. Testing Login...")
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"FAILED: Login failed with {response.status_code}: {response.text}")
        return
    
    data = response.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("SUCCESS: Login successful, token acquired")

    # 3. Create Meeting
    print("\n3. Testing Meeting Creation...")
    meeting_data = {
        "title": "CRUD Test Meeting",
        "notes": "This is a test meeting for verifying CRUD operations. We need to check if everything works after rebranding."
    }
    response = requests.post(f"{BASE_URL}/api/meetings", json=meeting_data, headers=headers)
    if response.status_code != 200:
        print(f"FAILED: Meeting creation failed with {response.status_code}: {response.text}")
        return
    
    meeting = response.json()
    meeting_id = meeting["id"]
    print(f"SUCCESS: Meeting created with ID: {meeting_id}")

    # 4. List Meetings
    print("\n4. Testing List Meetings...")
    response = requests.get(f"{BASE_URL}/api/meetings", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: List meetings failed with {response.status_code}: {response.text}")
        return
    
    meetings = response.json()
    if not any(m["id"] == meeting_id for m in meetings):
        print("FAILED: Created meeting not found in list")
        return
    print(f"SUCCESS: Meeting found in list (Total meetings: {len(meetings)})")

    # 5. Get Meeting
    print("\n5. Testing Get Meeting...")
    response = requests.get(f"{BASE_URL}/api/meetings/{meeting_id}", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: Get meeting failed with {response.status_code}: {response.text}")
        return
    
    meeting_detail = response.json()
    if meeting_detail["title"] != meeting_data["title"]:
        print("FAILED: Meeting title mismatch")
        return
    print("SUCCESS: Meeting details retrieved correctly")

    # 6. Delete Meeting
    print("\n6. Testing Delete Meeting...")
    response = requests.delete(f"{BASE_URL}/api/meetings/{meeting_id}", headers=headers)
    if response.status_code != 200:
        print(f"FAILED: Delete meeting failed with {response.status_code}: {response.text}")
        return
    print("SUCCESS: Meeting deleted successfully")

    # 7. Final Verification
    print("\n7. Verifying Deletion...")
    response = requests.get(f"{BASE_URL}/api/meetings", headers=headers)
    meetings = response.json()
    if any(m["id"] == meeting_id for m in meetings):
        print("FAILED: Meeting still exists in list after deletion")
        return
    print("SUCCESS: Deletion verified, meeting is gone")
    
    print("\nALL CRUD TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
