import React, { useState } from 'react';

const VISIBILITY_OPTIONS = [
  { value: 'store-managers', label: 'Store managers' },
  { value: 'team-members', label: 'Team members' },
];

interface Props {
  templateName: string;
  selectedStores: string[];
  onBack: () => void;
  onConfirm: () => void;
}

const ReviewAudienceView: React.FC<Props> = ({ templateName, selectedStores, onBack, onConfirm }) => {
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const selectedOption = VISIBILITY_OPTIONS.find((o) => o.value === visibilityFilter);

  const TRUNCATE_AT = 8;
  const hasMore = selectedStores.length > TRUNCATE_AT;
  const storeDisplay = showAll
    ? selectedStores.join(', ')
    : selectedStores.slice(0, TRUNCATE_AT).join(', ') + (hasMore ? ', ...' : '');

  return (
    <div className="ra-page">
      {/* Back button on gray background */}
      <div className="ra-top-bar">
        <button className="ra-back-btn" onClick={onBack} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Centered card */}
      <div className="ra-main">
        <div className="ra-card">
          <h2 className="ra-card-title">Audience for &ldquo;{templateName}&rdquo;</h2>
          <p className="ra-card-subtitle">
            Please review the settings for this audience before confirming it and applying it to your task
          </p>

          <hr className="ra-divider" />

          {/* Visibility filter */}
          <div className="ra-section">
            <h3 className="ra-section-title">Add a visibility filter</h3>
            <p className="ra-section-desc">
              The roles you select will further limit who has oversight of this task e.g. store managers only
            </p>

            <div className="ra-dropdown-wrap">
              <button
                className="ra-dropdown-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={dropdownOpen}
              >
                <span className={selectedOption ? '' : 'ra-dropdown-placeholder'}>
                  {selectedOption?.label ?? 'Not selected'}
                </span>
                <svg
                  viewBox="0 0 10 6"
                  fill="currentColor"
                  width="12"
                  height="12"
                  style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="ra-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="ra-dropdown-menu" role="listbox">
                    <button
                      className={`ra-dropdown-item${!visibilityFilter ? ' ra-dropdown-item--selected' : ''}`}
                      onClick={() => { setVisibilityFilter(''); setDropdownOpen(false); }}
                      role="option"
                    >
                      Not selected
                    </button>
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`ra-dropdown-item${visibilityFilter === opt.value ? ' ra-dropdown-item--selected' : ''}`}
                        onClick={() => { setVisibilityFilter(opt.value); setDropdownOpen(false); }}
                        role="option"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="ra-info-box">
            <p className="ra-info-line">
              This task will be shared with all users in the following {selectedStores.length} group{selectedStores.length !== 1 ? 's' : ''}:
            </p>
            <p className="ra-info-line ra-info-line--stores">
              <span className="ra-stores-label">Store:</span>
              &nbsp;{storeDisplay}
              {hasMore && (
                <button className="ra-see-all-btn" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? 'Show less' : 'See all'}
                </button>
              )}
            </p>
            <p className="ra-info-line">
              The recipients of an item using this audience will remain the same throughout the lifetime of the item, unless the audience is updated manually.
            </p>
            <p className="ra-info-line">
              The recipients you have chosen will be asked to complete this task.
            </p>
          </div>
        </div>

        {/* Confirm button */}
        <div className="ra-footer">
          <button className="btn btn--filled btn--pill ra-confirm-btn" onClick={onConfirm}>
            Set audience
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAudienceView;
