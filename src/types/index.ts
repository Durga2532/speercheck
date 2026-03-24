export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export interface TimeSlot {
  day: Day;
  hour: number;   // 9–17 (9 AM to 5:30 PM start)
  minute: 0 | 30;
}

export interface AvailabilityRange {
  day: Day;
  startHour: number;
  startMinute: 0 | 30;
  endHour: number;
  endMinute: 0 | 30;
}

export interface Engineer {
  id: string;
  name: string;
  role: string;
  color: string;
  availability: AvailabilityRange[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  availability: AvailabilityRange[];
}

export interface ScheduledInterview {
  candidateId: string;
  engineerId: string;
  slot: TimeSlot;
  duration: 15 | 30 | 60;
  scheduledAt: Date;
}

export type Duration = 15 | 30 | 60;

export interface SlotStatus {
  slot: TimeSlot;
  engineerIds: string[];   // engineers available at this slot
  candidateAvailable: boolean;
  isOverlap: boolean;      // candidate + at least one engineer
  isLocked: boolean;       // already scheduled
}