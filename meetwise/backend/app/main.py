from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, meeting, user
from app.core.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MeetWise API",
    description="AI-powered meeting notes generator with database persistence",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(user.router)     # ✅ IMPORTANT
app.include_router(meeting.router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "MeetWise API is running",
        "version": "2.0.0"
    }
