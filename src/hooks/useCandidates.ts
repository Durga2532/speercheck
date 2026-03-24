import { useEffect, useState } from 'react';
import { AvailabilityRange, Candidate, Day } from '../types';

// Static availability pools to assign to fetched candidates
const AVAILABILITY_POOLS: AvailabilityRange[][] = [
  [
    { day: 'Tue' as Day, startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
    { day: 'Thu' as Day, startHour: 10, startMinute: 0, endHour: 12, endMinute: 0 },
  ],
  [
    { day: 'Mon' as Day, startHour: 9, startMinute: 0, endHour: 12, endMinute: 0 },
    { day: 'Wed' as Day, startHour: 13, startMinute: 0, endHour: 16, endMinute: 0 },
  ],
  [
    { day: 'Tue' as Day, startHour: 9, startMinute: 0, endHour: 11, endMinute: 0 },
    { day: 'Fri' as Day, startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
  ],
  [
    { day: 'Wed' as Day, startHour: 10, startMinute: 0, endHour: 13, endMinute: 0 },
    { day: 'Thu' as Day, startHour: 15, startMinute: 0, endHour: 18, endMinute: 0 },
  ],
  [
    { day: 'Mon' as Day, startHour: 14, startMinute: 0, endHour: 17, endMinute: 0 },
    { day: 'Fri' as Day, startHour: 9, startMinute: 0, endHour: 11, endMinute: 30 },
  ],
];

interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCandidates() {
      try {
        setLoading(true);
        const response = await fetch(
          'https://dummyjson.com/users?limit=5&select=id,firstName,lastName,email',
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error('Failed to fetch candidates');
        const data = await response.json();
        const users: DummyUser[] = data.users;

        const mapped: Candidate[] = users.map((user, index) => ({
          id: `cand-${user.id}`,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: 'Software Engineer Candidate',
          availability: AVAILABILITY_POOLS[index % AVAILABILITY_POOLS.length],
        }));

        setCandidates(mapped);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
    return () => controller.abort();
  }, []);

  return { candidates, loading, error };
}