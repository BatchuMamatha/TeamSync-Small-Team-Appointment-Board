const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'appointments.json');

/**
 * Format a Date object into YYYY-MM-DD
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generate rich initial sample appointments relative to the current date
 */
function getInitialSampleData() {
  const now = new Date();
  
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);

  return [
    {
      id: 'apt-101',
      title: 'Quarterly Product Strategy Sync',
      description: 'Discuss Q4 roadmap milestones, feature priorities, and team resource allocation.',
      assignee: 'Sarah Chen (Lead PM)',
      client: 'Internal Leadership',
      date: formatDate(today),
      start_time: '09:30',
      end_time: '10:30',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'apt-102',
      title: 'UX Design Critique: Dashboard Redesign',
      description: 'Review high-fidelity interactive prototypes for the analytics overview screen.',
      assignee: 'Alex Rivera (Design Lead)',
      client: 'Acme Health Corp',
      date: formatDate(today),
      start_time: '11:00',
      end_time: '12:00',
      status: 'scheduled',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'apt-103',
      title: 'Initial Client Onboarding & Tech Kickoff',
      description: 'Walkthrough API authentication, webhook setup, and sandbox test credentials.',
      assignee: 'David Kim (Full Stack Eng)',
      client: 'FinTech Innovations Ltd',
      date: formatDate(today),
      start_time: '14:00',
      end_time: '15:15',
      status: 'scheduled',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'apt-104',
      title: 'Vendor Tooling Evaluation Call',
      description: 'Session cancelled due to vendor reschedule request. Time slot is freed up.',
      assignee: 'Sarah Chen (Lead PM)',
      client: 'CloudScale Infrastructure',
      date: formatDate(today),
      start_time: '16:00',
      end_time: '17:00',
      status: 'cancelled',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'apt-105',
      title: 'Sprint Planning & Backlog Refinement',
      description: 'Estimate user stories for Sprint 24, finalize sprint commitment and dependencies.',
      assignee: 'David Kim (Full Stack Eng)',
      client: 'Core Team',
      date: formatDate(tomorrow),
      start_time: '10:00',
      end_time: '11:30',
      status: 'scheduled',
      created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: 'apt-106',
      title: 'Enterprise Architecture Consultation',
      description: 'Deep dive into microservices scalability, database sharding, and latency benchmarks.',
      assignee: 'Elena Rostova (Principal Arch)',
      client: 'Global Logistics Alliance',
      date: formatDate(tomorrow),
      start_time: '14:30',
      end_time: '15:30',
      status: 'scheduled',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'apt-107',
      title: 'Weekly 1-on-1 Mentorship & Growth',
      description: 'Career goal setting, engineering feedback, and intern project progress check.',
      assignee: 'Elena Rostova (Principal Arch)',
      client: 'Engineering Intern',
      date: formatDate(dayAfterTomorrow),
      start_time: '11:00',
      end_time: '11:45',
      status: 'scheduled',
      created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 15).toISOString()
    }
  ];
}

class Database {
  constructor() {
    this.ensureDataDir();
    this.initData();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  initData() {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialSampleData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  }

  resetSamples() {
    const samples = getInitialSampleData();
    this.writeAll(samples);
    return samples;
  }

  readAll() {
    try {
      this.ensureDataDir();
      if (!fs.existsSync(DATA_FILE)) {
        this.initData();
      }
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading appointments data file, reinitializing:', err);
      const initial = getInitialSampleData();
      this.writeAll(initial);
      return initial;
    }
  }

  writeAll(data) {
    this.ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  getAll(filters = {}) {
    let appointments = this.readAll();

    if (filters.date) {
      appointments = appointments.filter(a => a.date === filters.date);
    }

    if (filters.status && filters.status !== 'all') {
      appointments = appointments.filter(a => a.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      appointments = appointments.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        (a.assignee && a.assignee.toLowerCase().includes(q)) ||
        (a.client && a.client.toLowerCase().includes(q))
      );
    }

    // Sort chronologically: by date asc, start_time asc
    appointments.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.start_time.localeCompare(b.start_time);
    });

    return appointments;
  }

  getById(id) {
    const appointments = this.readAll();
    return appointments.find(a => String(a.id) === String(id)) || null;
  }

  create(appointmentData) {
    const appointments = this.readAll();
    const newId = 'apt-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    
    const newAppointment = {
      id: newId,
      title: appointmentData.title.trim(),
      description: (appointmentData.description || '').trim(),
      assignee: (appointmentData.assignee || 'General Team').trim(),
      client: (appointmentData.client || '').trim(),
      date: appointmentData.date,
      start_time: appointmentData.start_time,
      end_time: appointmentData.end_time,
      status: appointmentData.status || 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    appointments.push(newAppointment);
    this.writeAll(appointments);
    return newAppointment;
  }

  update(id, updates) {
    const appointments = this.readAll();
    const index = appointments.findIndex(a => String(a.id) === String(id));
    if (index === -1) return null;

    const existing = appointments[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      updated_at: new Date().toISOString()
    };

    appointments[index] = updated;
    this.writeAll(appointments);
    return updated;
  }

  updateStatus(id, status) {
    return this.update(id, { status });
  }

  delete(id) {
    const appointments = this.readAll();
    const index = appointments.findIndex(a => String(a.id) === String(id));
    if (index === -1) return false;

    appointments.splice(index, 1);
    this.writeAll(appointments);
    return true;
  }
}

module.exports = new Database();
