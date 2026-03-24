import React, { useEffect, useState } from 'react';
import { Candidate, Engineer, ScheduledInterview } from '../types';
import { formatSlotEndTime, formatSlotTime } from '../utils/availability';

interface SuccessToastProps {
    interview: ScheduledInterview;
    engineer: Engineer;
    candidate: Candidate;
    onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ interview, engineer, candidate, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const startTime = formatSlotTime(interview.slot);
    const endTime = formatSlotEndTime(interview.slot, interview.duration);
    const dayMap: Record<string, string> = {
        Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday',
    };

    return (
        <div className={`success-toast ${visible ? 'toast-visible' : ''}`}>
            <div className="toast-check">✓</div>
            <div className="toast-content">
                <div className="toast-title">Interview Scheduled!</div>
                <div className="toast-detail">
                    <strong>{candidate.name}</strong> with <strong>{engineer.name}</strong>
                </div>
                <div className="toast-time">
                    {dayMap[interview.slot.day]}, {startTime} – {endTime} ({interview.duration} min)
                </div>
            </div>
            <button className="toast-close" onClick={onClose}>✕</button>
        </div>
    );
};

export default SuccessToast;