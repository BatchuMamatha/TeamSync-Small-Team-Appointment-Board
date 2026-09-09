/**
 * TeamSync - Appointment Board Controller
 * Manages UI state, views, modal lifecycle, toasts, and reactive updates
 */

(function () {
  'use strict';

  // State
  const state = {
    appointments: [],
    stats: { total: 0, scheduled: 0, completed: 0, cancelled: 0 },
    dateFilter: 'all', // 'all', 'today', 'tomorrow', or 'YYYY-MM-DD'
    statusFilter: 'all', // 'all', 'scheduled', 'completed', 'cancelled'
    searchQuery: '',
    viewMode: 'board', // 'board' or 'list'
    editingId: null
  };

  // DOM Elements
  const elements = {
    // Stats
    statTotal: document.getElementById('statTotal'),
    statScheduled: document.getElementById('statScheduled'),
    statCompleted: document.getElementById('statCompleted'),
    statCancelled: document.getElementById('statCancelled'),
    statsOverview: document.getElementById('statsOverview'),

    // Date & Status Toolbar
    datePillGroup: document.getElementById('datePillGroup'),
    customDateInput: document.getElementById('customDateInput'),
    btnClearCustomDate: document.getElementById('btnClearCustomDate'),
    statusPillGroup: document.getElementById('statusPillGroup'),
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterIndicator: document.getElementById('filterIndicator'),
    filterIndicatorText: document.getElementById('filterIndicatorText'),
    btnResetAllFilters: document.getElementById('btnResetAllFilters'),

    // View switch
    btnViewBoard: document.getElementById('btnViewBoard'),
    btnViewList: document.getElementById('btnViewList'),
    boardView: document.getElementById('boardView'),
    listView: document.getElementById('listView'),
    emptyState: document.getElementById('emptyState'),
    emptyTitle: document.getElementById('emptyTitle'),
    emptySubtitle: document.getElementById('emptySubtitle'),

    // Board columns & counts
    cardsScheduled: document.getElementById('cardsScheduled'),
    cardsCompleted: document.getElementById('cardsCompleted'),
    cardsCancelled: document.getElementById('cardsCancelled'),
    countScheduled: document.getElementById('countScheduled'),
    countCompleted: document.getElementById('countCompleted'),
    countCancelled: document.getElementById('countCancelled'),
    timelineList: document.getElementById('timelineList'),

    // Modals
    appointmentModal: document.getElementById('appointmentModal'),
    modalTitle: document.getElementById('modalTitle'),
    appointmentForm: document.getElementById('appointmentForm'),
    formAppointmentId: document.getElementById('formAppointmentId'),
    formTitle: document.getElementById('formTitle'),
    formDate: document.getElementById('formDate'),
    formStartTime: document.getElementById('formStartTime'),
    formEndTime: document.getElementById('formEndTime'),
    formAssignee: document.getElementById('formAssignee'),
    formClient: document.getElementById('formClient'),
    formDescription: document.getElementById('formDescription'),
    formStatusGroup: document.getElementById('formStatusGroup'),
    formStatus: document.getElementById('formStatus'),
    formErrorBanner: document.getElementById('formErrorBanner'),
    formErrorMessage: document.getElementById('formErrorMessage'),
    submitBtnText: document.getElementById('submitBtnText'),
    durationPreviewText: document.getElementById('durationPreviewText'),

    // Buttons
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnEmptyAdd: document.getElementById('btnEmptyAdd'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnAbout: document.getElementById('btnAbout'),
    aboutModal: document.getElementById('aboutModal'),
    btnCloseAboutModal: document.getElementById('btnCloseAboutModal'),
    btnCloseAboutBtn: document.getElementById('btnCloseAboutBtn'),
    footerAboutBtn: document.getElementById('footerAboutBtn'),
    btnResetSamples: document.getElementById('btnResetSamples'),

    // Miscellaneous
    headerLiveDate: document.getElementById('headerLiveDate'),
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Helper: Format Date object to YYYY-MM-DD
   */
  function formatDateToIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const TODAY_STR = formatDateToIso(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const TOMORROW_STR = formatDateToIso(tomorrowObj);

  /**
   * Initialize App
   */
  async function init() {
    renderHeaderDate();
    setupEventListeners();
    await loadAppointments();
  }

  /**
   * Update header date display
   */
  function renderHeaderDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    elements.headerLiveDate.textContent = `Today is ${now.toLocaleDateString(undefined, options)}`;
  }

  /**
   * Load appointments from API
   */
  async function loadAppointments() {
    try {
      let queryDate = undefined;
      if (state.dateFilter === 'today') queryDate = TODAY_STR;
      else if (state.dateFilter === 'tomorrow') queryDate = TOMORROW_STR;
      else if (state.dateFilter !== 'all') queryDate = state.dateFilter;

      const res = await api.getAppointments({
        date: queryDate,
        status: state.statusFilter,
        search: state.searchQuery
      });

      state.appointments = res.data || [];
      if (res.stats) {
        state.stats = res.stats;
      }
      render();
    } catch (err) {
      showToast('error', 'Error Loading Appointments', err.message);
    }
  }

  /**
   * Main Render Function
   */
  function render() {
    renderStats();
    renderFilterIndicator();

    if (state.viewMode === 'board') {
      elements.boardView.classList.remove('hidden');
      elements.listView.classList.add('hidden');
      renderBoardView();
    } else {
      elements.boardView.classList.add('hidden');
      elements.listView.classList.remove('hidden');
      renderListView();
    }
  }

  /**
   * Render Stats Cards
   */
  function renderStats() {
    elements.statTotal.textContent = state.stats.total;
    elements.statScheduled.textContent = state.stats.scheduled;
    elements.statCompleted.textContent = state.stats.completed;
    elements.statCancelled.textContent = state.stats.cancelled;
  }

  /**
   * Render Filter Indicator bar
   */
  function renderFilterIndicator() {
    const isFiltered = state.dateFilter !== 'all' || state.statusFilter !== 'all' || state.searchQuery.trim() !== '';
    if (isFiltered) {
      elements.filterIndicator.style.display = 'flex';
      const parts = [];
      if (state.dateFilter === 'today') parts.push('Date: Today');
      else if (state.dateFilter === 'tomorrow') parts.push('Date: Tomorrow');
      else if (state.dateFilter !== 'all') parts.push(`Date: ${state.dateFilter}`);

      if (state.statusFilter !== 'all') {
        parts.push(`Status: ${capitalize(state.statusFilter)}`);
      }
      if (state.searchQuery.trim()) {
        parts.push(`Search: "${state.searchQuery}"`);
      }
      elements.filterIndicatorText.textContent = `Showing ${state.appointments.length} appointment(s) matching [ ${parts.join(' • ')} ]`;
    } else {
      elements.filterIndicator.style.display = 'none';
    }
  }

  /**
   * Render Kanban Board View
   */
  function renderBoardView() {
    const scheduled = state.appointments.filter(a => a.status === 'scheduled');
    const completed = state.appointments.filter(a => a.status === 'completed');
    const cancelled = state.appointments.filter(a => a.status === 'cancelled');

    // Update column badge counts
    elements.countScheduled.textContent = scheduled.length;
    elements.countCompleted.textContent = completed.length;
    elements.countCancelled.textContent = cancelled.length;

    // Render cards into lanes
    elements.cardsScheduled.innerHTML = scheduled.map(createCardHtml).join('') || renderEmptyLaneHtml('No scheduled appointments.');
    elements.cardsCompleted.innerHTML = completed.map(createCardHtml).join('') || renderEmptyLaneHtml('No completed appointments.');
    elements.cardsCancelled.innerHTML = cancelled.map(createCardHtml).join('') || renderEmptyLaneHtml('No cancelled appointments.');

    // Toggle overall empty state
    if (state.appointments.length === 0) {
      elements.emptyState.classList.remove('hidden');
    } else {
      elements.emptyState.classList.add('hidden');
    }
  }

  function renderEmptyLaneHtml(message) {
    return `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 2.5rem 1rem;">${message}</div>`;
  }

  /**
   * Render Chronological Timeline List View
   */
  function renderListView() {
    if (state.appointments.length === 0) {
      elements.timelineList.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    // Group by date
    const groups = {};
    for (const appt of state.appointments) {
      if (!groups[appt.date]) groups[appt.date] = [];
      groups[appt.date].push(appt);
    }

    const sortedDates = Object.keys(groups).sort();

    elements.timelineList.innerHTML = sortedDates.map(dateKey => {
      const items = groups[dateKey];
      const friendlyDate = formatFriendlyDate(dateKey);

      return `
        <div class="timeline-group">
          <div class="timeline-group-header">
            <div class="timeline-group-date">
              <span>📅</span>
              <span>${escapeHtml(friendlyDate)}</span>
            </div>
            <span class="column-badge">${items.length} booking${items.length === 1 ? '' : 's'}</span>
          </div>
          <div class="timeline-items">
            ${items.map(createTimelineRowHtml).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generates HTML for an individual appointment card in Kanban board
   */
  function createCardHtml(appt) {
    const isCancelled = appt.status === 'cancelled';
    const isCompleted = appt.status === 'completed';
    const friendlyDate = formatFriendlyDate(appt.date);
    const duration = calculateDurationMinutes(appt.start_time, appt.end_time);

    return `
      <article class="appointment-card card-${appt.status}" data-id="${escapeHtml(appt.id)}">
        <div class="card-top">
          <h4 class="card-title">${escapeHtml(appt.title)}</h4>
          <span class="card-status-badge badge-${appt.status}">
            ${escapeHtml(appt.status)}
          </span>
        </div>

        <div class="card-timing">
          <span class="card-date-badge">📅 ${escapeHtml(friendlyDate)}</span>
          <span class="card-time-badge">⏰ ${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</span>
          <span class="card-duration-tag">(${duration})</span>
        </div>

        ${appt.description ? `<p class="card-description">${escapeHtml(appt.description)}</p>` : ''}

        <div class="card-meta">
          ${appt.assignee ? `
            <div class="meta-item">
              <span class="meta-icon">👤</span>
              <span class="meta-value">${escapeHtml(appt.assignee)}</span>
            </div>
          ` : ''}
          ${appt.client ? `
            <div class="meta-item">
              <span class="meta-icon">🏢</span>
              <span class="meta-value">${escapeHtml(appt.client)}</span>
            </div>
          ` : ''}
        </div>

        ${isCancelled ? `
          <div class="cancelled-slot-notice">
            <span>ℹ️</span>
            <span>Cancelled — this time slot is freed up for rebooking.</span>
          </div>
        ` : ''}

        <div class="card-actions">
          ${!isCompleted && !isCancelled ? `
            <button class="card-btn card-btn-complete" data-action="complete" data-id="${escapeHtml(appt.id)}" title="Mark as Completed">
              ✓ Complete
            </button>
          ` : ''}

          ${!isCancelled ? `
            <button class="card-btn card-btn-cancel" data-action="cancel" data-id="${escapeHtml(appt.id)}" title="Cancel Appointment">
              ✕ Cancel
            </button>
          ` : `
            <button class="card-btn card-btn-reopen" data-action="reopen" data-id="${escapeHtml(appt.id)}" title="Reopen Appointment">
              ↺ Reopen
            </button>
          `}

          ${isCompleted && !isCancelled ? `
            <button class="card-btn card-btn-reopen" data-action="reopen" data-id="${escapeHtml(appt.id)}" title="Move back to scheduled">
              ↺ Reopen
            </button>
          ` : ''}

          <button class="card-btn card-btn-edit" data-action="edit" data-id="${escapeHtml(appt.id)}" title="Edit Details">
            ✎ Edit
          </button>

          <button class="card-btn card-btn-delete" data-action="delete" data-id="${escapeHtml(appt.id)}" title="Delete permanently">
            🗑
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Generates HTML for Timeline Row
   */
  function createTimelineRowHtml(appt) {
    const isCancelled = appt.status === 'cancelled';
    const isCompleted = appt.status === 'completed';
    const duration = calculateDurationMinutes(appt.start_time, appt.end_time);

    return `
      <div class="timeline-row card-${appt.status}" data-id="${escapeHtml(appt.id)}">
        <div class="timeline-row-left">
          <div class="timeline-time-col">
            <span class="timeline-time-range">${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)}</span>
            <span class="timeline-time-dur">${duration}</span>
          </div>

          <div class="timeline-info-col">
            <h4 class="timeline-row-title ${isCancelled ? 'card-cancelled' : ''}">${escapeHtml(appt.title)}</h4>
            <div class="timeline-row-meta">
              <span>👤 ${escapeHtml(appt.assignee || 'General Team')}</span>
              ${appt.client ? `<span>• 🏢 ${escapeHtml(appt.client)}</span>` : ''}
              ${appt.description ? `<span>• 📝 ${escapeHtml(appt.description.substring(0, 60))}${appt.description.length > 60 ? '...' : ''}</span>` : ''}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="card-status-badge badge-${appt.status}">
            ${escapeHtml(appt.status)}
          </span>

          <div class="card-actions" style="border-top: none; margin: 0; padding: 0;">
            ${!isCompleted && !isCancelled ? `
              <button class="card-btn card-btn-complete" data-action="complete" data-id="${escapeHtml(appt.id)}">✓</button>
            ` : ''}
            ${!isCancelled ? `
              <button class="card-btn card-btn-cancel" data-action="cancel" data-id="${escapeHtml(appt.id)}">✕</button>
            ` : `
              <button class="card-btn card-btn-reopen" data-action="reopen" data-id="${escapeHtml(appt.id)}">↺</button>
            `}
            <button class="card-btn card-btn-edit" data-action="edit" data-id="${escapeHtml(appt.id)}">✎</button>
            <button class="card-btn card-btn-delete" data-action="delete" data-id="${escapeHtml(appt.id)}">🗑</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Open Add Modal
    elements.btnOpenAddModal.addEventListener('click', () => openModalForCreate());
    elements.btnEmptyAdd.addEventListener('click', () => openModalForCreate());

    // Close Modal
    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.btnCancelModal.addEventListener('click', closeModal);
    elements.appointmentModal.addEventListener('click', (e) => {
      if (e.target === elements.appointmentModal) closeModal();
    });

    // About Modal
    elements.btnAbout.addEventListener('click', openAboutModal);
    elements.footerAboutBtn.addEventListener('click', openAboutModal);
    elements.btnCloseAboutModal.addEventListener('click', closeAboutModal);
    elements.btnCloseAboutBtn.addEventListener('click', closeAboutModal);
    elements.aboutModal.addEventListener('click', (e) => {
      if (e.target === elements.aboutModal) closeAboutModal();
    });

    // Reset Sample Data
    elements.btnResetSamples.addEventListener('click', handleResetSamples);

    // Escape Key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeAboutModal();
      }
    });

    // Date Presets (Pills)
    elements.datePillGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      elements.datePillGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      state.dateFilter = btn.dataset.date;
      elements.customDateInput.value = '';
      elements.btnClearCustomDate.classList.add('hidden');
      loadAppointments();
    });

    // Custom Date Input
    elements.customDateInput.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        state.dateFilter = val;
        elements.datePillGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        elements.btnClearCustomDate.classList.remove('hidden');
        loadAppointments();
      }
    });

    elements.btnClearCustomDate.addEventListener('click', () => {
      elements.customDateInput.value = '';
      elements.btnClearCustomDate.classList.add('hidden');
      state.dateFilter = 'all';
      elements.datePillGroup.querySelector('[data-date="all"]').classList.add('active');
      loadAppointments();
    });

    // Status Presets (Pills)
    elements.statusPillGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      elements.statusPillGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      state.statusFilter = btn.dataset.status;
      loadAppointments();
    });

    // Stats Overview quick filter clicks
    elements.statsOverview.addEventListener('click', (e) => {
      const card = e.target.closest('.stat-card');
      if (!card) return;
      const targetStatus = card.dataset.filter;
      if (targetStatus) {
        state.statusFilter = targetStatus;
        elements.statusPillGroup.querySelectorAll('.pill').forEach(p => {
          p.classList.toggle('active', p.dataset.status === targetStatus);
        });
        loadAppointments();
      }
    });

    // Realtime Search
    let searchDebounceTimer = null;
    elements.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      elements.btnClearSearch.classList.toggle('hidden', !val);
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.searchQuery = val;
        loadAppointments();
      }, 250);
    });

    elements.btnClearSearch.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.btnClearSearch.classList.add('hidden');
      state.searchQuery = '';
      loadAppointments();
    });

    // Reset all filters button
    elements.btnResetAllFilters.addEventListener('click', () => {
      state.dateFilter = 'all';
      state.statusFilter = 'all';
      state.searchQuery = '';
      elements.searchInput.value = '';
      elements.customDateInput.value = '';
      elements.btnClearSearch.classList.add('hidden');
      elements.btnClearCustomDate.classList.add('hidden');
      elements.datePillGroup.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p.dataset.date === 'all'));
      elements.statusPillGroup.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p.dataset.status === 'all'));
      loadAppointments();
    });

    // View Switcher
    elements.btnViewBoard.addEventListener('click', () => {
      state.viewMode = 'board';
      elements.btnViewBoard.classList.add('active');
      elements.btnViewList.classList.remove('active');
      render();
    });

    elements.btnViewList.addEventListener('click', () => {
      state.viewMode = 'list';
      elements.btnViewList.classList.add('active');
      elements.btnViewBoard.classList.remove('active');
      render();
    });

    // Card Action Delegation (Board & List views)
    document.addEventListener('click', handleCardActionClick);

    // Modal Form Inputs: Duration calculation preview
    elements.formStartTime.addEventListener('input', updateDurationPreview);
    elements.formEndTime.addEventListener('input', updateDurationPreview);

    // Form Submit
    elements.appointmentForm.addEventListener('submit', handleFormSubmit);
  }

  /**
   * Handle card buttons: Complete, Cancel, Reopen, Edit, Delete
   */
  async function handleCardActionClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!id) return;

    if (action === 'complete') {
      try {
        const res = await api.updateStatus(id, 'completed');
        showToast('success', 'Status Updated', res.message);
        await loadAppointments();
      } catch (err) {
        showToast('error', 'Update Failed', err.message);
      }
    } else if (action === 'cancel') {
      const confirmed = confirm('Are you sure you want to cancel this appointment?\n\nCancelled appointments will remain visible in the Cancelled lane, and the time slot will be freed up for other bookings.');
      if (!confirmed) return;
      try {
        const res = await api.updateStatus(id, 'cancelled');
        showToast('info', 'Appointment Cancelled', res.message);
        await loadAppointments();
      } catch (err) {
        showToast('error', 'Cancellation Failed', err.message);
      }
    } else if (action === 'reopen') {
      try {
        const res = await api.updateStatus(id, 'scheduled');
        showToast('success', 'Appointment Reopened', res.message);
        await loadAppointments();
      } catch (err) {
        showToast('error', 'Reopening Failed', err.message);
      }
    } else if (action === 'edit') {
      openModalForEdit(id);
    } else if (action === 'delete') {
      const confirmed = confirm('Permanently delete this appointment record?');
      if (!confirmed) return;
      try {
        const res = await api.deleteAppointment(id);
        showToast('info', 'Deleted', res.message);
        await loadAppointments();
      } catch (err) {
        showToast('error', 'Delete Failed', err.message);
      }
    }
  }

  /**
   * Reset sample data handler
   */
  async function handleResetSamples() {
    const confirmed = confirm('Reset all appointments back to initial sample test data?');
    if (!confirmed) return;
    try {
      const res = await api.resetSamples();
      showToast('success', 'Samples Reset', res.message);
      await loadAppointments();
    } catch (err) {
      showToast('error', 'Reset Failed', err.message);
    }
  }

  /**
   * Open Modal in Create Mode
   */
  function openModalForCreate() {
    state.editingId = null;
    elements.formAppointmentId.value = '';
    elements.appointmentForm.reset();

    elements.modalTitle.textContent = 'Add New Appointment';
    elements.submitBtnText.textContent = 'Create Appointment';
    elements.formStatusGroup.classList.add('hidden');
    clearFormErrors();

    // Default date: currently filtered date or today
    let defaultDate = TODAY_STR;
    if (state.dateFilter === 'tomorrow') defaultDate = TOMORROW_STR;
    else if (state.dateFilter !== 'all') defaultDate = state.dateFilter;
    elements.formDate.value = defaultDate;

    // Default time: next rounded hour
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    const startHourStr = String(nextHour).padStart(2, '0');
    const endHourStr = String((nextHour + 1) % 24).padStart(2, '0');
    elements.formStartTime.value = `${startHourStr}:00`;
    elements.formEndTime.value = `${endHourStr}:00`;

    updateDurationPreview();

    elements.appointmentModal.classList.remove('hidden');
    elements.formTitle.focus();
  }

  /**
   * Open Modal in Edit Mode
   */
  async function openModalForEdit(id) {
    try {
      const appt = await api.getAppointment(id);
      state.editingId = id;
      elements.formAppointmentId.value = id;

      elements.modalTitle.textContent = 'Edit Appointment';
      elements.submitBtnText.textContent = 'Save Changes';
      elements.formStatusGroup.classList.remove('hidden');
      clearFormErrors();

      elements.formTitle.value = appt.title || '';
      elements.formDate.value = appt.date || '';
      elements.formStartTime.value = appt.start_time || '';
      elements.formEndTime.value = appt.end_time || '';
      elements.formAssignee.value = appt.assignee || 'General Team';
      elements.formClient.value = appt.client || '';
      elements.formDescription.value = appt.description || '';
      elements.formStatus.value = appt.status || 'scheduled';

      updateDurationPreview();

      elements.appointmentModal.classList.remove('hidden');
      elements.formTitle.focus();
    } catch (err) {
      showToast('error', 'Could not open appointment', err.message);
    }
  }

  /**
   * Close Modal
   */
  function closeModal() {
    elements.appointmentModal.classList.add('hidden');
    state.editingId = null;
    clearFormErrors();
  }

  /**
   * About Modal
   */
  function openAboutModal() {
    elements.aboutModal.classList.remove('hidden');
  }

  function closeAboutModal() {
    elements.aboutModal.classList.add('hidden');
  }

  /**
   * Form submission handler
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const title = elements.formTitle.value.trim();
    const date = elements.formDate.value;
    const start_time = elements.formStartTime.value;
    const end_time = elements.formEndTime.value;
    const assignee = elements.formAssignee.value;
    const client = elements.formClient.value.trim();
    const description = elements.formDescription.value.trim();
    const status = elements.formStatus.value;

    // Client-side quick validation
    const errors = [];
    if (!title) {
      errors.push('Appointment title is required.');
      elements.formTitle.classList.add('is-invalid');
    }
    if (!date) {
      errors.push('Appointment date is required.');
      elements.formDate.classList.add('is-invalid');
    }
    if (!start_time) {
      errors.push('Start time is required.');
      elements.formStartTime.classList.add('is-invalid');
    }
    if (!end_time) {
      errors.push('End time is required.');
      elements.formEndTime.classList.add('is-invalid');
    }

    if (start_time && end_time) {
      const [sh, sm] = start_time.split(':').map(Number);
      const [eh, em] = end_time.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      if (endMin <= startMin) {
        errors.push('End time must be later than start time.');
        elements.formEndTime.classList.add('is-invalid');
      }
    }

    if (errors.length > 0) {
      showFormError(errors[0]);
      return;
    }

    const payload = {
      title,
      date,
      start_time,
      end_time,
      assignee,
      client,
      description
    };

    if (state.editingId) {
      payload.status = status;
    }

    try {
      elements.submitBtnText.textContent = 'Saving...';

      let res;
      if (state.editingId) {
        res = await api.updateAppointment(state.editingId, payload);
        showToast('success', 'Appointment Updated', res.message);
      } else {
        res = await api.createAppointment(payload);
        showToast('success', 'Appointment Created', res.message);
      }

      closeModal();
      await loadAppointments();
    } catch (err) {
      // If server returned 409 conflict, display exact conflicting details in form error banner!
      showFormError(err.message);
      showToast('error', 'Scheduling Conflict', err.message);
    } finally {
      elements.submitBtnText.textContent = state.editingId ? 'Save Changes' : 'Create Appointment';
    }
  }

  function showFormError(msg) {
    elements.formErrorMessage.textContent = msg;
    elements.formErrorBanner.classList.remove('hidden');
  }

  function clearFormErrors() {
    elements.formErrorBanner.classList.add('hidden');
    elements.formErrorMessage.textContent = '';
    elements.appointmentForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  /**
   * Update duration preview bar in modal
   */
  function updateDurationPreview() {
    const start = elements.formStartTime.value;
    const end = elements.formEndTime.value;

    if (!start || !end) {
      elements.durationPreviewText.textContent = 'Select start and end times to calculate duration';
      return;
    }

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);

    if (diff <= 0) {
      elements.durationPreviewText.textContent = '⚠️ End time must be after start time';
    } else {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      let text = 'Calculated Duration: ';
      if (hours > 0) text += `${hours} hr${hours > 1 ? 's' : ''} `;
      if (mins > 0) text += `${mins} min`;
      elements.durationPreviewText.textContent = text.trim();
    }
  }

  /**
   * Toast Notification System
   */
  function showToast(type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-closing');
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 4500);

    elements.toastContainer.appendChild(toast);
  }

  /**
   * Formatting Utilities
   */
  function formatFriendlyDate(dateStr) {
    if (!dateStr) return '';
    if (dateStr === TODAY_STR) return 'Today';
    if (dateStr === TOMORROW_STR) return 'Tomorrow';

    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function calculateDurationMinutes(start, end) {
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

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
