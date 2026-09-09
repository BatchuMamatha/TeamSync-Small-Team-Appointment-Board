const API_BASE = '/api/appointments';

export const api = {
  async getAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.date && filters.date !== 'all') params.append('date', filters.date);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to fetch appointments');
    }
    return data;
  },

  async getAppointment(id) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Appointment not found');
    }
    return data.data || data;
  },

  async createAppointment(payload) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.detail || data.error || 'Failed to create appointment');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async updateAppointment(id, payload) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.detail || data.error || 'Failed to update appointment');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async updateStatus(id, status) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.detail || data.error || 'Failed to update status');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async deleteAppointment(id) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to delete appointment');
    }
    return data;
  },

  async resetSamples() {
    const res = await fetch(`${API_BASE}/reset-samples`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Failed to reset sample data');
    }
    return data;
  }
};
