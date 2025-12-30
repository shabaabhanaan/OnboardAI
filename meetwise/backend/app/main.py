from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, meeting

app = FastAPI()
app.include_router(auth.router)
app.include_router(meeting.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Service is running smoothly."}

app.include_router(meeting.router)