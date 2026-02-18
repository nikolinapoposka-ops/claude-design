import React from 'react';

interface ProgressInfo {
  total: number;
  fraction: string;
  percentage: number;
  auditorInitials: string[];
  moreCount?: number;
}

interface AuditCardProps {
  title: string;
  store?: string;
  statusLabel?: string;
  auditor?: { name: string; initials: string };
  progress?: ProgressInfo;
  startDate: string;
  dueDate: string;
  category: string;
  bookmarked?: boolean;
}

const AuditCard: React.FC<AuditCardProps> = ({
  title,
  store,
  statusLabel,
  auditor,
  progress,
  startDate,
  dueDate,
  category,
  bookmarked,
}) => {
  return (
    <div className="audit-card">

      {/* Header: audit icon + bookmark */}
      <div className="card-header">
        <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="22" height="22">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
        {bookmarked && (
          <svg viewBox="0 0 24 24" fill="#e62600" stroke="#e62600" strokeWidth="1.5" width="16" height="16">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
          </svg>
        )}
      </div>

      {/* Title */}
      <p className="card-title">{title}</p>

      {/* Store */}
      {store && (
        <div className="card-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14" flexShrink={0}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          <span className="card-meta">{store}</span>
        </div>
      )}

      {/* Status badge */}
      {statusLabel && (
        <div>
          <span className="status-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="12" height="12">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            {statusLabel}
          </span>
        </div>
      )}

      {/* Auditor */}
      {auditor && (
        <div className="card-row">
          <span className="card-label">Auditor</span>
          <div className="avatar-sm">{auditor.initials}</div>
          <span className="card-meta">{auditor.name}</span>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="card-progress">
          <div className="card-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
            <span className="card-meta">{progress.total} · {progress.fraction} completed</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress.percentage}%` }}></div>
          </div>
          <div className="card-row">
            <span className="card-label">Auditors</span>
            <div className="avatar-group">
              {progress.auditorInitials.map((initials, i) => (
                <div key={i} className="avatar-sm">{initials}</div>
              ))}
              {progress.moreCount !== undefined && (
                <div className="avatar-sm avatar-more">+{progress.moreCount}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="card-dates">
        <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="card-meta">{startDate}</span>
        <span className="card-meta">→</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="card-meta">{dueDate}</span>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <button className="card-more-btn">···</button>
        <span className="category-tag">{category}</span>
      </div>

    </div>
  );
};

export default AuditCard;
