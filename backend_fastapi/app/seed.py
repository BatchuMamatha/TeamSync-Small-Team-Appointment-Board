from datetime import date, timedelta
from sqlalchemy.orm import Session
from .models import Appointment

def seed_sample_appointments(db: Session, force: bool = False):
    """Initializes sample appointments if the database is currently empty or force=True."""
    if not force:
        count = db.query(Appointment).count()
        if count > 0:
            return

    if force:
        db.query(Appointment).delete()
        db.commit()

    today = date.today()
    tomorrow = today + timedelta(days=1)
    day_after = today + timedelta(days=2)

    samples = [
        Appointment(
            id="apt-py-101",
            title="Quarterly Product Strategy Sync",
            description="Discuss Q4 roadmap milestones, feature priorities, and team resource allocation.",
            assignee="Sarah Chen (Lead PM)",
            client="Internal Leadership",
            date=today.isoformat(),
            start_time="09:30",
            end_time="10:30",
            status="completed"
        ),
        Appointment(
            id="apt-py-102",
            title="UX Design Critique: Dashboard Redesign",
            description="Review high-fidelity interactive prototypes for the analytics overview screen.",
            assignee="Alex Rivera (Design Lead)",
            client="Acme Health Corp",
            date=today.isoformat(),
            start_time="11:00",
            end_time="12:00",
            status="scheduled"
        ),
        Appointment(
            id="apt-py-103",
            title="Initial Client Onboarding & Tech Kickoff",
            description="Walkthrough API authentication, webhook setup, and sandbox test credentials.",
            assignee="David Kim (Full Stack Eng)",
            client="FinTech Innovations Ltd",
            date=today.isoformat(),
            start_time="14:00",
            end_time="15:15",
            status="scheduled"
        ),
        Appointment(
            id="apt-py-104",
            title="Vendor Tooling Evaluation Call",
            description="Session cancelled due to vendor reschedule request. Time slot is freed up.",
            assignee="Sarah Chen (Lead PM)",
            client="CloudScale Infrastructure",
            date=today.isoformat(),
            start_time="16:00",
            end_time="17:00",
            status="cancelled"
        ),
        Appointment(
            id="apt-py-105",
            title="Sprint Planning & Backlog Refinement",
            description="Estimate user stories for Sprint 24, finalize sprint commitment and dependencies.",
            assignee="David Kim (Full Stack Eng)",
            client="Core Team",
            date=tomorrow.isoformat(),
            start_time="10:00",
            end_time="11:30",
            status="scheduled"
        ),
        Appointment(
            id="apt-py-106",
            title="Enterprise Architecture Consultation",
            description="Deep dive into microservices scalability, database sharding, and latency benchmarks.",
            assignee="Elena Rostova (Principal Arch)",
            client="Global Logistics Alliance",
            date=tomorrow.isoformat(),
            start_time="14:30",
            end_time="15:30",
            status="scheduled"
        ),
        Appointment(
            id="apt-py-107",
            title="Weekly 1-on-1 Mentorship & Growth",
            description="Career goal setting, engineering feedback, and intern project progress check.",
            assignee="Elena Rostova (Principal Arch)",
            client="Engineering Intern",
            date=day_after.isoformat(),
            start_time="11:00",
            end_time="11:45",
            status="scheduled"
        )
    ]

    for s in samples:
        db.add(s)
    db.commit()
