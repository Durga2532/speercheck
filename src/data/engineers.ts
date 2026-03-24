import { Engineer } from "../types";

export const ENGINEERS: Engineer[] = [
  {
    id: 'eng-1',
    name: 'Alexra Rivera',
    role: 'Senior Software Engineer',
    color: '#6366f1',
    availability: [
      { day: 'Mon', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0 },
      { day: 'Mon', startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
      { day: 'Tue', startHour: 10, startMinute: 0, endHour: 13, endMinute: 0 },
      { day: 'Wed', startHour: 9, startMinute: 0, endHour: 11, endMinute: 30 },
      { day: 'Wed', startHour: 15, startMinute: 0, endHour: 18, endMinute: 0 },
      { day: 'Thu', startHour: 13, startMinute: 0, endHour: 16, endMinute: 0 },
      { day: 'Fri', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0 },
    ],
  },
  {
    id: 'eng-2',
    name: 'Priya Matthew',
    role: 'Full Stack Engineer',
    color: '#ec4899',
    availability: [
      { day: 'Mon', startHour: 11, startMinute: 0, endHour: 14, endMinute: 0 },
      { day: 'Tue', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0 },
      { day: 'Tue', startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
      { day: 'Wed', startHour: 10, startMinute: 0, endHour: 13, endMinute: 0 },
      { day: 'Thu', startHour: 9, startMinute: 0, endHour: 11, endMinute: 0 },
      { day: 'Thu', startHour: 15, startMinute: 30, endHour: 18, endMinute: 0 },
      { day: 'Fri', startHour: 13, startMinute: 0, endHour: 16, endMinute: 0 },
    ],
  },
  {
    id: 'eng-3',
    name: 'Marcus Chen',
    role: 'Backend Engineer',
    color: '#10b981',
    availability: [
      { day: 'Mon', startHour: 9, startMinute: 30, endHour: 12, endMinute: 0 },
      { day: 'Tue', startHour: 13, startMinute: 0, endHour: 17, endMinute: 0 },
      { day: 'Wed', startHour: 11, startMinute: 0, endHour: 14, endMinute: 0 },
      { day: 'Wed', startHour: 16, startMinute: 0, endHour: 18, endMinute: 0 },
      { day: 'Thu', startHour: 10, startMinute: 0, endHour: 13, endMinute: 30 },
      { day: 'Fri', startHour: 9, startMinute: 0, endHour: 11, endMinute: 0 },
      { day: 'Fri', startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
    ],
  },
];