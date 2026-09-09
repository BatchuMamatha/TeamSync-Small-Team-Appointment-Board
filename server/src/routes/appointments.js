const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateAppointmentPayload, findSlotConflict } = require('../validator');

/**
 * GET /api/appointments
 * Query params: date (YYYY-MM-DD), status (all|scheduled|completed|cancelled), search (string)
 */
router.get('/', (req, res) => {
  try {
    const { date, status, search } = req.query;
    const appointments = db.getAll({ date, status, search });
    const allAppointments = db.readAll();

    // Summary statistics for dashboard widgets
    const stats = {
      total: allAppointments.length,
      scheduled: allAppointments.filter(a => a.status === 'scheduled').length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      cancelled: allAppointments.filter(a => a.status === 'cancelled').length
    };

    res.json({
      success: true,
      data: appointments,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error while fetching appointments.' });
  }
});

/**
 * GET /api/appointments/:id
 */
router.get('/:id', (req, res) => {
  try {
    const appointment = db.getById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * POST /api/appointments
 * Creates new appointment with strict validation and conflict prevention
 */
router.post('/', (req, res) => {
  try {
    const payload = req.body;

    // 1. Validate payload structure and data types
    const validation = validateAppointmentPayload(payload, false);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors[0],
        allErrors: validation.errors
      });
    }

    // 2. Check for slot conflict among existing active appointments
    const existing = db.readAll();
    const conflictResult = findSlotConflict(existing, {
      date: payload.date,
      start_time: payload.start_time,
      end_time: payload.end_time
    });

    if (conflictResult.hasConflict) {
      const conf = conflictResult.conflictingAppointment;
      return res.status(409).json({
        success: false,
        error: `Time slot conflict: Overlaps with "${conf.title}" (${conf.start_time} - ${conf.end_time}).`,
        conflictingAppointment: conf
      });
    }

    // 3. Create appointment
    const created = db.create(payload);
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully.',
      data: created
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ success: false, error: 'Failed to create appointment.' });
  }
});

/**
 * PUT /api/appointments/:id
 * Updates existing appointment with validation and conflict checking
 */
router.put('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const payload = req.body;
    const validation = validateAppointmentPayload(payload, true);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors[0],
        allErrors: validation.errors
      });
    }

    const targetDate = payload.date || existing.date;
    const targetStart = payload.start_time || existing.start_time;
    const targetEnd = payload.end_time || existing.end_time;
    const targetStatus = payload.status || existing.status;

    // If active (or being reactivated), check for conflicts with other active appointments
    if (targetStatus !== 'cancelled') {
      const allAppointments = db.readAll();
      const conflictResult = findSlotConflict(allAppointments, {
        id,
        date: targetDate,
        start_time: targetStart,
        end_time: targetEnd
      });

      if (conflictResult.hasConflict) {
        const conf = conflictResult.conflictingAppointment;
        return res.status(409).json({
          success: false,
          error: `Time slot conflict: Overlaps with "${conf.title}" (${conf.start_time} - ${conf.end_time}).`,
          conflictingAppointment: conf
        });
      }
    }

    const updated = db.update(id, payload);
    res.json({
      success: true,
      message: 'Appointment updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ success: false, error: 'Failed to update appointment.' });
  }
});

/**
 * PATCH /api/appointments/:id/status
 * Quickly mark as completed or cancelled
 */
router.patch('/:id/status', (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}.`
      });
    }

    const existing = db.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    // If un-cancelling back to scheduled/completed, ensure slot is still available
    if (existing.status === 'cancelled' && status !== 'cancelled') {
      const allAppointments = db.readAll();
      const conflictResult = findSlotConflict(allAppointments, {
        id,
        date: existing.date,
        start_time: existing.start_time,
        end_time: existing.end_time
      });

      if (conflictResult.hasConflict) {
        const conf = conflictResult.conflictingAppointment;
        return res.status(409).json({
          success: false,
          error: `Cannot reactivate: Slot now conflicts with "${conf.title}" (${conf.start_time} - ${conf.end_time}).`,
          conflictingAppointment: conf
        });
      }
    }

    const updated = db.updateStatus(id, status);
    
    let message = 'Appointment status updated.';
    if (status === 'completed') message = 'Appointment marked as completed!';
    if (status === 'cancelled') message = 'Appointment cancelled. Time slot is now freed up.';
    if (status === 'scheduled') message = 'Appointment reopened as scheduled.';

    res.json({
      success: true,
      message,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

/**
 * DELETE /api/appointments/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const success = db.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }
    res.json({
      success: true,
      message: 'Appointment deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete appointment.' });
  }
});

/**
 * POST /api/appointments/reset-samples
 * Resets storage back to default sample appointments
 */
router.post('/reset-samples', (req, res) => {
  try {
    const samples = db.resetSamples();
    res.json({
      success: true,
      message: 'Sample appointments reinitialized successfully.',
      data: samples
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset sample data.' });
  }
});

module.exports = router;
