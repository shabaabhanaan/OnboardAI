from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL configuration
# Supports both PostgreSQL and SQLite
# Set DATABASE_URL in .env for PostgreSQL, otherwise defaults to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meetwise.db")

# Determine if using SQLite for special configuration
is_sqlite = DATABASE_URL.startswith("sqlite")

# Create engine with appropriate settings
if is_sqlite:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}  # Only needed for SQLite
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,  # Number of connections to maintain
        max_overflow=20,  # Max connections to create beyond pool_size
        pool_pre_ping=True,  # Verify connections before using
        echo=False  # Set to True for SQL query logging
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to get database info
def get_database_info():
    """Return information about the current database configuration"""
    db_type = "PostgreSQL" if not is_sqlite else "SQLite"
    db_path = DATABASE_URL.split("///")[-1] if is_sqlite else DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "configured"
    return {
        "type": db_type,
        "url": DATABASE_URL if not is_sqlite else f"sqlite:///{db_path}",
        "is_sqlite": is_sqlite
    }
