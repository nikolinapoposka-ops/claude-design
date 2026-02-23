import React, { useState } from 'react';
import { Badge } from '@quinyx/ui';
import type { AuditInstance } from '../App';
import { useRole } from '../context/RoleContext';

const CATEGORY_COLORS: Record<string, string> = {
  Branding:    '#b23d59',
  Merchandise: '#1565c0',
  Security:    '#004851',
  Safety:      '#e65100',
  Operations:  '#2e7d32',
};

const MOCK_SECTIONS = [
  {
    id: 1,
    title: 'Fire Extinguishers',
    subtitle: 'Check all fire extinguishers are in place and serviced',
    questions: [
      { id: 1, text: 'Are extinguishers within their service date?', required: true },
      { id: 2, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 3, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 4, text: 'Is the pressure gauge in the green zone?', required: true },
    ],
  },
  {
    id: 2,
    title: 'Fire Extinguishers',
    subtitle: 'Check all fire extinguishers are in place and serviced',
    questions: [
      { id: 1, text: 'Are extinguishers within their service date?', required: true },
      { id: 2, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 3, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 4, text: 'Is the pressure gauge in the green zone?', required: true },
    ],
  },
  {
    id: 3,
    title: 'Fire Extinguishers',
    subtitle: 'Check all fire extinguishers are in place and serviced',
    questions: [
      { id: 1, text: 'Are extinguishers within their service date?', required: true },
      { id: 2, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 3, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 4, text: 'Is the pressure gauge in the green zone?', required: true },
    ],
  },
  {
    id: 4,
    title: 'Fire Extinguishers',
    subtitle: 'Check all fire extinguishers are in place and serviced',
    questions: [
      { id: 1, text: 'Are extinguishers within their service date?', required: true },
      { id: 2, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 3, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 4, text: 'Is the pressure gauge in the green zone?', required: true },
      { id: 5, text: 'Is there an inspection tag attached?', required: true },
      { id: 6, text: 'Are extinguisher instructions visible?', required: false },
    ],
  },
];

interface Props {
  instance: AuditInstance;
  onHideDetails: () => void;
  onEditAudienceDates: () => void;
}

