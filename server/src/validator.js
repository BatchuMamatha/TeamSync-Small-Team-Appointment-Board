/**
 * Appointment Validation & Slot Conflict Detection Service
 */

/**
 * Validates date string in YYYY-MM-DD format
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

/**
 * Validates time string in HH:MM (24-hour) format
 */
function isValidTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

/**
 * Converts HH:MM string into minutes from midnight for safe comparison
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time intervals [startA, endA] and [startB, endB] overlap.
 * Adjacent appointments (e.g. 09:00-10:00 and 10:00-11:00) do NOT overlap.
 */
function isTimeOverlapping(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return aStart < bEnd && aEnd > bStart;
}

/**
 * Validates appointment payload fields
 */
function validateAppointmentPayload(payload, isUpdate = false) {
  const errors = [];

  const { title, date, start_time, end_time, status } = payload;

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title is required.');
    } else if (title.trim().length > 120) {
      errors.push('Title must not exceed 120 characters.');
    }
  }

  if (!isUpdate || date !== undefined) {
    if (!date || !isValidDate(date)) {
      errors.push('A valid date in YYYY-MM-DD format is required.');
    }
  }

  if (!isUpdate || start_time !== undefined) {
    if (!start_time || !isValidTime(start_time)) {
      errors.push('A valid start time in HH:MM format is required.');
    }
  }

  if (!isUpdate || end_time !== undefined) {
    if (!end_time || !isValidTime(end_time)) {
      errors.push('A valid end time in HH:MM format is required.');
    }
  }

  if (start_time && end_time && isValidTime(start_time) && isValidTime(end_time)) {
    const startMin = timeToMinutes(start_time);
    const endMin = timeToMinutes(end_time);
    if (endMin <= startMin) {
      errors.push('End time must be later than start time.');
    }
    // Check minimum duration of 5 minutes
    if (endMin - startMin < 5) {
      errors.push('Appointment duration must be at least 5 minutes.');
    }
  }

  if (status !== undefined) {
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Detects if the proposed appointment slot conflicts with any existing active appointment.
 * Returns { hasConflict: boolean, conflictingAppointment: object | null }
 */
function findSlotConflict(existingAppointments, proposed) {
  const { date, start_time, end_time, id } = proposed;

  for (const appt of existingAppointments) {
    // Exclude the appointment itself when editing
    if (id && String(appt.id) === String(id)) {
      continue;
    }

    // Cancelled appointments do not block time slots
    if (appt.status === 'cancelled') {
      continue;
    }

    // Must be on the same date
    if (appt.date === date) {
      if (isTimeOverlapping(start_time, end_time, appt.start_time, appt.end_time)) {
        return {
          hasConflict: true,
          conflictingAppointment: appt
        };
      }
    }
  }

  return {
    hasConflict: false,
    conflictingAppointment: null
  };
}

module.exports = {
  isValidDate,
  isValidTime,
  timeToMinutes,
  isTimeOverlapping,
  validateAppointmentPayload,
  findSlotConflict
};
