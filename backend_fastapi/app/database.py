import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configurable for SQLite (default zero-setup) or PostgreSQL / MySQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./appointments.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session per request and closes it cleanly."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
