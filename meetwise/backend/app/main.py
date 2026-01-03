from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, meeting, user
from app.core import database
from app.core.database import engine, Base
from app.models import models  # IMPORTANT: register models

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MeetingHunts API",
    description="AI-powered meeting notes generator with database persistence",
    version="2.0.0"
)

# CORS for Next.js
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

# Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(meeting.router)
from app.routes import payment
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])

@app.get("/health")
def health_check():
    db_info = database.get_database_info()
    return {
        "status": "ok",
        "database": db_info["type"],
        "detail": db_info
    }
