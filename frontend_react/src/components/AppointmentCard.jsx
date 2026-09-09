import React from 'react';

function calculateDuration(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return '';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export default function AppointmentCard({
  appointment,
  onComplete,
  onCancel,
  onReopen,
  onEdit,
  onDelete
}) {
  const isCancelled = appointment.status === 'cancelled';
  const isCompleted = appointment.status === 'completed';
  const duration = calculateDuration(appointment.start_time, appointment.end_time);

  return (
    <article className={`appointment-card card-${appointment.status}`}>
      <div className="card-top">
        <h4 className="card-title">{appointment.title}</h4>
        <span className={`card-status-badge badge-${appointment.status}`}>
          {appointment.status}
        </span>
      </div>

      <div className="card-timing">
        <span className="card-date-badge">📅 {appointment.date}</span>
        <span className="card-time-badge">⏰ {appointment.start_time} - {appointment.end_time}</span>
        {duration && <span className="card-duration-tag">({duration})</span>}
      </div>

      {appointment.description && (
        <p className="card-description">{appointment.description}</p>
      )}

      <div className="card-meta">
        {appointment.assignee && (
          <div className="meta-item">
            <span className="meta-icon">👤</span>
            <span className="meta-value">{appointment.assignee}</span>
          </div>
        )}
        {appointment.client && (
          <div className="meta-item">
            <span className="meta-icon">🏢</span>
            <span className="meta-value">{appointment.client}</span>
          </div>
        )}
      </div>

      {isCancelled && (
        <div className="cancelled-slot-notice">
          <span>ℹ️</span>
          <span>Cancelled — this time slot is freed up for rebooking.</span>
        </div>
      )}

      <div className="card-actions">
        {!isCompleted && !isCancelled && (
          <button
            className="card-btn card-btn-complete"
            onClick={() => onComplete(appointment.id)}
            title="Mark as Completed"
          >
            ✓ Complete
          </button>
        )}

        {!isCancelled ? (
          <button
            className="card-btn card-btn-cancel"
            onClick={() => onCancel(appointment.id)}
            title="Cancel Appointment"
          >
            ✕ Cancel
          </button>
        ) : (
          <button
            className="card-btn card-btn-reopen"
            onClick={() => onReopen(appointment.id)}
            title="Reopen Appointment"
          >
            ↺ Reopen
          </button>
        )}

        {isCompleted && !isCancelled && (
          <button
            className="card-btn card-btn-reopen"
            onClick={() => onReopen(appointment.id)}
            title="Move back to scheduled"
          >
            ↺ Reopen
          </button>
        )}

        <button
          className="card-btn card-btn-edit"
          onClick={() => onEdit(appointment)}
          title="Edit Details"
        >
          ✎ Edit
        </button>

        <button
          className="card-btn card-btn-delete"
          onClick={() => onDelete(appointment.id)}
          title="Delete permanently"
        >
          🗑
        </button>
      </div>
    </article>
  );
}
