import React, { useMemo } from 'react';
import { Candidate, Duration, Engineer, ScheduledInterview, SlotStatus, TimeSlot } from '../types';
import { DAYS, END_HOUR, START_HOUR, applyLockedSlots, computeOverlapSlots, formatSlotTime, generateAllSlots } from '../utils/availability';

interface CalendarGridProps {
  candidate: Candidate | null;
  engineers: Engineer[];
  filterEngineerId: string | null;
  duration: Duration;
  scheduledInterviews: ScheduledInterview[];
  onSlotClick: (slot: TimeSlot, engineerIds: string[]) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  candidate,
  engineers,
  filterEngineerId,
  duration,
  scheduledInterviews,
  onSlotClick,
}) => {
  const slotStatuses = useMemo(() => {
    if (!candidate) return [];
    const statuses = computeOverlapSlots(
      candidate.availability,
      engineers,
      duration,
      filterEngineerId ?? undefined
    );
    return applyLockedSlots(statuses, scheduledInterviews, candidate.id);
  }, [candidate, engineers, duration, filterEngineerId, scheduledInterviews]);

  const slotMap = useMemo(() => {
    const map = new Map<string, SlotStatus>();
    slotStatuses.forEach(s => {
      map.set(`${s.slot.day}-${s.slot.hour}-${s.slot.minute}`, s);
    });
    return map;
  }, [slotStatuses]);

  const engineerSlotMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const filteredEngineers = filterEngineerId
      ? engineers.filter(e => e.id === filterEngineerId)
      : engineers;
    filteredEngineers.forEach(eng => {
      generateAllSlots().forEach(slot => {
        if (eng.availability.some(range => {
          if (slot.day !== range.day) return false;
          const slotM = slot.hour * 60 + slot.minute;
          const endM = slotM + duration;
          const rStartM = range.startHour * 60 + range.startMinute;
          const rEndM = range.endHour * 60 + range.endMinute;
          return slotM >= rStartM && endM <= rEndM;
        })) {
          const key = `${slot.day}-${slot.hour}-${slot.minute}`;
          const existing = map.get(key) || [];
          map.set(key, [...existing, eng.id]);
        }
      });
    });
    return map;
  }, [engineers, filterEngineerId, duration]);

  const filteredEngineers = filterEngineerId
    ? engineers.filter(e => e.id === filterEngineerId)
    : engineers;

  const rows: { hour: number; minute: 0 | 30 }[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    rows.push({ hour: h, minute: 0 });
    rows.push({ hour: h, minute: 30 });
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-grid" style={{ '--eng-count': filteredEngineers.length } as React.CSSProperties}>
        <div className="cal-header-empty" />
        {DAYS.map(day => (
          <div key={day} className="cal-day-header">
            <span className="cal-day-label">{day}</span>
          </div>
        ))}

        {rows.map(({ hour, minute }) => {
          const isHourStart = minute === 0;
          return (
            <React.Fragment key={`${hour}-${minute}`}>
              <div className={`cal-time-label ${isHourStart ? 'hour-start' : 'half-hour'}`}>
                {isHourStart ? formatSlotTime({ day: 'Mon', hour, minute: 0 }) : ''}
              </div>

              {DAYS.map(day => {
                const key = `${day}-${hour}-${minute}`;
                const status = slotMap.get(key);
                const engIds = engineerSlotMap.get(key) || [];

                const isOverlap = status?.isOverlap ?? false;
                const isLocked = status?.isLocked ?? false;
                const isCandOnly = (status?.candidateAvailable ?? false) && !isOverlap;
                const isEngOnly = engIds.length > 0 && !(status?.candidateAvailable);
                const hasCandidate = !!candidate;

                let cellClass = 'cal-cell';
                if (isLocked) cellClass += ' cell-locked';
                else if (isOverlap) cellClass += ' cell-overlap';
                else if (isCandOnly && hasCandidate) cellClass += ' cell-candidate';
                else if (isEngOnly) cellClass += ' cell-engineer';

                const clickable = isOverlap && !isLocked && hasCandidate;

                return (
                  <div
                    key={key}
                    className={`${cellClass} ${isHourStart ? 'hour-boundary' : ''} ${clickable ? 'clickable' : ''}`}
                    onClick={clickable ? () => onSlotClick({ day, hour, minute: minute as 0 | 30 }, engIds) : undefined}
                    title={clickable ? `Schedule at ${formatSlotTime({ day, hour, minute: minute as 0 | 30 })}` : undefined}
                  >
                    {isOverlap && !isLocked && (
                      <div className="cell-eng-dots">
                        {filteredEngineers.filter(e => engIds.includes(e.id)).map(eng => (
                          <span
                            key={eng.id}
                            className="eng-dot"
                            style={{ backgroundColor: eng.color }}
                            title={eng.name}
                          />
                        ))}
                      </div>
                    )}
                    {isLocked && <div className="cell-locked-icon">🔒</div>}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-swatch swatch-overlap" />
          <span>Overlap (Clickable)</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch swatch-candidate" />
          <span>Candidate Only</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch swatch-engineer" />
          <span>Engineer Only</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch swatch-locked" />
          <span>Scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;