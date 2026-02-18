import React from 'react';

interface DiscardChangesModalProps {
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const DiscardChangesModal: React.FC<DiscardChangesModalProps> = ({ onKeepEditing, onDiscard }) => {
  return (
    <div
      className="discard-modal-overlay"
      onClick={onKeepEditing}
    >
      <div
        className="discard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="edit-modal-close"
          aria-label="Continue editing"
          onClick={onKeepEditing}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 id="discard-modal-title" className="discard-modal-title">Discard changes?</h2>
        <p className="discard-modal-body">
          You have unsaved changes. If you leave now, your changes will be lost.
        </p>

        <div className="discard-modal-actions">
          <button className="discard-modal-continue" onClick={onKeepEditing}>
            Continue editing
          </button>
          <button className="btn btn--pill discard-btn" onClick={onDiscard}>
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardChangesModal;
