import { AvailabilityRange, Engineer, ScheduledInterview } from '../types';
import {
  applyLockedSlots,
  computeOverlapSlots,
  generateAllSlots,
  getCandidateAvailableSlots,
  getEngineerAvailableSlots,
  isSlotInRange,
  slotsEqual,
} from './availability';

// ─── isSlotInRange ─────────────────────────────────────────────

describe('isSlotInRange', () => {
  const range: AvailabilityRange = {
    day: 'Tue',
    startHour: 14,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
  };

  test('returns true when slot fits exactly at range start with 30-min duration', () => {
    expect(isSlotInRange({ day: 'Tue', hour: 14, minute: 0 }, range, 30)).toBe(true);
  });

  test('returns true for a slot in the middle of the range', () => {
    expect(isSlotInRange({ day: 'Tue', hour: 15, minute: 30 }, range, 30)).toBe(true);
  });

  test('returns false when slot end exceeds range end', () => {
    // 16:45 + 30min = 17:15 > 17:00
    expect(isSlotInRange({ day: 'Tue', hour: 16, minute: 45 as any }, range, 30)).toBe(false);
  });

  test('returns false for wrong day', () => {
    expect(isSlotInRange({ day: 'Mon', hour: 14, minute: 0 }, range, 30)).toBe(false);
  });

  test('returns false for slot before range start', () => {
    expect(isSlotInRange({ day: 'Tue', hour: 13, minute: 30 }, range, 30)).toBe(false);
  });

  test('returns true for 15-min duration slot near range end', () => {
    // 16:45 + 15min = 17:00 exactly = range end, should be valid
    expect(isSlotInRange({ day: 'Tue', hour: 16, minute: 30 }, range, 15)).toBe(true);
  });

  test('returns false for 60-min duration when slot end exceeds range', () => {
    // 16:30 + 60min = 17:30 > 17:00
    expect(isSlotInRange({ day: 'Tue', hour: 16, minute: 30 }, range, 60)).toBe(false);
  });
});

// ─── generateAllSlots ──────────────────────────────────────────

describe('generateAllSlots', () => {
  const slots = generateAllSlots();

  test('generates 18 slots per day (9–18 = 9 hours × 2)', () => {
    const mondaySlots = slots.filter(s => s.day === 'Mon');
    expect(mondaySlots).toHaveLength(18);
  });

  test('generates slots for all 5 weekdays', () => {
    const days = Array.from(new Set(slots.map(s => s.day)));
    expect(days.sort()).toEqual(['Fri', 'Mon', 'Thu', 'Tue', 'Wed']);
  });

  test('total slot count is 90 (5 days × 18 slots)', () => {
    expect(slots).toHaveLength(90);
  });

  test('first slot of the day starts at 9:00', () => {
    const firstMon = slots.find(s => s.day === 'Mon');
    expect(firstMon).toEqual({ day: 'Mon', hour: 9, minute: 0 });
  });

  test('last slot of the day starts at 17:30', () => {
    const friSlots = slots.filter(s => s.day === 'Fri');
    const last = friSlots[friSlots.length - 1];
    expect(last).toEqual({ day: 'Fri', hour: 17, minute: 30 });
  });
});

// ─── slotsEqual ────────────────────────────────────────────────

describe('slotsEqual', () => {
  test('returns true for identical slots', () => {
    expect(slotsEqual(
      { day: 'Mon', hour: 10, minute: 0 },
      { day: 'Mon', hour: 10, minute: 0 }
    )).toBe(true);
  });

  test('returns false when days differ', () => {
    expect(slotsEqual(
      { day: 'Mon', hour: 10, minute: 0 },
      { day: 'Tue', hour: 10, minute: 0 }
    )).toBe(false);
  });

  test('returns false when minutes differ', () => {
    expect(slotsEqual(
      { day: 'Mon', hour: 10, minute: 0 },
      { day: 'Mon', hour: 10, minute: 30 }
    )).toBe(false);
  });
});

// ─── getEngineerAvailableSlots ─────────────────────────────────

