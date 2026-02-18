import React, { useState, useEffect } from 'react';
import type { Template } from './TemplateCard';

interface EditTemplateContentProps {
  template: Template;
  onCancel: () => void;
  onSave: (data: { title: string; category: string }) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const EditTemplateContent: React.FC<EditTemplateContentProps> = ({ template, onCancel, onSave, onDirtyChange }) => {
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(template.category);

  const isDirty =
    title !== template.title ||
    description !== '' ||
    category !== template.category;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <>
      <div className="template-page">

        {/* Warning banner */}
        <div className="edit-warning-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ flexShrink: 0 }} aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="edit-warning-text">
            <strong>You are editing a reusable template.</strong>{' '}
            Changes to this template may affect future audits and report scoring.
          </p>
        </div>

        <div className="template-layout">

          {/* Left column */}
          <div className="template-main">

            <div className="template-card">
              <h2 className="template-card-title">Store audit details</h2>

              <div className="form-field">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Attachments</label>
                <button className="attachment-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add attachment
                </button>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Size</label>
                <button className="form-select">
                  <span className="form-select-placeholder">Not selected</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div className="no-sections-card">
              <h3 className="no-sections-title">No sections yet</h3>
              <p className="no-sections-text">Sections help organize your audit into logical groups</p>
              <button className="btn btn--filled btn--pill">Add section</button>
            </div>

          </div>

          {/* Right sidebar */}
          <div className="template-sidebar">

            <div className="template-card">
              <h2 className="template-card-title">Labels</h2>

              <label className="checkbox-row">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-label">Mark as priority</span>
              </label>

              <div className="form-field" style={{ marginTop: 16 }}>
                <label className="form-label">Category</label>
                <button
                  className="form-select form-select--teal"
                  onClick={() => {
                    const next = category === template.category ? 'General' : template.category;
                    setCategory(next);
                  }}
                >
                  <span className="form-select-placeholder">{category || 'Not selected'}</span>
                </button>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Tags</label>
                <button className="form-select">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="form-select-placeholder">Not selected</span>
                </button>
              </div>
            </div>

            <div className="template-card">
              <h2 className="template-card-title">Automated translations</h2>

              <label className="checkbox-row">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-label">Enable automated translations</span>
              </label>

              <div className="ava-row">
                <div className="ava-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div className="ava-text">
                  <p className="ava-title">Powered by Ava, your Quinyx AI Assistant</p>
                  <p className="ava-desc">
                    AI can make mistakes. We always strive to provide you with the best translations.{' '}
                    <a href="#" className="ava-link">Learn more</a>
                  </p>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: 16, marginBottom: 0 }}>
                <label className="form-label">Select languages</label>
                <button className="form-select">
                  <span style={{ flex: 1 }}></span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="template-bottom-bar">
        <button className="btn btn--outlined btn--pill" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`btn btn--filled btn--pill${isDirty ? '' : ' btn--disabled'}`}
          disabled={!isDirty}
          onClick={isDirty ? () => onSave({ title, category }) : undefined}
        >
          Save
        </button>
        <button className="template-more-btn" aria-label="More options" title="More options">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default EditTemplateContent;
