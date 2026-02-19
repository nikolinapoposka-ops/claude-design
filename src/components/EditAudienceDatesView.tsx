import React, { useRef, useState } from 'react';
import type { AuditInstance } from '../App';

const CATEGORY_COLORS: Record<string, { bg: string }> = {
  Branding:    { bg: '#b23d59' },
  Merchandise: { bg: '#1565c0' },
  Security:    { bg: '#004851' },
  Safety:      { bg: '#e65100' },
  Operations:  { bg: '#2e7d32' },
};
const getCategoryStyle = (cat: string) => ({
  backgroundColor: (CATEGORY_COLORS[cat] ?? { bg: '#004851' }).bg,
  color: 'white' as const,
});

export interface EditAudienceData {
  recurringDate: string;
  dueDate: string;
}

interface Props {
  instance: AuditInstance;
  onCancel: () => void;
  onSave: (data: EditAudienceData) => void;
}

const EditAudienceDatesView: React.FC<Props> = ({ instance, onCancel, onSave }) => {
  const recurringDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const [recurringDate, setRecurringDate] = useState(instance.recurringDate ?? '');
  const [dueDate, setDueDate] = useState(instance.dueDate ?? '');

  const isAuditorsMode = instance.audience === 'auditors';
  const totalAuditorStores = [...new Set(instance.auditorAssignments?.flatMap((a) => a.stores) ?? [])].length;
  const auditorCount = instance.auditorAssignments?.length ?? 0;

  const audienceLabel = isAuditorsMode ? 'Auditors' : 'Stores only';
  const audienceMeta = isAuditorsMode
    ? `${auditorCount} auditor${auditorCount !== 1 ? 's' : ''} across ${totalAuditorStores} store${totalAuditorStores !== 1 ? 's' : ''}`
    : `${instance.stores.length} store${instance.stores.length !== 1 ? 's' : ''}`;

  const handleSave = () => {
    onSave({ recurringDate, dueDate });
  };

  return (
    <>
      <div className="review-send-page">

        {/* Page header */}
        <div className="review-send-header">
          <div className="review-send-template-label">
            <span className="review-send-template-name">{instance.title}</span>
            <span className="category-tag" style={getCategoryStyle(instance.category)}>{instance.category}</span>
          </div>
          <h1 className="review-send-title">Review and send your audit</h1>
          <p className="review-send-subtitle">Choose who gets it, when it is due, and add any notes</p>
        </div>

        {/* Two-column layout */}
        <div className="review-send-columns">

          {/* Left: audience */}
          <div className="review-send-panel">
            <div className="review-send-panel-heading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              <span className="review-send-panel-title">Choose your audience</span>
            </div>

            <div className="audience-summary-card edit-audience-card">
              {/* Audience row */}
              <div className="audience-summary-main">
                <div className="audience-summary-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    {isAuditorsMode ? (
                      <>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 010 7.75"></path>
                      </>
                    )}
                  </svg>
                </div>
                <div className="audience-summary-info">
                  <span className="audience-summary-label">{audienceLabel}</span>
                  <span className="audience-summary-meta">{audienceMeta}</span>
                </div>
                <div className="audience-summary-actions">
                  <button className="audience-summary-action-btn" title="Edit audience" aria-label="Edit audience">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="audience-summary-action-btn audience-summary-action-btn--delete"
                    title="Remove audience"
                    aria-label="Remove audience"
                    disabled
                    style={{ opacity: 0.4, cursor: 'not-allowed' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14H6L5 6"></path>
                      <path d="M10 11v6"></path>
                      <path d="M14 11v6"></path>
                      <path d="M9 6V4h6v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Add approvers */}
              <div className="edit-audience-approvers">
                <span className="edit-audience-approvers-label">Add approvers</span>
                <div className="edit-audience-approvers-row">
                  <button className="edit-audience-add-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add approvers
                  </button>
                  <button className="edit-audience-add-me">Add me</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: schedule */}
          <div className="review-send-panel">
            <div className="review-send-panel-heading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="review-send-panel-title">Schedule</span>
            </div>

            <div className="schedule-fields">
              {/* Send out date — read-only */}
              <div className="schedule-field">
                <label className="schedule-field-label">Send out date</label>
                <div className="schedule-field-input-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span className="schedule-input-display schedule-input-display--placeholder">
                    {instance.sendOutDate || 'Now'}
                  </span>
                </div>
              </div>

              {/* Recurring */}
              <div className="schedule-field">
                <label className="schedule-field-label">Recurring</label>
                <div
                  className="schedule-field-input-row schedule-field-input-row--clickable"
                  onClick={() => recurringDateRef.current?.showPicker?.()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    ref={recurringDateRef}
                    className="schedule-input"
                    type="date"
                    value={recurringDate}
                    onChange={(e) => setRecurringDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Due date/time */}
              <div className="schedule-field">
                <label className="schedule-field-label">Due date/time</label>
                <div
                  className="schedule-field-input-row schedule-field-input-row--clickable"
                  onClick={() => dueDateRef.current?.showPicker?.()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    ref={dueDateRef}
                    className="schedule-input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="detail-bottom-bar edit-audience-bottom-bar">
        <button className="btn btn--outlined btn--pill" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn--filled btn--pill" onClick={handleSave}>
          Save changes
        </button>
      </div>
    </>
  );
};

export default EditAudienceDatesView;
