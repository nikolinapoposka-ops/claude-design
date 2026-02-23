import React, { useState } from 'react';
import { Badge, Avatar } from '@quinyx/ui';
import { useRole, STORE_NAME, AREA_MANAGER_NAME } from '../context/RoleContext';
import { useToast } from './Toast';

interface ProgressInfo {
  total: number;
  fraction: string;
  percentage: number;
  auditors?: { name: string; initials?: string }[];
  moreCount?: number;
}

interface AuditCardProps {
  title: string;
  store?: string;
  storeAssignee?: { name: string; initials?: string };
  statusLabel?: string;
  scheduledDate?: string;
  auditor?: { name: string; initials?: string };
  progress?: ProgressInfo;
  startDate?: string;
  dueDate?: string;
  category: string;
  bookmarked?: boolean;
  onClick?: () => void;
}

const AuditCard: React.FC<AuditCardProps> = ({
  title,
  store,
  statusLabel,
  scheduledDate,
  auditor,
  progress,
  startDate,
  dueDate,
  category,
  bookmarked,
  onClick,
}) => {
  const { role } = useRole();
  const createToast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyNote, setNotifyNote] = useState('');

  return (
    <>
    <div className={`audit-card${onClick ? ' audit-card--clickable' : ''}`} onClick={onClick}>

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

      {/* Store — store role always shows their own location */}
      {(store || role === 'store') && (
        <div className="card-row" style={{ flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          <span className="card-meta">{role === 'store' ? STORE_NAME : store}</span>
        </div>
      )}

      {/* Status badge */}
      {scheduledDate ? (
        <div className="scheduled-status-block">
          <span className="status-badge status-badge--scheduled">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="12" height="12">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Scheduled
          </span>
          <span className="scheduled-date-text">Scheduled for {scheduledDate}</span>
        </div>
      ) : statusLabel ? (
        <div>
          <span className="status-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="12" height="12">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            {statusLabel}
          </span>
        </div>
      ) : null}

      {/* Progress — store role sees a single status badge instead of multi-store rollup */}
      {progress && (
        role === 'store' ? (
          <div>
            <span className="status-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="12" height="12">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Not started
            </span>
          </div>
        ) : (
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
            {(() => {
              const allAuditors = progress.auditors ?? [];
              const displayedAuditors = role === 'areaManager'
                ? allAuditors.filter((a) => a.name === AREA_MANAGER_NAME)
                : allAuditors;
              if (displayedAuditors.length === 0) return null;
              const total = displayedAuditors.length;
              const shown = displayedAuditors.slice(0, 2);
              const extra = total - 2; // +N for >3 auditors only
              const tooltipText = displayedAuditors.map((a) => a.name).join(', ');
              return (
                <div className="card-row">
                  <span className="card-label">{total === 1 ? 'Auditor' : 'Auditors'}</span>
                  <div className="avatar-group">
                    {shown.map((a, i) => (
                      <div key={i} className="avatar-tooltip-wrap">
                        <Avatar name={a.name} size="xs" hasBorder />
                        <span className="avatar-tooltip">{tooltipText}</span>
                      </div>
                    ))}
                    {total === 1 && <span className="card-meta">{displayedAuditors[0].name}</span>}
                    {total > 3 && extra > 0 && (
                      <div className="avatar-sm avatar-more">+{extra}</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )
      )}

      {/* Auditor */}
      {auditor && (
        <div className="card-row">
          <span className="card-label">Auditor</span>
          <Avatar name={auditor.name} size="xs" />
          <span className="card-meta">{auditor.name}</span>
        </div>
      )}

      {/* Dates */}
      {(startDate || dueDate) && <div className="card-dates">
        {startDate && (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="card-meta">{startDate}</span>
            <span className="card-meta">→</span>
          </>
        )}
        {dueDate && (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="14" height="14">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="card-meta">{dueDate}</span>
          </>
        )}
      </div>}

      {/* Footer */}
      <div className="card-footer">
        {role !== 'store' && (
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div className="card-dropdown card-dropdown--right">
                  <button className="card-dropdown-item" onClick={() => setMenuOpen(false)}>
                    Create a copy
                  </button>
                  <button className="card-dropdown-item" onClick={() => setMenuOpen(false)}>
                    Move to done
                  </button>
                  <button className="card-dropdown-item" onClick={() => { setMenuOpen(false); setNotifyModalOpen(true); }}>
                    Notify
                  </button>
                  <button className="card-dropdown-item card-dropdown-item--danger" onClick={() => setMenuOpen(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            <button className="card-more-btn" onClick={() => setMenuOpen((o) => !o)}>···</button>
          </div>
        )}
        <Badge label={category} variant="brand" size="small" />
      </div>

    </div>

    {notifyModalOpen && (
      <div className="discard-modal-overlay" onClick={() => setNotifyModalOpen(false)}>
        <div
          className="discard-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notify-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="edit-modal-close" aria-label="Close" onClick={() => setNotifyModalOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <h2 id="notify-modal-title" className="discard-modal-title">Send notification</h2>
          <p className="discard-modal-body">Let recipients know that you have made changes</p>
          <textarea
            className="notify-modal-textarea"
            placeholder="Add note (optional)"
            value={notifyNote}
            onChange={(e) => setNotifyNote(e.target.value)}
            rows={4}
          />
          <div className="discard-modal-actions">
            <button className="discard-modal-continue" onClick={() => setNotifyModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn--filled btn--pill"
              onClick={() => {
                setNotifyModalOpen(false);
                setNotifyNote('');
                createToast({ message: 'Notification sent', type: 'positive', duration: 3000 });
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AuditCard;
