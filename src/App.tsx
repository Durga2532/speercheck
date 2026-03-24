import { useMemo, useState } from 'react';
import './App.css';
import CalendarGrid from './components/CalendarGrid';
import ConfirmModal from './components/ConfirmModal';
import EngineerPanel from './components/EngineerPanel';
import SuccessToast from './components/SuccessToast';
import { ENGINEERS } from './data/engineers';
import { useCandidates } from './hooks/useCandidates';
import { Duration, ScheduledInterview, TimeSlot } from './types';

interface PendingSlot {
  slot: TimeSlot;
  engineerIds: string[];
}

function App() {
  const { candidates, loading, error } = useCandidates();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [filterEngineerId, setFilterEngineerId] = useState<string | null>(null);
  const [duration, setDuration] = useState<Duration>(30);
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null);
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>([]);
  const [latestInterview, setLatestInterview] = useState<ScheduledInterview | null>(null);

  const selectedCandidate = useMemo(
    () => candidates.find(c => c.id === selectedCandidateId) ?? null,
    [candidates, selectedCandidateId]
  );

  const handleSlotClick = (slot: TimeSlot, engineerIds: string[]) => {
    setPendingSlot({ slot, engineerIds });
  };

  const handleConfirm = (engineerId: string) => {
    if (!pendingSlot || !selectedCandidate) return;
    const interview: ScheduledInterview = {
      candidateId: selectedCandidate.id,
      engineerId,
      slot: pendingSlot.slot,
      duration,
      scheduledAt: new Date(),
    };
    setScheduledInterviews(prev => [...prev, interview]);
    setLatestInterview(interview);
    setPendingSlot(null);
  };

  const pendingEngineers = ENGINEERS.filter(e =>
    pendingSlot?.engineerIds.includes(e.id)
  );

  const latestEngineer = ENGINEERS.find(e => e.id === latestInterview?.engineerId);

  const scheduledCount = scheduledInterviews.filter(
    i => i.candidateId === selectedCandidateId
  ).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-mark">S</span>
            <span className="logo-text">SpeerCheck</span>
          </div>
          <div className="header-tagline">Interview Scheduler</div>
        </div>
        <div className="header-right">
          {scheduledInterviews.length > 0 && (
            <div className="scheduled-badge">
              {scheduledInterviews.length} interview{scheduledInterviews.length !== 1 ? 's' : ''} scheduled
            </div>
          )}
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="panel-section-label">Candidate</div>
            {loading ? (
              <div className="loading-candidates">
                <div className="spinner" />
                <span>Loading candidates…</span>
              </div>
            ) : error ? (
              <div className="error-msg">Failed to load candidates</div>
            ) : (
              <div className="select-wrapper">
                <select
                  className="candidate-select"
                  value={selectedCandidateId}
                  onChange={e => setSelectedCandidateId(e.target.value)}
                >
                  <option value="">Select a candidate…</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▾</span>
              </div>
            )}

            {selectedCandidate && (
              <div className="candidate-info">
                <div className="candidate-avatar">
                  {selectedCandidate.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="candidate-name">{selectedCandidate.name}</div>
                  <div className="candidate-email">{selectedCandidate.email}</div>
                  {scheduledCount > 0 && (
                    <div className="candidate-scheduled">
                      {scheduledCount} slot{scheduledCount !== 1 ? 's' : ''} booked
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="panel-section-label">Duration</div>
            <div className="duration-group">
              {([15, 30, 60] as Duration[]).map(d => (
                <button
                  key={d}
                  className={`duration-btn ${duration === d ? 'active' : ''}`}
                  onClick={() => setDuration(d)}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <EngineerPanel
            engineers={ENGINEERS}
            filterEngineerId={filterEngineerId}
            onFilterChange={setFilterEngineerId}
          />
        </aside>

        <main className="main-content">
          {!selectedCandidate ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2 className="empty-title">Select a Candidate</h2>
              <p className="empty-desc">
                Choose a candidate from the sidebar to view their availability
                overlapping with the engineering team.
              </p>
            </div>
          ) : (
            <>
              <div className="content-header">
                <div>
                  <h1 className="content-title">Weekly Availability</h1>
                  <p className="content-subtitle">
                    Showing overlaps for <strong>{selectedCandidate.name}</strong>
                    {filterEngineerId
                      ? ` with ${ENGINEERS.find(e => e.id === filterEngineerId)?.name}`
                      : ' with all engineers'}
                    {' '}· {duration}-minute slots
                  </p>
                </div>
              </div>

              <CalendarGrid
                candidate={selectedCandidate}
                engineers={ENGINEERS}
                filterEngineerId={filterEngineerId}
                duration={duration}
                scheduledInterviews={scheduledInterviews}
                onSlotClick={handleSlotClick}
              />
            </>
          )}
        </main>
      </div>

      {pendingSlot && selectedCandidate && (
        <ConfirmModal
          slot={pendingSlot.slot}
          engineerOptions={pendingEngineers}
          candidate={selectedCandidate}
          duration={duration}
          onConfirm={handleConfirm}
          onCancel={() => setPendingSlot(null)}
        />
      )}

      {latestInterview && latestEngineer && selectedCandidate && (
        <SuccessToast
          key={latestInterview.scheduledAt.getTime()}
          interview={latestInterview}
          engineer={latestEngineer}
          candidate={selectedCandidate}
          onClose={() => setLatestInterview(null)}
        />
      )}
    </div>
  );
}

export default App;
