import { AvailabilityRange, Day, Duration, Engineer, ScheduledInterview, SlotStatus, TimeSlot } from '../types';

export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const START_HOUR = 9;
export const END_HOUR = 18; // exclusive (last slot starts at 17:30)

/** Convert TimeSlot to total minutes from midnight */
export function slotToMinutes(slot: TimeSlot): number {
  return slot.hour * 60 + slot.minute;
}

/** Generate all 30-min slots in the working week */
export function generateAllSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (const day of DAYS) {
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push({ day, hour, minute: 0 });
      if (hour < END_HOUR - 1 || true) {
        slots.push({ day, hour, minute: 30 });
      }
    }
  }
  // Remove last slot (18:00) since work ends at 18:00
  return slots.filter(s => !(s.hour === END_HOUR && s.minute === 0));
}

/** Check if a TimeSlot falls within an AvailabilityRange */
export function isSlotInRange(slot: TimeSlot, range: AvailabilityRange, duration: Duration = 30): boolean {
  if (slot.day !== range.day) return false;

  const slotStartMin = slotToMinutes(slot);
  const slotEndMin = slotStartMin + duration;

  const rangeStartMin = range.startHour * 60 + range.startMinute;
  const rangeEndMin = range.endHour * 60 + range.endMinute;

  return slotStartMin >= rangeStartMin && slotEndMin <= rangeEndMin;
}

/** Get all slots where an engineer is available */
export function getEngineerAvailableSlots(engineer: Engineer, duration: Duration = 30): TimeSlot[] {
  const allSlots = generateAllSlots();
  return allSlots.filter(slot =>
    engineer.availability.some(range => isSlotInRange(slot, range, duration))
  );
}

/** Get all slots where a candidate is available */
export function getCandidateAvailableSlots(availability: AvailabilityRange[], duration: Duration = 30): TimeSlot[] {
  const allSlots = generateAllSlots();
  return allSlots.filter(slot =>
    availability.some(range => isSlotInRange(slot, range, duration))
  );
}

/** Check if two TimeSlots are equal */
export function slotsEqual(a: TimeSlot, b: TimeSlot): boolean {
  return a.day === b.day && a.hour === b.hour && a.minute === b.minute;
}

/** Find overlap slots: candidate available + at least one engineer available */
export function computeOverlapSlots(
  candidateAvailability: AvailabilityRange[],
  engineers: Engineer[],
  duration: Duration = 30,
  filterEngineerId?: string
): SlotStatus[] {
  const allSlots = generateAllSlots();
  const filteredEngineers = filterEngineerId
    ? engineers.filter(e => e.id === filterEngineerId)
    : engineers;

  return allSlots.map(slot => {
    const candidateAvailable = candidateAvailability.some(range =>
      isSlotInRange(slot, range, duration)
    );
    const availableEngineers = filteredEngineers.filter(eng =>
      eng.availability.some(range => isSlotInRange(slot, range, duration))
    );

    return {
      slot,
      engineerIds: availableEngineers.map(e => e.id),
      candidateAvailable,
      isOverlap: candidateAvailable && availableEngineers.length > 0,
      isLocked: false,
    };
  });
}

/** Apply locked slots from scheduled interviews */
export function applyLockedSlots(
  slotStatuses: SlotStatus[],
  scheduledInterviews: ScheduledInterview[],
  candidateId: string
): SlotStatus[] {
  return slotStatuses.map(status => ({
    ...status,
    isLocked: scheduledInterviews.some(
      interview =>
        interview.candidateId === candidateId &&
        slotsEqual(interview.slot, status.slot)
    ),
  }));
}

export function formatSlotTime(slot: TimeSlot): string {
  const hour12 = slot.hour > 12 ? slot.hour - 12 : slot.hour;
  const ampm = slot.hour >= 12 ? 'PM' : 'AM';
  const mins = slot.minute === 0 ? '00' : '30';
  return `${hour12}:${mins} ${ampm}`;
}

export function formatSlotEndTime(slot: TimeSlot, duration: Duration): string {
  const totalMins = slot.hour * 60 + slot.minute + duration;
  const endHour = Math.floor(totalMins / 60);
  const endMin = totalMins % 60;
  const hour12 = endHour > 12 ? endHour - 12 : endHour;
  const ampm = endHour >= 12 ? 'PM' : 'AM';
  const mins = endMin === 0 ? '00' : '30';
  return `${hour12}:${mins} ${ampm}`;
}