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

interface ChooseTemplateViewProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  onUseTemplate: (template: Template) => void;
}

const ChooseTemplateView: React.FC<ChooseTemplateViewProps> = ({ templates, onSelect, onUseTemplate }) => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? templates.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : templates;

  return (
    <div className="choose-template-page">
      <div className="choose-template-top">
        <div className="choose-template-heading">
          <div className="choose-template-title-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28" aria-hidden="true">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <h1 className="choose-template-title">Choose audit template</h1>
          </div>
        </div>
        <div className="choose-template-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="2" width="16" height="16" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="choose-template-search-input"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="choose-template-list">
        {filtered.map((t) => (
          <div key={t.id} className="choose-template-row" onClick={() => onSelect(t)}>
            <div className="choose-template-row-body">
              <div className="choose-template-row-title-row">
                <span className="choose-template-row-title">{t.title}</span>
                <Badge label={t.category} customColor={CATEGORY_COLORS[t.category] ?? '#004851'} size="small" />
              </div>
              <p className="choose-template-row-desc">{t.description}</p>
              <p className="choose-template-row-meta">
                {t.sections} sections · {t.questions} questions · {t.createdBy}
              </p>
            </div>
            <div className="choose-template-row-actions">
              <button
                className="choose-template-use-btn"
                onClick={(e) => { e.stopPropagation(); onUseTemplate(t); }}
              >
                Use template
              </button>
              <span className="choose-template-preview-link">
                Preview
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="choose-template-empty">No templates found.</p>
        )}
      </div>
    </div>
  );
};

export default ChooseTemplateView;