describe('getEngineerAvailableSlots', () => {
  const engineer: Engineer = {
    id: 'test-eng',
    name: 'Test Engineer',
    role: 'Engineer',
    color: '#fff',
    availability: [
      { day: 'Tue', startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
    ],
  };

  test('returns only slots within the engineer availability window', () => {
    const slots = getEngineerAvailableSlots(engineer, 30);
    expect(slots.every(s => s.day === 'Tue')).toBe(true);
    expect(slots.every(s => s.hour >= 14 && s.hour < 17)).toBe(true);
  });

  test('returns 6 slots for a 3-hour window with 30-min slots', () => {
    const slots = getEngineerAvailableSlots(engineer, 30);
    expect(slots).toHaveLength(6);
  });

  test('returns fewer slots for 60-min duration (last slot cannot start at 16:30)', () => {
    const slots30 = getEngineerAvailableSlots(engineer, 30);
    const slots60 = getEngineerAvailableSlots(engineer, 60);
    expect(slots60.length).toBeLessThan(slots30.length);
  });
});

// ─── computeOverlapSlots ───────────────────────────────────────

describe('computeOverlapSlots', () => {
  const candidateAvailability: AvailabilityRange[] = [
    { day: 'Tue', startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
  ];

  const engineers: Engineer[] = [
    {
      id: 'eng-a',
      name: 'Engineer A',
      role: 'Engineer',
      color: '#6366f1',
      availability: [
        { day: 'Tue', startHour: 13, startMinute: 0, endHour: 16, endMinute: 0 },
      ],
    },
    {
      id: 'eng-b',
      name: 'Engineer B',
      role: 'Engineer',
      color: '#ec4899',
      availability: [
        { day: 'Tue', startHour: 15, startMinute: 0, endHour: 18, endMinute: 0 },
      ],
    },
  ];

  test('correctly identifies overlap slots', () => {
    const statuses = computeOverlapSlots(candidateAvailability, engineers, 30);
    const overlaps = statuses.filter(s => s.isOverlap);

    // Candidate: Tue 14:00–17:00
    // Eng A:     Tue 13:00–16:00  → overlap with candidate: 14:00–16:00 (4 slots)
    // Eng B:     Tue 15:00–18:00  → overlap with candidate: 15:00–17:00 (4 slots)
    // Union overlap: Tue 14:00–17:00 minus last slot: 6 slots total (14:00–16:30)
    expect(overlaps.length).toBeGreaterThan(0);
    expect(overlaps.every(s => s.slot.day === 'Tue')).toBe(true);
  });

  test('slot at Tue 14:00 overlaps with eng-a only', () => {
    const statuses = computeOverlapSlots(candidateAvailability, engineers, 30);
    const slot14 = statuses.find(s => s.slot.day === 'Tue' && s.slot.hour === 14 && s.slot.minute === 0);
    expect(slot14?.isOverlap).toBe(true);
    expect(slot14?.engineerIds).toContain('eng-a');
    expect(slot14?.engineerIds).not.toContain('eng-b');
  });

  test('slot at Tue 15:00 overlaps with both engineers', () => {
    const statuses = computeOverlapSlots(candidateAvailability, engineers, 30);
    const slot15 = statuses.find(s => s.slot.day === 'Tue' && s.slot.hour === 15 && s.slot.minute === 0);
    expect(slot15?.engineerIds).toContain('eng-a');
    expect(slot15?.engineerIds).toContain('eng-b');
  });

  test('candidate-only slots are not marked as overlap', () => {
    // Slot at Mon would have candidate unavailable so no overlap
    const statuses = computeOverlapSlots(candidateAvailability, engineers, 30);
    const monSlots = statuses.filter(s => s.slot.day === 'Mon');
    expect(monSlots.every(s => !s.isOverlap)).toBe(true);
  });

  test('filterEngineerId returns only that engineers slots', () => {
    const statuses = computeOverlapSlots(candidateAvailability, engineers, 30, 'eng-b');
    const withEngA = statuses.filter(s => s.engineerIds.includes('eng-a'));
    expect(withEngA).toHaveLength(0);
  });
});

// ─── applyLockedSlots ──────────────────────────────────────────

describe('applyLockedSlots', () => {
  const baseStatuses = [
    { slot: { day: 'Tue' as const, hour: 14, minute: 0 as const }, engineerIds: ['eng-1'], candidateAvailable: true, isOverlap: true, isLocked: false },
    { slot: { day: 'Tue' as const, hour: 14, minute: 30 as const }, engineerIds: ['eng-1'], candidateAvailable: true, isOverlap: true, isLocked: false },
    { slot: { day: 'Wed' as const, hour: 10, minute: 0 as const }, engineerIds: ['eng-2'], candidateAvailable: true, isOverlap: true, isLocked: false },
  ];

  const scheduled: ScheduledInterview[] = [
    {
      candidateId: 'cand-1',
      engineerId: 'eng-1',
      slot: { day: 'Tue', hour: 14, minute: 0 },
      duration: 30,
      scheduledAt: new Date(),
    },
  ];

  test('marks the matching slot as locked', () => {
    const result = applyLockedSlots(baseStatuses, scheduled, 'cand-1');
    const locked = result.find(s => s.slot.day === 'Tue' && s.slot.hour === 14 && s.slot.minute === 0);
    expect(locked?.isLocked).toBe(true);
  });

  test('does not lock slots for different candidate', () => {
    const result = applyLockedSlots(baseStatuses, scheduled, 'cand-99');
    expect(result.every(s => !s.isLocked)).toBe(true);
  });

  test('does not lock adjacent slots', () => {
    const result = applyLockedSlots(baseStatuses, scheduled, 'cand-1');
    const notLocked = result.find(s => s.slot.hour === 14 && s.slot.minute === 30);
    expect(notLocked?.isLocked).toBe(false);
  });

  test('does not lock slots on different day', () => {
    const result = applyLockedSlots(baseStatuses, scheduled, 'cand-1');
    const wed = result.find(s => s.slot.day === 'Wed');
    expect(wed?.isLocked).toBe(false);
  });
});

// ─── getCandidateAvailableSlots ────────────────────────────────

describe('getCandidateAvailableSlots', () => {
  test('returns slots matching candidate availability', () => {
    const availability: AvailabilityRange[] = [
      { day: 'Mon', startHour: 10, startMinute: 0, endHour: 12, endMinute: 0 },
    ];
    const slots = getCandidateAvailableSlots(availability, 30);
    expect(slots).toHaveLength(4); // 10:00, 10:30, 11:00, 11:30
    expect(slots.every(s => s.day === 'Mon' && s.hour >= 10 && s.hour < 12)).toBe(true);
  });

  test('returns empty array when no availability', () => {
    const slots = getCandidateAvailableSlots([], 30);
    expect(slots).toHaveLength(0);
  });
});