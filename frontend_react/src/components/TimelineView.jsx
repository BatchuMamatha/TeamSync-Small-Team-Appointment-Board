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

export default function TimelineView({
  appointments,
  onComplete,
  onCancel,
  onReopen,
  onEdit,
  onDelete
}) {
  const groups = {};
  for (const a of appointments) {
    if (!groups[a.date]) groups[a.date] = [];
    groups[a.date].push(a);
  }

  const sortedDates = Object.keys(groups).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <h3>No appointments found</h3>
        <p>Try selecting a different date or status filter.</p>
      </div>
    );
  }

  return (
    <section className="list-container">
      {sortedDates.map((dateKey) => {
        const items = groups[dateKey];
        return (
          <div key={dateKey} className="timeline-group">
            <div className="timeline-group-header">
              <div className="timeline-group-date">
                <span>📅</span>
                <span>{dateKey}</span>
              </div>
              <span className="column-badge">
                {items.length} booking{items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="timeline-items">
              {items.map((appt) => {
                const duration = calculateDuration(appt.start_time, appt.end_time);
                const isCancelled = appt.status === 'cancelled';
                const isCompleted = appt.status === 'completed';

                return (
                  <div key={appt.id} className={`timeline-row card-${appt.status}`}>
                    <div className="timeline-row-left">
                      <div className="timeline-time-col">
                        <span className="timeline-time-range">{appt.start_time} - {appt.end_time}</span>
                        <span className="timeline-time-dur">{duration}</span>
                      </div>
                      <div className="timeline-info-col">
                        <h4 className={`timeline-row-title ${isCancelled ? 'card-cancelled' : ''}`}>
                          {appt.title}
                        </h4>
                        <div className="timeline-row-meta">
                          <span>👤 {appt.assignee || 'General Team'}</span>
                          {appt.client && <span>• 🏢 {appt.client}</span>}
                          {appt.description && (
                            <span>• 📝 {appt.description.substring(0, 60)}{appt.description.length > 60 ? '...' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`card-status-badge badge-${appt.status}`}>
                        {appt.status}
                      </span>
                      <div className="card-actions" style={{ borderTop: 'none', margin: 0, padding: 0 }}>
                        {!isCompleted && !isCancelled && (
                          <button className="card-btn card-btn-complete" onClick={() => onComplete(appt.id)}>✓</button>
                        )}
                        {!isCancelled ? (
                          <button className="card-btn card-btn-cancel" onClick={() => onCancel(appt.id)}>✕</button>
                        ) : (
                          <button className="card-btn card-btn-reopen" onClick={() => onReopen(appt.id)}>↺</button>
                        )}
                        <button className="card-btn card-btn-edit" onClick={() => onEdit(appt)}>✎</button>
                        <button className="card-btn card-btn-delete" onClick={() => onDelete(appt.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
