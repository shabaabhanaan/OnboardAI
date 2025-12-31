from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="free")  # free, pro, team
    meetings_this_month = Column(Integer, default=0)
    last_reset = Column(DateTime, default=datetime.now)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationship
    meetings = relationship("Meeting", back_populates="owner", cascade="all, delete-orphan")

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String, primary_key=True, index=True)  # UUID
    title = Column(String, nullable=False)
    notes = Column(Text, nullable=False)
    summary = Column(Text)
    key_points = Column(JSON)  # List of strings
    action_items = Column(JSON)  # List of dicts
    created_at = Column(DateTime, default=datetime.now)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship
    owner = relationship("User", back_populates="meetings")
