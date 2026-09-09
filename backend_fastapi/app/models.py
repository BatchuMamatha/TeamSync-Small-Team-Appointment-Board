from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, default="")
    assignee = Column(String(100), default="General Team")
    client = Column(String(100), default="")
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    start_time = Column(String(5), nullable=False)        # HH:MM
    end_time = Column(String(5), nullable=False)          # HH:MM
    status = Column(String(20), default="scheduled", index=True) # scheduled, completed, cancelled
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
