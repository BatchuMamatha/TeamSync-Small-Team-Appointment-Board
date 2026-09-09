import re
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, model_validator

DATE_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_REGEX = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")

def time_to_minutes(time_str: str) -> int:
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

class AppointmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Title of the appointment")
    description: Optional[str] = Field(default="", description="Agenda or meeting notes")
    assignee: Optional[str] = Field(default="General Team", description="Team member host")
    client: Optional[str] = Field(default="", description="Client or attendee")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM format")
    end_time: str = Field(..., description="End time in HH:MM format")
    status: Optional[str] = Field(default="scheduled", description="scheduled, completed, or cancelled")

    @model_validator(mode="after")
    def validate_dates_and_times(self):
        if not DATE_REGEX.match(self.date):
            raise ValueError("Date must be in YYYY-MM-DD format")
        if not TIME_REGEX.match(self.start_time):
            raise ValueError("Start time must be in HH:MM format")
        if not TIME_REGEX.match(self.end_time):
            raise ValueError("End time must be in HH:MM format")
        
        start_min = time_to_minutes(self.start_time)
        end_min = time_to_minutes(self.end_time)
        if end_min <= start_min:
            raise ValueError("End time must be later than start time")
        if end_min - start_min < 5:
            raise ValueError("Duration must be at least 5 minutes")
        
        if self.status not in ["scheduled", "completed", "cancelled"]:
            raise ValueError("Status must be one of: scheduled, completed, cancelled")
        return self

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    client: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: Optional[str] = None

    @model_validator(mode="after")
    def validate_times_if_present(self):
        if self.date and not DATE_REGEX.match(self.date):
            raise ValueError("Date must be in YYYY-MM-DD format")
        if self.start_time and not TIME_REGEX.match(self.start_time):
            raise ValueError("Start time must be in HH:MM format")
        if self.end_time and not TIME_REGEX.match(self.end_time):
            raise ValueError("End time must be in HH:MM format")
        if self.start_time and self.end_time:
            start_min = time_to_minutes(self.start_time)
            end_min = time_to_minutes(self.end_time)
            if end_min <= start_min:
                raise ValueError("End time must be later than start time")
        if self.status and self.status not in ["scheduled", "completed", "cancelled"]:
            raise ValueError("Status must be one of: scheduled, completed, cancelled")
        return self

class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., description="New status: scheduled, completed, or cancelled")

    @model_validator(mode="after")
    def validate_status(self):
        if self.status not in ["scheduled", "completed", "cancelled"]:
            raise ValueError("Status must be one of: scheduled, completed, cancelled")
        return self

class AppointmentResponse(AppointmentBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total: int
    scheduled: int
    completed: int
    cancelled: int

class AppointmentsListResponse(BaseModel):
    success: bool
    data: List[AppointmentResponse]
    stats: DashboardStats
