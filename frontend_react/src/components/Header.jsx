import React from 'react';

export default function Header({ onOpenAdd, onOpenAbout, onResetSamples }) {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formattedDate = `Today is ${now.toLocaleDateString(undefined, options)}`;

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="m9 16 2 2 4-4"></path>
          </svg>
          <div className="brand-text">
            <div className="brand-title">TeamSync <span className="brand-badge">PRO</span></div>
            <div className="brand-subtitle">React + FastAPI Edition</div>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="time-display">
          <span className="live-dot"></span>
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="header-right">
        <button className="btn btn-secondary" onClick={onOpenAbout} title="View architecture & assumptions">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>How It Works</span>
        </button>

        <button className="btn btn-ghost" onClick={onResetSamples} title="Reinitialize sample appointments">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          <span>Reset Samples</span>
        </button>

        <button className="btn btn-primary" onClick={onOpenAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Appointment</span>
        </button>
      </div>
    </header>
  );
}
