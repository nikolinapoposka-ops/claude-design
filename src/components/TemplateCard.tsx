import React, { useState } from 'react';
import { Badge } from '@quinyx/ui';
import ArchiveConfirmModal from './ArchiveConfirmModal';

const CATEGORY_COLORS: Record<string, string> = {
  Branding:    '#b23d59',
  Merchandise: '#1565c0',
  Security:    '#004851',
  Safety:      '#e65100',
  Operations:  '#2e7d32',
};

export interface Template {
  id: string;
  title: string;
  sections: number;
  questions: number;
  sectionData?: Array<{ title: string; questions: string[] }>;
  description?: string;
  createdBy: string;
  publishedOn: string;
  category: string;
  isSaving?: boolean;
  isPriority?: boolean;
  status?: 'library' | 'draft' | 'archived';
}

type TemplateCardProps = Omit<Template, 'id'> & {
  onArchive?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  sections,
  questions,
  sectionData,
  createdBy,
  publishedOn,
  category,
  isSaving,
  status,
  onArchive,
  onDelete,
  onClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const isDraft = status === 'draft';
  const isArchived = status === 'archived';

  const handleArchive = () => {
    setDropdownOpen(false);
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = () => {
    setShowArchiveModal(false);
    onArchive?.();
  };

  return (
    <div
      className={`audit-card${isSaving ? ' audit-card--saving' : ''}${isArchived ? ' audit-card--archived' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >

      {/* Header: label */}
      <div className="card-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="16" height="16">
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          {isDraft
            ? <path d="M12 11v6M9 14h6"></path>
            : <polyline points="9 12 11 14 15 10"></polyline>
          }
        </svg>
        <span className="card-label">{isDraft ? 'Draft' : 'Template'}</span>
      </div>

      {/* Title */}
      <p className="card-title">{title}</p>

      {/* Meta rows */}
      {isSaving ? (
        <p className="card-meta card-meta--saving">Saving…</p>
      ) : sectionData && sectionData.length > 0 ? (
        <>
          <div className="card-section-list">
            {sectionData.map((sec, sIdx) => (
              <div key={sIdx} className="card-section-item">
                <p className="card-section-title">{sec.title}</p>
                {sec.questions.map((q, qIdx) => (
                  <p key={qIdx} className="card-question-item">{q}</p>
                ))}
              </div>
            ))}
          </div>
          <p className="card-meta">{createdBy}</p>
          <p className="card-meta">{publishedOn}</p>
        </>
      ) : (
        <>
          <p className="card-meta">{sections} sections • {questions} questions</p>
          <p className="card-meta">{createdBy}</p>
          <p className="card-meta">{publishedOn}</p>
        </>
      )}

      {/* Footer */}
      <div className="card-footer" style={{ marginTop: 'auto', paddingTop: 12 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          {dropdownOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div className="card-dropdown">
                {isArchived ? (
                  <button className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Create a copy
                  </button>
                ) : isDraft ? (
                  <>
                    <button className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Create a copy
                    </button>
                    <button className="card-dropdown-item card-dropdown-item--danger" onClick={() => { setDropdownOpen(false); onDelete?.(); }}>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Notify changes
                    </button>
                    <button className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Create a copy
                    </button>
                    <button className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Create audit from template
                    </button>
                    <button className="card-dropdown-item card-dropdown-item--danger" onClick={handleArchive}>
                      Archive
                    </button>
                  </>
                )}
              </div>
            </>
          )}
          <button
            className="card-more-btn"
            aria-label="More options"
            title="More options"
            onClick={(e) => { e.stopPropagation(); setDropdownOpen((o) => !o); }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Badge label={category} customColor={CATEGORY_COLORS[category] ?? '#004851'} size="small" />
          {isArchived && <span className="archived-badge">Archived</span>}
        </div>
      </div>

      {showArchiveModal && (
        <ArchiveConfirmModal
          onCancel={() => setShowArchiveModal(false)}
          onConfirm={handleConfirmArchive}
        />
      )}

    </div>
  );
};

export default TemplateCard;
