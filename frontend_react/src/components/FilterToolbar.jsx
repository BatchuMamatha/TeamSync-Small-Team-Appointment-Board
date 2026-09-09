import React from 'react';

export default function FilterToolbar({
  dateFilter,
  setDateFilter,
  customDate,
  setCustomDate,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  filteredCount,
  onResetFilters
}) {
  const isFiltered = dateFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <section className="toolbar">
      <div className="toolbar-row-top">
        <div className="date-controls">
          <span className="control-label">Date Filter:</span>
          <div className="pill-group">
            <button
              className={`pill ${dateFilter === 'all' && !customDate ? 'active' : ''}`}
              onClick={() => { setDateFilter('all'); setCustomDate(''); }}
            >
              All Dates
            </button>
            <button
              className={`pill ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => { setDateFilter('today'); setCustomDate(''); }}
            >
              Today
            </button>
            <button
              className={`pill ${dateFilter === 'tomorrow' ? 'active' : ''}`}
              onClick={() => { setDateFilter('tomorrow'); setCustomDate(''); }}
            >
              Tomorrow
            </button>
          </div>

          <div className="custom-date-wrapper">
            <input
              type="date"
              className="date-input"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDateFilter(e.target.value);
              }}
              title="Filter by specific date"
            />
            {customDate && (
              <button
                className="btn-icon-clear"
                onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                title="Clear date"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="status-controls">
          <span className="control-label">Status:</span>
          <div className="pill-group">
            {['all', 'scheduled', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                className={`pill ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar-row-bottom">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by title, description, team member, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn-clear-search" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="view-switch-wrapper">
          <span className="control-label">View:</span>
          <div className="view-switch-buttons">
            <button
              className={`btn-toggle ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Kanban Board View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
              <span>Board</span>
            </button>
            <button
              className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Timeline List View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <span>List / Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {isFiltered && (
        <div className="active-filter-indicator">
          <span>Showing {filteredCount} matching appointment(s)</span>
          <button className="btn-link" onClick={onResetFilters}>Reset all filters</button>
        </div>
      )}
    </section>
  );
}
