import React, { useState } from 'react';
import type { Template } from './TemplateCard';

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

export interface SendAuditData {
  audience: 'stores' | 'auditors' | null;
  sendOutDate: string;
  recurringDate: string;
  dueDate: string;
  message: string;
}

interface ReviewAndSendContentProps {
  template: Template;
  onSend: (data: SendAuditData) => void;
}

const ReviewAndSendContent: React.FC<ReviewAndSendContentProps> = ({ template, onSend }) => {
  const [audience, setAudience] = useState<'stores' | 'auditors' | null>(null);
  const [sendOutDate, setSendOutDate] = useState('');
  const [recurringDate, setRecurringDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleSend = () => {
    onSend({ audience, sendOutDate, recurringDate, dueDate, message });
  };

  return (
    <>
      <div className="review-send-page">
        {/* Page header */}
        <div className="review-send-header">
          <div className="review-send-template-label">
            <span className="review-send-template-name">{template.title}</span>
            <span className="category-tag" style={getCategoryStyle(template.category)}>{template.category}</span>
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
            <div className="audience-cards">
              <button
                className={`audience-card${audience === 'stores' ? ' audience-card--selected' : ''}`}
                onClick={() => setAudience('stores')}
              >
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

              <button
                className={`audience-card${audience === 'auditors' ? ' audience-card--selected' : ''}`}
                onClick={() => setAudience('auditors')}
              >
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
                <div className="schedule-field-input-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    className="schedule-input"
                    type="date"
                    value={sendOutDate}
                    onChange={(e) => setSendOutDate(e.target.value)}
                    placeholder="Now"
                  />
                  {!sendOutDate && <span className="schedule-input-placeholder">Now</span>}
                </div>
              </div>

              <div className="schedule-field">
                <label className="schedule-field-label">Recurring</label>
                <div className="schedule-field-input-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
                    className="schedule-input"
                    type="date"
                    value={recurringDate}
                    onChange={(e) => setRecurringDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="schedule-field">
                <label className="schedule-field-label">Due date/time</label>
                <div className="schedule-field-input-row">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input
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
