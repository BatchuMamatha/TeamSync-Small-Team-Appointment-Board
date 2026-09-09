# TeamSync — Solution Walkthrough & Verification

A full-stack, responsive web application built for a small team to view, add, update, complete, and cancel appointments with zero double-booking or slot conflicts. Designed with a clean, modern **White and Orange** aesthetic.

---

## 📸 Visual Verification — White & Orange Modern Theme

### 1. Main Kanban Board View
*View appointments organized across three interactive swimlanes: Scheduled, Completed, and Cancelled with clear visual indicators.*
![Main Kanban Board View](./docs/screenshots/board_view.png)

### 2. Add / Edit Appointment Modal
*Quick booking dialog with automatic duration calculation and slot validation.*
![Add Appointment Modal](./docs/screenshots/add_appointment_modal.png)

### 3. Chronological Timeline List View
*Alternative day-by-day chronological view grouped by date.*
![Timeline List View](./docs/screenshots/timeline_view.png)

### 4. Real-Time Slot Conflict Prevention Engine
*Attempting to book an overlapping time slot is instantly blocked with the conflicting meeting details.*
![Conflict Prevention Engine](./docs/screenshots/conflict_prevention.png)

---

## 🎯 Requirements Verification Matrix

| Requirement | Implementation & Behavior | Status |
| :--- | :--- | :---: |
| **Show list or board of appointments** | 3-column Kanban board (Scheduled, Completed, Cancelled) and chronological timeline list view. | ✅ Verified |
| **Add a new appointment** | Modal with validation for Title, Date, Start Time, End Time, Assignee, and Client. | ✅ Verified |
| **Edit an appointment** | Modal opens in edit mode; excludes edited appointment from self-conflict checks. | ✅ Verified |
| **Cancel an appointment** | Changes status to `cancelled`, applies distinct muted/strikethrough styling, and frees up the time slot. | ✅ Verified |
| **Filter by date and status** | Quick date presets ("Today", "Tomorrow", "All Dates"), custom date picker, and status tabs ("Scheduled", "Completed", "Cancelled"). | ✅ Verified |
| **Mark as completed** | One-click transition to `completed`, updates lane and stats metrics. | ✅ Verified |
| **Prevent double-booking** | Interval overlap formula `(startA < endB) && (endA > startB)` prevents collisions and reports conflicting meeting details. | ✅ Verified |
| **Cancelled appointments visible** | Stays visible in the Cancelled swimlane with a clear badge indicating the slot has been freed up. | ✅ Verified |
| **Pre-seeded sample appointments** | Initialized dynamically relative to current date across today and upcoming dates; includes a "Reset Samples" button. | ✅ Verified |
| **Clear success & error messages** | Stacked toast alerts and inline modal error banners. | ✅ Verified |
| **Explanation & assumptions** | In-app "How It Works" modal and comprehensive `README.md`. | ✅ Verified |

---

## 🛡️ Overlap & Conflict Detection Engine

In [`server/src/validator.js`](./server/src/validator.js):
```javascript
function isTimeOverlapping(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}
```

- **Adjacent slots are allowed**: An appointment ending at `10:00` and another starting at `10:00` do not conflict (`10:00 > 10:00` evaluates to false).
- **Cancelled slots are ignored**: When an appointment is cancelled, its time slot is freed for re-booking while preserving the appointment record for auditing.
- **Self-collision ignored during edits**: Modifying descriptions or attendees without altering times does not trigger false conflict warnings.

---

## 🧪 Automated Tests Summary

Command:
```bash
npm test
```
Result:
```text
> appointment-board@1.0.0 test
> node server/test_conflicts.js

--- Running Appointment Board Conflict & Validation Tests ---
✓ Time conversion to minutes works as expected
✓ Overlap detection interval algorithm works perfectly
✓ Payload validation & time ordering passed
✓ Slot conflict detection with status & date awareness passed

ALL CONFLICT & VALIDATION TESTS PASSED SUCCESSFULLY! (10/10 assertions)
```

---

## 🚀 Quick Execution Guide

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Start application
npm start
```
Access the application at: `http://localhost:3000`

---

## 👤 Author & Credits
- **Author**: **Batchu Mamatha** ([@BatchuMamatha](https://github.com/BatchuMamatha))
- **Email**: [Batchumamatha631@gmail.com](mailto:Batchumamatha631@gmail.com)
- **Role**: Full Stack Developer
- **Project**: TeamSync — Small Team Appointment Board
