import React from 'react';
import AppointmentCard from './AppointmentCard';

export default function KanbanBoard({
  appointments,
  onComplete,
  onCancel,
  onReopen,
  onEdit,
  onDelete
}) {
  const scheduled = appointments.filter(a => a.status === 'scheduled');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const renderEmpty = (msg) => (
    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2.5rem 1rem' }}>
      {msg}
    </div>
  );

  return (
    <section className="board-container">
      {/* Scheduled Lane */}
      <div className="board-column">
        <div className="column-header">
          <div className="column-title-group">
            <span className="column-dot dot-scheduled"></span>
            <h3>Scheduled / Upcoming</h3>
          </div>
          <span className="column-badge">{scheduled.length}</span>
        </div>
        <div className="column-cards">
          {scheduled.length > 0 ? (
            scheduled.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onComplete={onComplete}
                onCancel={onCancel}
                onReopen={onReopen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            renderEmpty('No scheduled appointments.')
          )}
        </div>
      </div>

      {/* Completed Lane */}
      <div className="board-column">
        <div className="column-header">
          <div className="column-title-group">
            <span className="column-dot dot-completed"></span>
            <h3>Completed</h3>
          </div>
          <span className="column-badge">{completed.length}</span>
        </div>
        <div className="column-cards">
          {completed.length > 0 ? (
            completed.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onComplete={onComplete}
                onCancel={onCancel}
                onReopen={onReopen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            renderEmpty('No completed appointments.')
          )}
        </div>
      </div>

      {/* Cancelled Lane */}
      <div className="board-column">
        <div className="column-header">
          <div className="column-title-group">
            <span className="column-dot dot-cancelled"></span>
            <h3>Cancelled</h3>
          </div>
          <span className="column-badge">{cancelled.length}</span>
        </div>
        <div className="column-cards">
          {cancelled.length > 0 ? (
            cancelled.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onComplete={onComplete}
                onCancel={onCancel}
                onReopen={onReopen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            renderEmpty('No cancelled appointments.')
          )}
        </div>
      </div>
    </section>
  );
}
