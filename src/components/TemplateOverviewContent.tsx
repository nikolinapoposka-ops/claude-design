import React, { useState } from 'react';
import { Badge } from '@quinyx/ui';
import type { Template } from './TemplateCard';

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

interface TemplateOverviewContentProps {
  template: Template;
  onUseTemplate: () => void;
}

const TemplateOverviewContent: React.FC<TemplateOverviewContentProps> = ({ template, onUseTemplate }) => {
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]));

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
      <div className="detail-bottom-bar detail-bottom-bar--overview">
        <button className="btn btn--filled btn--pill" onClick={onUseTemplate}>
          Use this template
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </>
  );
};

export default TemplateOverviewContent;
