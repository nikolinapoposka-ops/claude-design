import React from 'react';

interface ArchiveConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div
      className="discard-modal-overlay"
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
    >
      <div
        className="discard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="edit-modal-close"
          aria-label="Cancel"
          onClick={onCancel}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 id="archive-modal-title" className="discard-modal-title">Archive template?</h2>
        <p className="discard-modal-body">
          Archiving this template will remove it from the template library.
          Existing audits created from this template will not be affected.
        </p>

        <div className="discard-modal-actions">
          <button className="discard-modal-continue" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn--pill discard-btn" onClick={onConfirm}>
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveConfirmModal;
