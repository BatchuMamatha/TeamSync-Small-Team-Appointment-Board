import React from 'react';

export default function StatsBar({ stats, onSelectFilter }) {
  return (
    <section className="stats-overview">
      <div className="stat-card" onClick={() => onSelectFilter('all')}>
        <div className="stat-icon stat-icon-total">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectFilter('scheduled')}>
        <div className="stat-icon stat-icon-scheduled">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.scheduled}</div>
          <div className="stat-label">Scheduled / Upcoming</div>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectFilter('completed')}>
        <div className="stat-icon stat-icon-completed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectFilter('cancelled')}>
        <div className="stat-icon stat-icon-cancelled">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Cancelled (Freed Slots)</div>
        </div>
      </div>
    </section>
  );
}
