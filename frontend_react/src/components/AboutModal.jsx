import React from 'react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge info-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <h2 className="modal-heading">How TeamSync Works & Assumptions</h2>
              <p className="modal-subheading">Designed & Developed by <strong>Batchu Mamatha</strong></p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-scroll-body">
          <div className="info-section">
            <h3>⚡ Core Architecture: React + FastAPI Edition</h3>
            <ul className="info-checklist">
              <li><strong>Modern React Frontend:</strong> Built using Vite, functional components, hooks, and responsive custom CSS.</li>
              <li><strong>FastAPI & SQLAlchemy Backend:</strong> Asynchronous Python REST API with Pydantic validation and SQLite/PostgreSQL support.</li>
              <li><strong>Dual Views:</strong> Toggle between 3-lane Kanban board and chronological Timeline view.</li>
              <li><strong>Full Appointment Lifecycle:</strong> Create, update, complete, and cancel appointments with immediate status badges.</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>🛡️ Slot Conflict Detection Engine</h3>
            <p>The system enforces zero double-booking using interval overlap arithmetic:</p>
            <div className="code-box">
              <code>(new_start &lt; existing_end) and (new_end &gt; existing_start)</code>
            </div>
            <ul className="info-bullets">
              <li><strong>Adjacent slots allowed:</strong> Consecutive slots (e.g. 09:00-10:00 and 10:00-11:00) do not collide.</li>
              <li><strong>Cancelled slots freed:</strong> Cancelled appointments stay on the board for auditing while freeing the time slot for others.</li>
              <li><strong>Self-conflict excluded:</strong> Edits to titles or descriptions do not trigger false conflict warnings on the same slot.</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>💡 Key Assumptions & Authorship</h3>
            <ol className="info-ordered">
              <li><strong>Author:</strong> <strong>Batchu Mamatha</strong> ([@BatchuMamatha](https://github.com/BatchuMamatha)).</li>
              <li><strong>Shared Calendar:</strong> Disallows double-booking on the same date for the team's shared appointment schedule.</li>
              <li><strong>Immediate Review:</strong> Initialized with pre-seeded test appointments spanning today, tomorrow, and upcoming dates.</li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>Got It</button>
        </div>
      </div>
    </div>
  );
}
