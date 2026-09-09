const assert = require('assert');
const {
  isValidDate,
  isValidTime,
  timeToMinutes,
  isTimeOverlapping,
  validateAppointmentPayload,
  findSlotConflict
} = require('./src/validator');

console.log('--- Running Appointment Board Conflict & Validation Tests ---');

// 1. Time conversion tests
assert.strictEqual(timeToMinutes('00:00'), 0);
assert.strictEqual(timeToMinutes('09:30'), 570);
assert.strictEqual(timeToMinutes('14:15'), 855);
assert.strictEqual(timeToMinutes('23:59'), 1439);
console.log('✓ Time conversion to minutes works as expected');

// 2. Overlap algorithm unit tests
// Non-overlapping adjacent slots: A finishes at 10:00, B starts at 10:00 -> NO conflict
assert.strictEqual(isTimeOverlapping('09:00', '10:00', '10:00', '11:00'), false, 'Adjacent slots must not conflict');
assert.strictEqual(isTimeOverlapping('10:00', '11:00', '09:00', '10:00'), false, 'Adjacent slots in reverse order must not conflict');

// Partial overlap: A is 09:00-10:15, B is 10:00-11:00 -> CONFLICT
assert.strictEqual(isTimeOverlapping('09:00', '10:15', '10:00', '11:00'), true, 'Partial overlap must be flagged');

// Internal overlap: A is 09:00-12:00, B is 10:00-11:00 -> CONFLICT
assert.strictEqual(isTimeOverlapping('09:00', '12:00', '10:00', '11:00'), true, 'Enclosing slot must be flagged');

// Completely disjoint slots: A is 09:00-10:00, B is 14:00-15:00 -> NO conflict
assert.strictEqual(isTimeOverlapping('09:00', '10:00', '14:00', '15:00'), false, 'Disjoint slots must not conflict');

console.log('✓ Overlap detection interval algorithm works perfectly');

// 3. Payload validation tests
// Missing required fields
const emptyCheck = validateAppointmentPayload({});
assert.strictEqual(emptyCheck.isValid, false);
assert.ok(emptyCheck.errors.some(e => e.includes('Title is required')));

// Invalid end time <= start time
const timeOrderCheck = validateAppointmentPayload({
  title: 'Test Meeting',
  date: '2026-09-10',
  start_time: '14:00',
  end_time: '13:00'
});
assert.strictEqual(timeOrderCheck.isValid, false);
assert.ok(timeOrderCheck.errors.some(e => e.includes('End time must be later than start time')));

// Valid payload
const validCheck = validateAppointmentPayload({
  title: 'Client Demo',
  date: '2026-09-10',
  start_time: '14:00',
  end_time: '15:00'
});
assert.strictEqual(validCheck.isValid, true);
assert.strictEqual(validCheck.errors.length, 0);

console.log('✓ Payload validation & time ordering passed');

// 4. Existing appointments slot conflict detection
const existingMock = [
  {
    id: 'apt-1',
    title: 'Morning Sync',
    date: '2026-09-10',
    start_time: '09:00',
    end_time: '10:00',
    status: 'scheduled'
  },
  {
    id: 'apt-2',
    title: 'Vendor Pitch',
    date: '2026-09-10',
    start_time: '11:00',
    end_time: '12:00',
    status: 'cancelled' // Cancelled appointment does NOT block slot
  },
  {
    id: 'apt-3',
    title: 'Afternoon Review',
    date: '2026-09-11', // Different date
    start_time: '09:30',
    end_time: '10:30',
    status: 'scheduled'
  }
];

// Conflict case: overlaps 09:30 - 10:30 with apt-1 on 2026-09-10
const conflictCheck1 = findSlotConflict(existingMock, {
  date: '2026-09-10',
  start_time: '09:30',
  end_time: '10:30'
});
assert.strictEqual(conflictCheck1.hasConflict, true);
assert.strictEqual(conflictCheck1.conflictingAppointment.id, 'apt-1');

// Safe case: exactly matches cancelled apt-2 slot (11:00 - 12:00) on 2026-09-10
const conflictCheck2 = findSlotConflict(existingMock, {
  date: '2026-09-10',
  start_time: '11:00',
  end_time: '12:00'
});
assert.strictEqual(conflictCheck2.hasConflict, false, 'Cancelled appointment must not block slot');

// Safe case: overlaps apt-3 time, BUT on 2026-09-10 (different date)
const conflictCheck3 = findSlotConflict(existingMock, {
  date: '2026-09-10',
  start_time: '10:00',
  end_time: '11:00'
});
assert.strictEqual(conflictCheck3.hasConflict, false);

// Edit case: editing apt-1 itself to 09:15 - 09:45 (should not conflict with self)
const conflictCheck4 = findSlotConflict(existingMock, {
  id: 'apt-1',
  date: '2026-09-10',
  start_time: '09:15',
  end_time: '09:45'
});
assert.strictEqual(conflictCheck4.hasConflict, false, 'Self-conflict on edit must be ignored');

console.log('✓ Slot conflict detection with status & date awareness passed');

console.log('\nALL CONFLICT & VALIDATION TESTS PASSED SUCCESSFULLY! (10/10 assertions)');
