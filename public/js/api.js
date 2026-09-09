/**
 * TeamSync API Service
 * Wraps REST endpoints for appointments
 */

const API_BASE = '/api/appointments';

const api = {
  /**
   * Fetch appointments with optional filters
   */
  async getAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date && filters.date !== 'all') params.append('date', filters.date);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch appointments');
    }
    return data;
  },

  /**
   * Fetch single appointment
   */
  async getAppointment(id) {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Appointment not found');
    }
    return data.data;
  },

  /**
   * Create new appointment
   */
  async createAppointment(payload) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || 'Failed to create appointment');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  /**
   * Update existing appointment
   */
  async updateAppointment(id, payload) {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || 'Failed to update appointment');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  /**
   * Update appointment status (scheduled, completed, cancelled)
   */
  async updateStatus(id, status) {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || 'Failed to update status');
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(id) {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete appointment');
    }
    return data;
  },

  /**
   * Reset sample appointments
   */
  async resetSamples() {
    const response = await fetch(`${API_BASE}/reset-samples`, {
      method: 'POST'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset sample data');
    }
    return data;
  }
};
