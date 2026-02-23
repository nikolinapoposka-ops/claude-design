import React from 'react';

interface SaveDraftDialogProps {
  onCancel: () => void;
  onSaveDraft: () => void;
}

const SaveDraftDialog: React.FC<SaveDraftDialogProps> = ({ onCancel, onSaveDraft }) => {
  return (
    <div className="discard-modal-overlay" onClick={onCancel}>
      <div
        className="discard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-draft-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="edit-modal-close" aria-label="Stay in flow" onClick={onCancel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 id="save-draft-dialog-title" className="discard-modal-title">Save before leaving?</h2>
        <p className="discard-modal-body">
          Your progress will be saved as a draft so you can come back and finish it later.
        </p>

        <div className="discard-modal-actions">
          <button className="discard-modal-continue" onClick={onCancel}>
            Keep editing
          </button>
          <button className="btn btn--filled btn--pill" onClick={onSaveDraft}>
            Save as draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDraftDialog;