const AuditConfigView: React.FC<Props> = ({ instance, onHideDetails, onEditAudienceDates }) => {
  const { role } = useRole();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(!!instance.message);
  const [message, setMessage] = useState(instance.message ?? '');

  const toggleSection = (id: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hasRealData = !!(instance.sectionData && instance.sectionData.length > 0);
  const displaySections = hasRealData
    ? instance.sectionData!.map((s, idx) => ({
        id: idx + 1,
        title: s.title,
        subtitle: '',
        questions: s.questions.map((q, qIdx) => ({ id: qIdx + 1, text: q, required: false })),
      }))
    : MOCK_SECTIONS;

  const totalQuestions = displaySections.reduce((sum, s) => sum + s.questions.length, 0);

  const isAuditorsMode = instance.audience === 'auditors';
  const totalAuditorStores = [...new Set(instance.auditorAssignments?.flatMap((a) => a.stores) ?? [])].length;
  const auditorCount = instance.auditorAssignments?.length ?? 0;

  const statusLabel =
    instance.status === 'sent' ? 'In progress' :
    instance.status === 'scheduled' ? 'Scheduled' : 'Draft';

  const statusMod =
    instance.status === 'sent' ? 'in-progress' :
    instance.status === 'scheduled' ? 'scheduled' : 'draft';

  return (
    <>
      <div className="audit-config-page">
        <div className="audit-config-columns">

          {/* ── Left: summary card + section accordion ── */}
          <div className="audit-config-left">

            {/* Summary card */}
            <div className="detail-summary-card">
              <div className="detail-badges">
                <Badge label={instance.category} customColor={CATEGORY_COLORS[instance.category] ?? '#004851'} size="small" />
                {instance.isPriority && (
                  <span className="detail-badge detail-badge--priority">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                      <polyline points="4 4 4 20"></polyline>
                      <polygon points="4 4 20 9 4 14"></polygon>
                    </svg>
                    Priority
                  </span>
                )}
              </div>

              <h1 className="detail-title">{instance.title}</h1>

              {instance.description ? (
                <p className="detail-description">{instance.description}</p>
              ) : (
                <p className="detail-description">
                  Comprehensive fire safety compliance check including extinguishers, exits, and alarm systems.
                  This audit ensures all stores meet regulatory requirements and maintain a safe environment
                  for staff and customers.
                </p>
              )}

              <div className="detail-meta-row">
                <span className="detail-meta">Created by HQ Safety Team</span>
                <span className="detail-meta">Updated January 15, 2026</span>
                <button
                  className="detail-more-info-btn"
                  onClick={() => setMoreInfoOpen((o) => !o)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="16"
                    height="16"
                    style={{ transform: moreInfoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  {moreInfoOpen ? 'Less info' : 'More info'}
                </button>
              </div>

              {moreInfoOpen && (
                <div className="detail-more-info-content">
                  <div className="detail-info-group">
                    <span className="detail-info-label">Size</span>
                    <span className="detail-info-value-bold">Small</span>
                  </div>
                  <div className="detail-info-group">
                    <span className="detail-info-label">Attachments</span>
                    <span className="detail-attachment-count">1 file</span>
                    <div className="detail-attachment-card">
                      <div className="detail-attachment-img">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="1.5" width="32" height="32">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div className="detail-attachment-body">
                        <span className="detail-attachment-name">QR codes</span>
                        <div className="detail-attachment-tags">
                          <span className="detail-tag-sm detail-tag-sm--light">Product</span>
                          <span className="detail-tag-sm detail-tag-sm--dark">Tag</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="detail-info-group">
                    <span className="detail-info-label">Tags</span>
                    <div className="detail-tags-row">
                      <span className="detail-tag-pill">Badge</span>
                      <span className="detail-tag-pill">Badge</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Counts row */}
            <div className="detail-counts-row">
              <span className="detail-count"><strong>{displaySections.length}</strong> Sections</span>
              <span className="detail-count">
                <strong>{totalQuestions}</strong> Questions{' '}
                <span className="detail-count-sub">(plus up to 6 additional based on answers)</span>
              </span>
            </div>

            {/* Section accordion */}
            <div className="detail-sections">
              {displaySections.map((section) => {
                const isOpen = openSections.has(section.id);
                return (
                  <div key={section.id} className="detail-section">
                    <button
                      className="detail-section-header"
                      onClick={() => toggleSection(section.id)}
                    >
                      <span className="detail-section-number">{section.id}</span>
                      <div className="detail-section-info">
                        <span className="detail-section-title">{section.title}</span>
                        {section.subtitle && (
                          <span className="detail-section-subtitle">{section.subtitle}</span>
                        )}
                      </div>
                      <span className="detail-section-qcount">{section.questions.length} Questions</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        width="16"
                        height="16"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="detail-section-questions">
                        {section.questions.map((q, idx) => (
                          <div key={q.id} className="detail-question">
                            <span className="detail-question-num">{idx + 1}.</span>
                            <span className="detail-question-text">
                              {q.text}{q.required && ' *'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: sidebar wrapper ── */}
          <div className="audit-config-right">
            {/* Add message — above the card, sender only */}
            {role === 'hq' && (!messageOpen ? (
              <button className="add-message-toggle" onClick={() => setMessageOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
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
            ))}

            <div className="audit-config-sidebar">

              {/* Audience & Dates section */}
              <div className="audit-config-ad-section">
                <div className="audit-config-ad-heading-row">
                  <h3 className="audit-config-ad-heading">Audience &amp; Dates</h3>
                  {role === 'hq' && (
                    <button className="audit-config-edit-btn" onClick={onEditAudienceDates}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {/* Audience card */}
                <div className="audit-config-audience-card">
                  <div className="audit-config-audience-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
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
                  <div className="audit-config-audience-info">
                    <span className="audit-config-audience-label">
                      {isAuditorsMode ? 'Assigned auditors' : 'Assigned stores'}
                    </span>
                    <span className="audit-config-audience-meta">
                      {isAuditorsMode
                        ? `${auditorCount} auditor${auditorCount !== 1 ? 's' : ''} across ${totalAuditorStores} store${totalAuditorStores !== 1 ? 's' : ''}`
                        : `${instance.stores.length} store${instance.stores.length !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="audit-config-field">
                  <span className="audit-config-field-label">Status</span>
                  <span className={`audit-config-status-badge audit-config-status-badge--${statusMod}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <circle cx="12" cy="12" r="10" opacity="0.2"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                    {statusLabel}
                  </span>
                </div>

                {/* Send out date/time */}
                <div className="audit-config-field">
                  <span className="audit-config-field-label">Send out date/time</span>
                  <span className="audit-config-field-value">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {instance.sendOutDate || '—'}
                  </span>
                </div>

                {/* Recurring */}
                <div className={`audit-config-field${!instance.recurringDate ? ' audit-config-field--disabled' : ''}`}>
                  <span className="audit-config-field-label">Recurring</span>
                  <span className={`audit-config-field-value${!instance.recurringDate ? ' audit-config-field-value--muted' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <polyline points="17 1 21 5 17 9"></polyline>
                      <path d="M3 11V9a4 4 0 014-4h14"></path>
                      <polyline points="7 23 3 19 7 15"></polyline>
                      <path d="M21 13v2a4 4 0 01-4 4H3"></path>
                    </svg>
                    {instance.recurringDate || 'not set'}
                  </span>
                </div>

                {/* Due date/time */}
                <div className="audit-config-field">
                  <span className="audit-config-field-label">Due date/time</span>
                  <span className="audit-config-field-value">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {instance.dueDate || '—'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="audit-config-bottom-bar">
        <button className="btn btn--outlined btn--pill btn--sm" onClick={onHideDetails}>
          Hide details
        </button>
      </div>
    </>
  );
};

export default AuditConfigView;
