import React, { useState, useEffect } from 'react';

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  editingAppointment
}) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    assignee: 'Sarah Chen (Lead PM)',
    client: '',
    description: '',
    status: 'scheduled'
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        title: editingAppointment.title || '',
        date: editingAppointment.date || '',
        start_time: editingAppointment.start_time || '09:00',
        end_time: editingAppointment.end_time || '10:00',
        assignee: editingAppointment.assignee || 'General Team',
        client: editingAppointment.client || '',
        description: editingAppointment.description || '',
        status: editingAppointment.status || 'scheduled'
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        date: today,
        start_time: '09:00',
        end_time: '10:00',
        assignee: 'Sarah Chen (Lead PM)',
        client: '',
        description: '',
        status: 'scheduled'
      });
    }
    setErrorMessage('');
  }, [editingAppointment, isOpen]);

  if (!isOpen) return null;

  // Duration calculation
  let durationText = '';
  if (formData.start_time && formData.end_time) {
    const [sh, sm] = formData.start_time.split(':').map(Number);
    const [eh, em] = formData.end_time.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) {
      durationText = '⚠️ End time must be after start time';
    } else {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      let dur = '';
      if (hours > 0) dur += `${hours} hr${hours > 1 ? 's' : ''} `;
      if (mins > 0) dur += `${mins} min`;
      durationText = `Calculated Duration: ${dur.trim()}`;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Appointment title is required.');
      return;
    }
    if (!formData.date) {
      setErrorMessage('Appointment date is required.');
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      setErrorMessage('Start and end times are required.');
      return;
    }

    const [sh, sm] = formData.start_time.split(':').map(Number);
    const [eh, em] = formData.end_time.split(':').map(Number);
    if ((eh * 60 + em) <= (sh * 60 + sm)) {
      setErrorMessage('End time must be later than start time.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Error saving appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 className="modal-heading">
                {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
              </h2>
              <p className="modal-subheading">
                Fill in details. Overlapping appointments on the same date are prevented.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert-banner alert-error">
              <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Appointment Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Client Consultation, Strategy Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label className="form-label">
                Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Start Time <span className="required-star">*</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                End Time <span className="required-star">*</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          {durationText && (
            <div className="duration-preview-bar">
              <span>⏱</span>
              <span>{durationText}</span>
            </div>
          )}

          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Team Member / Host</label>
              <select
                className="form-input form-select"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              >
                <option value="Sarah Chen (Lead PM)">Sarah Chen (Lead PM)</option>
                <option value="David Kim (Full Stack Eng)">David Kim (Full Stack Eng)</option>
                <option value="Alex Rivera (Design Lead)">Alex Rivera (Design Lead)</option>
                <option value="Elena Rostova (Principal Arch)">Elena Rostova (Principal Arch)</option>
                <option value="General Team">General Team</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Client / Attendee</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acme Corp, Intern, Leadership"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Agenda Notes</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Key discussion points, meeting links, or prep materials..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {editingAppointment && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="scheduled">Scheduled / Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="modal-footer" style={{ padding: 0, marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingAppointment ? 'Save Changes' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
