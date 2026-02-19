import React, { useState } from 'react';
import { Badge } from '@quinyx/ui';
import type { Template } from './TemplateCard';
import ArchiveConfirmModal from './ArchiveConfirmModal';
import { useRole } from '../context/RoleContext';

const CATEGORY_COLORS: Record<string, string> = {
  Branding:    '#b23d59',
  Merchandise: '#1565c0',
  Security:    '#004851',
  Safety:      '#e65100',
  Operations:  '#2e7d32',
};

interface TemplateDetailContentProps {
  template: Template;
  onEdit?: () => void;
  onArchive?: () => void;
}

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

const TemplateDetailContent: React.FC<TemplateDetailContentProps> = ({ template, onEdit, onArchive }) => {
  const { role } = useRole();
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const isArchived = template.status === 'archived';

  const toggleSection = (id: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasRealData = !!(template.sectionData && template.sectionData.length > 0);
  const displaySections = hasRealData
    ? template.sectionData!.map((s, idx) => ({
        id: idx + 1,
        title: s.title,
        subtitle: '',
        questions: s.questions.map((q, qIdx) => ({ id: qIdx + 1, text: q, required: false })),
      }))
    : MOCK_SECTIONS;

  const totalQuestions = displaySections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <>
      <div className="template-detail-page">

        {/* Summary card */}
        <div className="detail-summary-card">
          <div className="detail-badges">
            {template.isPriority && (
              <span className="detail-badge detail-badge--priority">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                  <polyline points="4 4 4 20"></polyline>
                  <polygon points="4 4 20 9 4 14"></polygon>
                </svg>
                Priority
              </span>
            )}
            <Badge label={template.category} customColor={CATEGORY_COLORS[template.category] ?? '#004851'} size="small" />
            {isArchived && (
              <span className="detail-archived-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Archived
              </span>
            )}
          </div>

          <h1 className="detail-title">{template.title}</h1>

          {template.description ? (
            <p className="detail-description">{template.description}</p>
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
                    <span className="detail-section-subtitle">{section.subtitle}</span>
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

      {/* Bottom bar */}
      <div className={`detail-bottom-bar${isArchived ? ' detail-bottom-bar--archived' : ''}`}>
        {isArchived ? (
          <div style={{ position: 'relative' }}>
            {copyDropdownOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                  onClick={() => setCopyDropdownOpen(false)}
                />
                <div className="card-dropdown card-dropdown--right">
                  <button className="card-dropdown-item" onClick={() => setCopyDropdownOpen(false)}>
                    Create a copy
                  </button>
                </div>
              </>
            )}
            <button
              className="card-more-btn"
              aria-label="More options"
              title="More options"
              onClick={() => setCopyDropdownOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {role === 'hq' && (
              <button className="btn btn--outlined btn--pill" onClick={() => setEditModalOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            )}
            <button className="btn btn--outlined btn--pill">
              Use this template
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            {/* 3-dot context menu — bottom right */}
            <div style={{ position: 'absolute', right: 24 }}>
              {detailMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                    onClick={() => setDetailMenuOpen(false)}
                  />
                  <div className="card-dropdown card-dropdown--right">
                    <button className="card-dropdown-item" onClick={() => setDetailMenuOpen(false)}>
                      Notify changes
                    </button>
                    <button className="card-dropdown-item" onClick={() => setDetailMenuOpen(false)}>
                      Create a copy
                    </button>
                    <button className="card-dropdown-item" onClick={() => setDetailMenuOpen(false)}>
                      Create audit from template
                    </button>
                    {role === 'hq' && (
                      <button
                        className="card-dropdown-item card-dropdown-item--danger"
                        onClick={() => { setDetailMenuOpen(false); setShowArchiveModal(true); }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </>
              )}
              <button
                className="card-more-btn"
                aria-label="More options"
                title="More options"
                onClick={() => setDetailMenuOpen((o) => !o)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {showArchiveModal && (
        <ArchiveConfirmModal
          onCancel={() => setShowArchiveModal(false)}
          onConfirm={() => { setShowArchiveModal(false); onArchive?.(); }}
        />
      )}

      {/* Edit warning modal */}
      {editModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="edit-modal-close"
              aria-label="Close"
              onClick={() => setEditModalOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="edit-modal-icon-wrap">
              <div className="edit-modal-icon-outer">
                <div className="edit-modal-icon-inner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="28" height="28" aria-hidden="true">
                    <line x1="12" y1="8" x2="12" y2="13"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="edit-modal-title">Editing this template may impact scoring in reports</h2>
            <p className="edit-modal-body">
              If you change questions or scoring, future audit results may not be comparable with previous reports.
            </p>
            <p className="edit-modal-body">
              Changes to titles or descriptions won't affect scoring.
            </p>

            <div className="edit-modal-actions">
              <button className="edit-modal-cancel" onClick={() => setEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn--filled btn--pill" onClick={() => { setEditModalOpen(false); onEdit?.(); }}>
                Edit template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateDetailContent;
