from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import Appointment
from .schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentStatusUpdate,
    AppointmentResponse,
    AppointmentsListResponse,
    DashboardStats
)
from .crud import (
    get_appointments,
    get_appointment_by_id,
    create_appointment,
    update_appointment,
    update_appointment_status,
    delete_appointment,
    check_slot_conflict
)
from .seed import seed_sample_appointments

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TeamSync — Small Team Appointment Board API",
    description="Full-stack appointment scheduling API with slot conflict prevention. Developed by Batchu Mamatha.",
    version="1.0.0"
)

# Enable CORS for React frontend (default Vite ports: 5173, 3000, 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_sample_appointments(db, force=False)
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TeamSync FastAPI Backend", "author": "Batchu Mamatha"}

@app.get("/api/appointments", response_model=AppointmentsListResponse)
def list_appointments(
    date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD or 'all'"),
    status: Optional[str] = Query(None, description="Filter by scheduled, completed, cancelled, or 'all'"),
    search: Optional[str] = Query(None, description="Search query across title, description, host, client"),
    db: Session = Depends(get_db)
):
    items = get_appointments(db, date=date, status=status, search=search)
    all_items = db.query(Appointment).all()

    stats = DashboardStats(
        total=len(all_items),
        scheduled=sum(1 for a in all_items if a.status == "scheduled"),
        completed=sum(1 for a in all_items if a.status == "completed"),
        cancelled=sum(1 for a in all_items if a.status == "cancelled")
    )

    return AppointmentsListResponse(
        success=True,
        data=[AppointmentResponse.model_validate(item) for item in items],
        stats=stats
    )

@app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appt = get_appointment_by_id(db, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return AppointmentResponse.model_validate(appt)

@app.post("/api/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_appointment(appt_in: AppointmentCreate, db: Session = Depends(get_db)):
    # Overlap conflict detection
    has_conflict, conf = check_slot_conflict(
        db,
        date=appt_in.date,
        start_time=appt_in.start_time,
        end_time=appt_in.end_time
    )
    if has_conflict and conf:
        raise HTTPException(
            status_code=409,
            detail=f'Time slot conflict: Overlaps with "{conf.title}" ({conf.start_time} - {conf.end_time}).'
        )

    new_appt = create_appointment(db, appt_in)
    return AppointmentResponse.model_validate(new_appt)

@app.put("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_existing_appointment(
    appointment_id: str,
    appt_in: AppointmentUpdate,
    db: Session = Depends(get_db)
):
    existing = get_appointment_by_id(db, appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    target_date = appt_in.date or existing.date
    target_start = appt_in.start_time or existing.start_time
    target_end = appt_in.end_time or existing.end_time
    target_status = appt_in.status or existing.status

    if target_status != "cancelled":
        has_conflict, conf = check_slot_conflict(
            db,
            date=target_date,
            start_time=target_start,
            end_time=target_end,
            exclude_id=appointment_id
        )
        if has_conflict and conf:
            raise HTTPException(
                status_code=409,
                detail=f'Time slot conflict: Overlaps with "{conf.title}" ({conf.start_time} - {conf.end_time}).'
            )

    updated = update_appointment(db, existing, appt_in)
    return AppointmentResponse.model_validate(updated)

@app.patch("/api/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def patch_appointment_status(
    appointment_id: str,
    status_in: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    existing = get_appointment_by_id(db, appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    new_status = status_in.status
    if existing.status == "cancelled" and new_status != "cancelled":
        has_conflict, conf = check_slot_conflict(
            db,
            date=existing.date,
            start_time=existing.start_time,
            end_time=existing.end_time,
            exclude_id=appointment_id
        )
        if has_conflict and conf:
            raise HTTPException(
                status_code=409,
                detail=f'Cannot reactivate: Slot now conflicts with "{conf.title}" ({conf.start_time} - {conf.end_time}).'
            )

    updated = update_appointment_status(db, existing, new_status)
    return AppointmentResponse.model_validate(updated)

@app.delete("/api/appointments/{appointment_id}")
def delete_existing_appointment(appointment_id: str, db: Session = Depends(get_db)):
    existing = get_appointment_by_id(db, appointment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    delete_appointment(db, existing)
    return {"success": True, "message": "Appointment deleted successfully."}

@app.post("/api/appointments/reset-samples")
def reset_samples_data(db: Session = Depends(get_db)):
    seed_sample_appointments(db, force=True)
    items = db.query(Appointment).all()
    return {
        "success": True,
        "message": "Sample appointments reinitialized successfully.",
        "count": len(items)
    }
