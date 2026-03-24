import React from 'react';
import { Engineer } from '../types';

interface EngineerPanelProps {
  engineers: Engineer[];
  filterEngineerId: string | null;
  onFilterChange: (id: string | null) => void;
}

const EngineerPanel: React.FC<EngineerPanelProps> = ({
  engineers,
  filterEngineerId,
  onFilterChange,
}) => {
  return (
    <div className="engineer-panel">
      <div className="panel-section-label">Engineers</div>
      <div className="eng-list">
        <button
          className={`eng-filter-btn ${filterEngineerId === null ? 'active' : ''}`}
          onClick={() => onFilterChange(null)}
        >
          <span className="eng-filter-dot all-dot" />
          <div>
            <div className="eng-filter-name">All Engineers</div>
            <div className="eng-filter-sub">Show all availability</div>
          </div>
        </button>
        {engineers.map(eng => (
          <button
            key={eng.id}
            className={`eng-filter-btn ${filterEngineerId === eng.id ? 'active' : ''}`}
            onClick={() => onFilterChange(eng.id === filterEngineerId ? null : eng.id)}
          >
            <span className="eng-filter-dot" style={{ backgroundColor: eng.color }} />
            <div>
              <div className="eng-filter-name">{eng.name}</div>
              <div className="eng-filter-sub">{eng.role}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EngineerPanel;