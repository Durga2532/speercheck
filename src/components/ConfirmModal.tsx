import React, { useState } from 'react';
import { Candidate, Duration, Engineer, TimeSlot } from '../types';
import { formatSlotEndTime, formatSlotTime } from '../utils/availability';

interface ConfirmModalProps {
    slot: TimeSlot;
    engineerOptions: Engineer[];
    candidate: Candidate;
    duration: Duration;
    onConfirm: (engineerId: string) => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    slot,
    engineerOptions,
    candidate,
    duration,
    onConfirm,
    onCancel,
}) => {
    const [selectedEngId, setSelectedEngId] = useState<string>(engineerOptions[0]?.id || '');

    const startTime = formatSlotTime(slot);
    const endTime = formatSlotEndTime(slot, duration);

    const dayFull: Record<string, string> = {
        Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday',
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-icon">📅</div>
                    <h2 className="modal-title">Confirm Interview</h2>
                    <p className="modal-subtitle">Review the details before confirming</p>
                </div>

                <div className="modal-body">
                    <div className="modal-detail-row">
                        <span className="modal-detail-label">Candidate</span>
                        <span className="modal-detail-value">{candidate.name}</span>
                    </div>
                    <div className="modal-detail-row">
                        <span className="modal-detail-label">Date & Time</span>
                        <span className="modal-detail-value highlight">
                            {dayFull[slot.day]}, {startTime} – {endTime}
                        </span>
                    </div>
                    <div className="modal-detail-row">
                        <span className="modal-detail-label">Duration</span>
                        <span className="modal-detail-value">{duration} minutes</span>
                    </div>

                    {engineerOptions.length > 1 ? (
                        <div className="modal-select-group">
                            <label className="modal-detail-label">Assign Engineer</label>
                            <div className="eng-radio-list">
                                {engineerOptions.map(eng => (
                                    <label key={eng.id} className={`eng-radio-item ${selectedEngId === eng.id ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="engineer"
                                            value={eng.id}
                                            checked={selectedEngId === eng.id}
                                            onChange={() => setSelectedEngId(eng.id)}
                                        />
                                        <span className="eng-radio-dot" style={{ backgroundColor: eng.color }} />
                                        <div>
                                            <div className="eng-radio-name">{eng.name}</div>
                                            <div className="eng-radio-role">{eng.role}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : engineerOptions.length === 1 ? (
                        <div className="modal-detail-row">
                            <span className="modal-detail-label">Engineer</span>
                            <span className="modal-detail-value">
                                <span className="eng-name-dot" style={{ backgroundColor: engineerOptions[0].color }} />
                                {engineerOptions[0].name}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={() => onConfirm(selectedEngId)}
                        disabled={!selectedEngId}
                    >
                        Confirm Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;