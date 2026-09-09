import sys
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Appointment
from app.schemas import AppointmentCreate, AppointmentUpdate
from app.crud import is_time_overlapping, check_slot_conflict, create_appointment, update_appointment

class TestAppointmentConflictAndValidation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use isolated in-memory SQLite database for test suite
        cls.engine = create_engine("sqlite:///:memory:")
        cls.Session = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        self.db.query(Appointment).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_interval_overlap_logic(self):
        # Adjacent slots do not overlap
        self.assertFalse(is_time_overlapping("09:00", "10:00", "10:00", "11:00"))
        self.assertFalse(is_time_overlapping("10:00", "11:00", "09:00", "10:00"))

        # Overlapping slots
        self.assertTrue(is_time_overlapping("09:30", "10:30", "10:00", "11:00"))
        self.assertTrue(is_time_overlapping("09:00", "12:00", "10:00", "11:00"))

        # Completely disjoint slots
        self.assertFalse(is_time_overlapping("09:00", "10:00", "14:00", "15:00"))

    def test_create_and_prevent_conflict(self):
        # Create initial appointment
        appt1_in = AppointmentCreate(
            title="Design Review",
            date="2026-09-10",
            start_time="10:00",
            end_time="11:00",
            assignee="Sarah Chen",
            client="Acme Corp"
        )
        created1 = create_appointment(self.db, appt1_in)
        self.assertIsNotNone(created1.id)

        # Attempt overlapping slot (10:30 - 11:30)
        has_conflict, conf = check_slot_conflict(
            self.db,
            date="2026-09-10",
            start_time="10:30",
            end_time="11:30"
        )
        self.assertTrue(has_conflict)
        self.assertEqual(conf.id, created1.id)

        # Non-overlapping adjacent slot (11:00 - 12:00) should be allowed
        has_conflict2, _ = check_slot_conflict(
            self.db,
            date="2026-09-10",
            start_time="11:00",
            end_time="12:00"
        )
        self.assertFalse(has_conflict2)

    def test_cancelled_appointment_frees_slot(self):
        appt = create_appointment(self.db, AppointmentCreate(
            title="Client Kickoff",
            date="2026-09-10",
            start_time="14:00",
            end_time="15:00",
            status="cancelled"  # Cancelled slot
        ))

        # Rebooking the exact same slot should succeed because cancelled slots are freed
        has_conflict, _ = check_slot_conflict(
            self.db,
            date="2026-09-10",
            start_time="14:00",
            end_time="15:00"
        )
        self.assertFalse(has_conflict, "Cancelled appointments must not block time slots")

    def test_editing_appointment_ignores_self_collision(self):
        appt = create_appointment(self.db, AppointmentCreate(
            title="Team Sync",
            date="2026-09-10",
            start_time="09:00",
            end_time="10:00"
        ))

        # Update title but keep the same slot — should not conflict with itself
        has_conflict, _ = check_slot_conflict(
            self.db,
            date="2026-09-10",
            start_time="09:00",
            end_time="10:00",
            exclude_id=appt.id
        )
        self.assertFalse(has_conflict, "Self collision on update must be ignored")

if __name__ == "__main__":
    print("--- Running TeamSync FastAPI & SQLAlchemy Test Suite ---")
    unittest.main(verbosity=2)
