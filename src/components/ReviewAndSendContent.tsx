import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@quinyx/ui';
import type { Template } from './TemplateCard';
import type { AuditorAssignment } from '../App';

const CATEGORY_COLORS: Record<string, string> = {
  Branding:    '#b23d59',
  Merchandise: '#1565c0',
  Security:    '#004851',
  Safety:      '#e65100',
  Operations:  '#2e7d32',
};

export interface SendAuditData {
  sendOutDate: string;
  recurringDate: string;
  startDate: string;
  dueDate: string;
  message: string;
}

interface ReviewAndSendContentProps {
  template: Template;
  auditorAssignments: AuditorAssignment[];
  selfAuditStores: string[];
  onAssignAuditors: () => void;
  onAssignStores: () => void;
  onClearAuditors: () => void;
  onClearStores: () => void;
  onSend: (data: SendAuditData) => void;
  onFormChange?: (data: SendAuditData) => void;
}

const formatSendOutDate = (value: string) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const ReviewAndSendContent: React.FC<ReviewAndSendContentProps> = ({
  template,
  auditorAssignments,
  selfAuditStores,
  onAssignAuditors,
  onAssignStores,
  onClearAuditors,
  onClearStores,
  onSend,
  onFormChange,
}) => {
  const sendOutDateRef = useRef<HTMLInputElement>(null);
  const recurringDateRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const [sendOutDate, setSendOutDate] = useState('');
  const [recurringDate, setRecurringDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [approver, setApprover] = useState('');
  const [approverDropdownOpen, setApproverDropdownOpen] = useState(false);

  useEffect(() => {
    onFormChange?.({ sendOutDate, recurringDate, startDate, dueDate, message });
  }, [sendOutDate, recurringDate, startDate, dueDate, message]);

  const MOCK_APPROVERS = [
    { id: 'ed', name: 'Emily Davis',   initials: 'ED', role: 'Area Manager' },
    { id: 'js', name: 'John Smith',    initials: 'JS', role: 'Regional Manager' },
    { id: 'sj', name: 'Sarah Johnson', initials: 'SJ', role: 'Operations Lead' },
    { id: 'mw', name: 'Mike Williams', initials: 'MW', role: 'Senior Auditor' },
  ];

  const selectedApprover = MOCK_APPROVERS.find((a) => a.id === approver) ?? null;

  const hasAuditors = auditorAssignments.length > 0;
  const hasStores = selfAuditStores.length > 0;

  const totalAuditorStores = [...new Set(auditorAssignments.flatMap((a) => a.stores))].length;

  const handleSend = () => {
    onSend({ sendOutDate, recurringDate, startDate, dueDate, message });
  };

  return (
    <>
      <div className="review-send-page">
        {/* Page header */}
        <div className="review-send-header">
          <div className="review-send-template-label">
            <span className="review-send-template-name">{template.title}</span>
            <Badge label={template.category} customColor={CATEGORY_COLORS[template.category] ?? '#004851'} size="small" />
          </div>
          <h1 className="review-send-title">Review and send your audit</h1>
          <p className="review-send-subtitle">Choose who gets it, when it is due, and add any notes</p>
        </div>

        {/* Two-column layout */}
        <div className="review-send-columns">
          {/* Left: Choose your audience */}
          <div className="review-send-panel">
            <div className="review-send-panel-heading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              <span className="review-send-panel-title">Choose your audience</span>
            </div>

            {/* No audience selected — show option cards */}
            {!hasAuditors && !hasStores && (
              <div className="audience-cards">
                <button className="audience-card" onClick={onAssignStores}>
                  <div className="audience-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                  </div>
                  <span className="audience-card-label">"Stores" only</span>
                  <span className="audience-card-desc">Send to stores to complete an audit themselves</span>
                </button>

                <button className="audience-card" onClick={onAssignAuditors}>
                  <div className="audience-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span className="audience-card-label">Auditor(s)</span>
                  <span className="audience-card-desc">Assign auditors to complete the audit for selected stores.</span>
                </button>
              </div>
            )}

            {/* Auditors assigned — summary card */}
            {hasAuditors && (
              <div className="audience-summary-card">
                <div className="audience-summary-main">
                  <div className="audience-summary-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="audience-summary-info">
                    <span className="audience-summary-label">Assigned auditors</span>
                    <span className="audience-summary-meta">
                      {auditorAssignments.length} auditor{auditorAssignments.length !== 1 ? 's' : ''} across {totalAuditorStores} store{totalAuditorStores !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="audience-summary-actions">
                    <button className="audience-summary-action-btn" title="Edit" onClick={onAssignAuditors} aria-label="Edit auditor assignments">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button className="audience-summary-action-btn audience-summary-action-btn--delete" title="Remove" onClick={onClearAuditors} aria-label="Remove auditor assignments">
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
                <div className="audience-summary-switch">
                  <button
                    className="audience-summary-switch-toggle"
                    onClick={() => setSwitchOpen((v) => !v)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                      style={{ transform: switchOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Switch to self audit
                  </button>
                  {switchOpen && (
                    <div className="audience-summary-switch-body">
                      <p>Switching to stores will remove your current auditor selection.</p>
                      <button className="btn btn--outline btn--sm" onClick={() => { onClearAuditors(); onAssignStores(); setSwitchOpen(false); }}>
                        Switch to stores
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stores assigned — summary card */}
            {hasStores && (
              <div className="audience-summary-card">
                <div className="audience-summary-main">
                  <div className="audience-summary-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 010 7.75"></path>
                    </svg>
                  </div>
                  <div className="audience-summary-info">
                    <span className="audience-summary-label">Assigned stores</span>
                    <span className="audience-summary-meta">
                      {selfAuditStores.length} store{selfAuditStores.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="audience-summary-actions">
                    <button className="audience-summary-action-btn" title="Edit" onClick={onAssignStores} aria-label="Edit store assignments">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button className="audience-summary-action-btn audience-summary-action-btn--delete" title="Remove" onClick={onClearStores} aria-label="Remove store assignments">
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
                {/* Approver field */}
                <div className="audience-approver-field">
                  <div className="audience-approver-select-wrap">
                    <button
                      className="audience-approver-btn"
                      onClick={() => setApproverDropdownOpen((v) => !v)}
                    >
                      {selectedApprover ? (
                        <>
                          <div className="avatar-sm">{selectedApprover.initials}</div>
                          <span className="audience-approver-name">{selectedApprover.name}</span>
                        </>
                      ) : (
                        <span className="audience-approver-placeholder">Select approver</span>
                      )}
                      <svg viewBox="0 0 10 6" fill="currentColor" width="11" height="11"
                        style={{ marginLeft: 'auto', flexShrink: 0, transform: approverDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#8fa5b2' }}>
                        <path d="M0 0l5 6 5-6z" />
                      </svg>
                    </button>
                    {approverDropdownOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setApproverDropdownOpen(false)} />
                        <div className="audience-approver-menu">
                          <button
                            className={`audience-approver-option${!approver ? ' audience-approver-option--selected' : ''}`}
                            onClick={() => { setApprover(''); setApproverDropdownOpen(false); }}
                          >
                            <span className="audience-approver-none">No approver</span>
                          </button>
                          {MOCK_APPROVERS.map((a) => (
                            <button
                              key={a.id}
                              className={`audience-approver-option${approver === a.id ? ' audience-approver-option--selected' : ''}`}
                              onClick={() => { setApprover(a.id); setApproverDropdownOpen(false); }}
                            >
                              <div className="avatar-sm">{a.initials}</div>
                              <div className="audience-approver-option-info">
                                <span className="audience-approver-option-name">{a.name}</span>
                                <span className="audience-approver-option-role">{a.role}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="audience-summary-switch">
                  <button
                    className="audience-summary-switch-toggle"
                    onClick={() => setSwitchOpen((v) => !v)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                      style={{ transform: switchOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Switch to assigned auditors
                  </button>
                  {switchOpen && (
                    <div className="audience-summary-switch-body">
                      <p>Switching to auditors will remove your current store selection.</p>
                      <button className="btn btn--outline btn--sm" onClick={() => { onClearStores(); onAssignAuditors(); setSwitchOpen(false); }}>
                        Switch to auditors
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Schedule */}
          <div className="review-send-panel">
            <div className="review-send-panel-heading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="review-send-panel-title">Schedule</span>
            </div>

            <div className="schedule-fields">
              <div className="schedule-field">
                <label className="schedule-field-label">Send out date</label>
                <div
                  className="schedule-field-input-row schedule-field-input-row--clickable"
                  onClick={() => sendOutDateRef.current?.showPicker?.()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span className={`schedule-input-display${!sendOutDate ? ' schedule-input-display--placeholder' : ''}`}>
                    {sendOutDate ? formatSendOutDate(sendOutDate) : 'Now'}
                  </span>
                  {sendOutDate && (
                    <button
                      className="schedule-clear-btn"
                      onClick={(e) => { e.stopPropagation(); setSendOutDate(''); }}
                      aria-label="Clear date"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  <input
                    ref={sendOutDateRef}
                    type="datetime-local"
                    value={sendOutDate}
                    onChange={(e) => setSendOutDate(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
                  />
                </div>
              </div>

              <div className="schedule-field">
                <label className="schedule-field-label">Recurring</label>
                <div className="schedule-field-input-row schedule-field-input-row--clickable" onClick={() => recurringDateRef.current?.showPicker?.()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
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

              <div className="schedule-field">
                <label className="schedule-field-label">Start date</label>
                <div className="schedule-field-input-row schedule-field-input-row--clickable" onClick={() => startDateRef.current?.showPicker?.()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    ref={startDateRef}
                    className="schedule-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="schedule-field">
                <label className="schedule-field-label">Due date/time</label>
                <div className="schedule-field-input-row schedule-field-input-row--clickable" onClick={() => dueDateRef.current?.showPicker?.()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
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

        {/* Add message */}
        <div className="add-message-section">
          {!messageOpen ? (
            <button className="add-message-toggle" onClick={() => setMessageOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add message (optional)
            </button>
          ) : (
            <div className="add-message-field">
              <label className="schedule-field-label">Message</label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="Add a message for the recipients…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="detail-bottom-bar">
        <button className="btn btn--filled btn--pill" onClick={handleSend}>
          Send audit
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <div style={{ position: 'absolute', right: 24 }}>
          {moreMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                onClick={() => setMoreMenuOpen(false)}
              />
              <div className="card-dropdown card-dropdown--right">
                <button className="card-dropdown-item" onClick={() => setMoreMenuOpen(false)}>
                  Save as draft
                </button>
              </div>
            </>
          )}
          <button
            className="card-more-btn"
            aria-label="More options"
            title="More options"
            onClick={() => setMoreMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ReviewAndSendContent;
