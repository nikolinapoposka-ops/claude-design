import React from 'react';

interface CreateAuditModalProps {
  onClose: () => void;
  onNavigateToTemplate: () => void;
  onReuseTemplate: () => void;
}

const CreateAuditModal: React.FC<CreateAuditModalProps> = ({ onClose, onNavigateToTemplate, onReuseTemplate }) => {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <h2 id="modal-title">Create an audit</h2>
        <p className="modal-subtitle">Choose how you want to get started</p>

        {/* Option 1 */}
        <button className="modal-option" data-test-id="modal-option-reuse" onClick={() => { onClose(); onReuseTemplate(); }}>
          <div className="modal-option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1e282f" strokeWidth="2" width="26" height="26">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div className="modal-option-body">
            <h3>Reuse an existing audit</h3>
            <p>Use a company-approved audit template and send it to stores or auditors.</p>
          </div>
          <svg className="modal-option-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* OR divider */}
        <div className="modal-divider">OR</div>

        {/* Option 2 */}
        <button
          className="modal-option"
          data-test-id="modal-option-new-template"
          onClick={() => { onClose(); onNavigateToTemplate(); }}
        >
          <div className="modal-option-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1e282f" strokeWidth="2" width="26" height="26">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <div className="modal-option-body">
            <h3>Create a new audit template</h3>
            <p>Design a reusable audit template with your own sections, questions, logic, and scoring.</p>
          </div>
          <svg className="modal-option-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

      </div>
    </div>
  );
};

export default CreateAuditModal;
