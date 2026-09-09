import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterToolbar from './components/FilterToolbar';
import KanbanBoard from './components/KanbanBoard';
import TimelineView from './components/TimelineView';
import AppointmentModal from './components/AppointmentModal';
import AboutModal from './components/AboutModal';
import ToastContainer from './components/ToastContainer';
import { api } from './services/api';

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, completed: 0, cancelled: 0 });
  const [dateFilter, setDateFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const loadAppointments = useCallback(async () => {
    try {
      let queryDate = dateFilter;
      const todayIso = new Date().toISOString().split('T')[0];
      const tomorrowObj = new Date();
      tomorrowObj.setDate(tomorrowObj.getDate() + 1);
      const tomorrowIso = tomorrowObj.toISOString().split('T')[0];

      if (dateFilter === 'today') queryDate = todayIso;
      else if (dateFilter === 'tomorrow') queryDate = tomorrowIso;

      const res = await api.getAppointments({
        date: queryDate,
        status: statusFilter,
        search: searchQuery
      });

      setAppointments(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      addToast('error', 'Error Loading Appointments', err.message);
    }
  }, [dateFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Actions
  const handleComplete = async (id) => {
    try {
      await api.updateStatus(id, 'completed');
      addToast('success', 'Status Updated', 'Appointment marked as completed!');
      loadAppointments();
    } catch (err) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this appointment?\n\nThe time slot will be freed up for other bookings while keeping it visible in the Cancelled lane.'
    );
    if (!confirmed) return;

    try {
      await api.updateStatus(id, 'cancelled');
      addToast('info', 'Appointment Cancelled', 'Slot freed up for new bookings.');
      loadAppointments();
    } catch (err) {
      addToast('error', 'Cancellation Failed', err.message);
    }
  };

  const handleReopen = async (id) => {
    try {
      await api.updateStatus(id, 'scheduled');
      addToast('success', 'Appointment Reopened', 'Slot reactivated as scheduled.');
      loadAppointments();
    } catch (err) {
      addToast('error', 'Reopen Failed', err.message);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Permanently delete this appointment record?');
    if (!confirmed) return;

    try {
      await api.deleteAppointment(id);
      addToast('info', 'Deleted', 'Appointment deleted permanently.');
      loadAppointments();
    } catch (err) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const handleModalSubmit = async (formData) => {
    if (editingAppointment) {
      await api.updateAppointment(editingAppointment.id, formData);
      addToast('success', 'Appointment Updated', 'Changes saved successfully.');
    } else {
      await api.createAppointment(formData);
      addToast('success', 'Appointment Created', 'New appointment booked successfully.');
    }
    loadAppointments();
  };

  const handleResetSamples = async () => {
    const confirmed = window.confirm('Reset all appointments back to sample demo data?');
    if (!confirmed) return;

    try {
      await api.resetSamples();
      addToast('success', 'Samples Reset', 'Default appointments re-initialized.');
      loadAppointments();
    } catch (err) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  const handleResetFilters = () => {
    setDateFilter('all');
    setCustomDate('');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="app-layout">
      <Header
        onOpenAdd={() => { setEditingAppointment(null); setIsModalOpen(true); }}
        onOpenAbout={() => setIsAboutOpen(true)}
        onResetSamples={handleResetSamples}
      />

      <main className="main-content">
        <StatsBar
          stats={stats}
          onSelectFilter={(st) => setStatusFilter(st)}
        />

        <FilterToolbar
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredCount={appointments.length}
          onResetFilters={handleResetFilters}
        />

        {viewMode === 'board' ? (
          <KanbanBoard
            appointments={appointments}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onReopen={handleReopen}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <TimelineView
            appointments={appointments}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onReopen={handleReopen}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>TeamSync Appointment Board • Built by <strong>Batchu Mamatha</strong></span>
          <div className="footer-links">
            <button className="footer-btn" onClick={() => setIsAboutOpen(true)}>Architecture & Assumptions</button>
            <span>•</span>
            <span className="footer-tag">React + FastAPI Active</span>
          </div>
        </div>
      </footer>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingAppointment={editingAppointment}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
}
