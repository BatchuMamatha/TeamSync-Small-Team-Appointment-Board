import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .models import Appointment
from .schemas import AppointmentCreate, AppointmentUpdate, time_to_minutes

def is_time_overlapping(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    """Interval overlap condition: a_start < b_end and a_end > b_start."""
    a_start = time_to_minutes(start_a)
    a_end = time_to_minutes(end_a)
    b_start = time_to_minutes(start_b)
    b_end = time_to_minutes(end_b)
    return a_start < b_end and a_end > b_start

def check_slot_conflict(
    db: Session,
    date: str,
    start_time: str,
    end_time: str,
    exclude_id: Optional[str] = None
) -> Tuple[bool, Optional[Appointment]]:
    """
    Checks if the proposed slot conflicts with any existing active (non-cancelled) appointment on the same date.
    Returns (has_conflict, conflicting_appointment).
    """
    query = db.query(Appointment).filter(
        Appointment.date == date,
        Appointment.status != "cancelled"
    )
    if exclude_id:
        query = query.filter(Appointment.id != exclude_id)
    
    candidates = query.all()
    for appt in candidates:
        if is_time_overlapping(start_time, end_time, appt.start_time, appt.end_time):
            return True, appt
            
    return False, None

def get_appointments(
    db: Session,
    date: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
) -> List[Appointment]:
    query = db.query(Appointment)

    if date and date != "all":
        query = query.filter(Appointment.date == date)
    if status and status != "all":
        query = query.filter(Appointment.status == status)
    if search and search.strip():
        q = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Appointment.title.ilike(q),
                Appointment.description.ilike(q),
                Appointment.assignee.ilike(q),
                Appointment.client.ilike(q)
            )
        )

    # Sort chronologically: date asc, start_time asc
    query = query.order_by(Appointment.date.asc(), Appointment.start_time.asc())
    return query.all()

def get_appointment_by_id(db: Session, appointment_id: str) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def create_appointment(db: Session, appt_in: AppointmentCreate) -> Appointment:
    new_id = "apt-" + uuid.uuid4().hex[:8]
    db_obj = Appointment(
        id=new_id,
        title=appt_in.title.strip(),
        description=(appt_in.description or "").strip(),
        assignee=(appt_in.assignee or "General Team").strip(),
        client=(appt_in.client or "").strip(),
        date=appt_in.date,
        start_time=appt_in.start_time,
        end_time=appt_in.end_time,
        status=appt_in.status or "scheduled"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_appointment(
    db: Session,
    db_obj: Appointment,
    appt_in: AppointmentUpdate
) -> Appointment:
    data = appt_in.model_dump(exclude_unset=True)
    for field, val in data.items():
        if val is not None:
            if isinstance(val, str) and field in ["title", "description", "client", "assignee"]:
                setattr(db_obj, field, val.strip())
            else:
                setattr(db_obj, field, val)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_appointment_status(
    db: Session,
    db_obj: Appointment,
    new_status: str
) -> Appointment:
    db_obj.status = new_status
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_appointment(db: Session, db_obj: Appointment) -> bool:
    db.delete(db_obj)
    db.commit()
    return True
