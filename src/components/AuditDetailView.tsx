import React, { useState, useMemo } from 'react';
import type { AuditInstance, AuditorAssignment } from '../App';
import { useRole } from '../context/RoleContext';

interface Props {
  instance: AuditInstance;
  onViewDetails: () => void;
  onViewStore: (storeName: string, status: string) => void;
}

export type StoreStatus = 'not-started' | 'in-progress' | 'awaiting-approval' | 'changes-needed' | 'completed' | 'cancelled';

const STATUS_CYCLE: StoreStatus[] = ['not-started', 'in-progress', 'awaiting-approval', 'changes-needed', 'completed', 'cancelled'];

const MOCK_ASSIGNEE = { name: 'Roger Harris', initials: 'AB' } as const;

function groupStores(stores: string[]): Array<{ name: string; stores: string[] }> {
  if (stores.length === 0) return [];
  if (stores.length <= 2) return [{ name: 'East', stores }];
  const mid = Math.ceil(stores.length / 2);
  return [
    { name: 'East', stores: stores.slice(0, mid) },
    { name: 'West', stores: stores.slice(mid) },
  ].filter((g) => g.stores.length > 0);
}

function StatusPill({ status }: { status: StoreStatus }) {
  if (status === 'completed') return (
    <span className="breakdown-status-pill breakdown-status-pill--completed">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Completed
    </span>
  );
  if (status === 'in-progress') return (
    <span className="breakdown-status-pill breakdown-status-pill--in-progress">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      In progress
    </span>
  );
  if (status === 'awaiting-approval') return (
    <span className="breakdown-status-pill breakdown-status-pill--awaiting-approval">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      Awaiting approval
    </span>
  );
  if (status === 'changes-needed') return (
    <span className="breakdown-status-pill breakdown-status-pill--changes-needed">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
      Changes needed
    </span>
  );
  if (status === 'cancelled') return (
    <span className="breakdown-status-pill breakdown-status-pill--cancelled">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      Cancelled
    </span>
  );
  // not-started
  return (
    <span className="breakdown-status-pill breakdown-status-pill--not-started">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="11" height="11"><rect x="3" y="3" width="18" height="18" rx="3"></rect></svg>
      Not started
    </span>
  );
}

function EntryActions() {
  return (
    <div className="breakdown-actions">
      <button className="breakdown-action-btn" title="Upload">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>
      <button className="breakdown-action-btn" title="Comment">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
        </svg>
      </button>
      <button className="breakdown-action-btn" title="Notify">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
      </button>
      <button className="breakdown-action-btn breakdown-action-btn--close" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}

function RecipientEntryMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div className="card-dropdown card-dropdown--right" style={{ zIndex: 200 }}>
            <button className="card-dropdown-item" onClick={() => setOpen(false)}>
              Upload
            </button>
            <button className="card-dropdown-item" onClick={() => setOpen(false)}>
              Comment
            </button>
            <button className="card-dropdown-item" onClick={() => setOpen(false)}>
              Notify
            </button>
            <button className="card-dropdown-item card-dropdown-item--danger" onClick={() => setOpen(false)}>
              Remove
            </button>
          </div>
        </>
      )}
      <button className="card-more-btn" aria-label="More options" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

const AuditDetailView: React.FC<Props> = ({ instance, onViewDetails, onViewStore }) => {
  const { role } = useRole();
  const isAuditorsMode = instance.audience === 'auditors';
  const stores = instance.stores;
  const completedCount = instance.completedCount;
  const auditorAssignments: AuditorAssignment[] = instance.auditorAssignments ?? [];

  const [showUploads, setShowUploads] = useState(false);
  const [auditorFilter, setAuditorFilter] = useState<string>('all');
  const [auditorDropdownOpen, setAuditorDropdownOpen] = useState(false);
  const [showAllDropdownOpen, setShowAllDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    () => new Set(['East', 'West'])
  );

  const storeIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    stores.forEach((s, i) => m.set(s, i));
    return m;
  }, [stores]);

  const getStatus = (storeName: string): StoreStatus => {
    const idx = storeIndexMap.get(storeName) ?? 0;
    return STATUS_CYCLE[idx % STATUS_CYCLE.length];
  };

  const visibleStores = useMemo(() => {
    if (!isAuditorsMode || auditorFilter === 'all') return stores;
    const assignment = auditorAssignments.find((a) => a.auditor.id === auditorFilter);
    return assignment ? assignment.stores : [];
  }, [stores, isAuditorsMode, auditorFilter, auditorAssignments]);

  const regionGroups = useMemo(() => groupStores(visibleStores), [visibleStores]);

  const toggleRegion = (name: string) =>
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const totalCount = stores.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const regionCompletedCount = (regionStores: string[]) =>
    regionStores.filter((s) => getStatus(s) === 'completed').length;

  const selectedAuditorName =
    auditorFilter === 'all'
      ? 'All auditors'
      : auditorAssignments.find((a) => a.auditor.id === auditorFilter)?.auditor.name ?? 'Auditor';

  return (
    <div className="audit-detail-page">
      <div className="audit-detail-container">

        {/* Header */}
        <div className="audit-detail-header">
          <h1 className="audit-detail-title">{instance.title}</h1>
          <div className="audit-detail-progress-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="15" height="15">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
            <span className="audit-detail-progress-text">
              {totalCount} · {completedCount}/{totalCount} completed · {progressPct}%
            </span>
          </div>
          <div className="audit-detail-progress-bar-track">
            <div className="audit-detail-progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="audit-detail-warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="#c97c00" strokeWidth="2" width="15" height="15">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="9" y1="14" x2="9" y2="16"></line>
              <line x1="9" y1="18" x2="9" y2="18.5" strokeWidth="3"></line>
            </svg>
            <span className="audit-detail-warning-text">
              This task is incomplete for 1 archived user
            </span>
          </div>
          {isAuditorsMode && (
            <p className="audit-detail-subtitle">
              Progress reflects audits completed by auditors at each store.
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="audit-detail-toolbar">

          {/* Auditor display — Mode B only */}
          {isAuditorsMode && (
            auditorAssignments.length === 1 ? (
              /* Single auditor: label above, avatar + name below */
              <div className="audit-detail-auditor-single">
                <span className="audit-detail-auditor-single-label">Auditor</span>
                <div className="audit-detail-auditor-single-row">
                  <div className="avatar-sm">{auditorAssignments[0].auditor.initials}</div>
                  <span className="audit-detail-auditor-single-name">{auditorAssignments[0].auditor.name}</span>
                </div>
              </div>
            ) : (
              /* Multiple auditors: dropdown to filter */
              <div style={{ position: 'relative' }}>
                <button
                  className="audit-detail-auditor-select"
                  onClick={() => setAuditorDropdownOpen((o) => !o)}
                >
                  <span>{selectedAuditorName}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {auditorDropdownOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setAuditorDropdownOpen(false)} />
                    <div className="card-dropdown" style={{ zIndex: 200, minWidth: '160px' }}>
                      <button
                        className={`card-dropdown-item${auditorFilter === 'all' ? ' card-dropdown-item--selected' : ''}`}
                        onClick={() => { setAuditorFilter('all'); setAuditorDropdownOpen(false); }}
                      >
                        All auditors
                      </button>
                      {auditorAssignments.map((a) => (
                        <button
                          key={a.auditor.id}
                          className={`card-dropdown-item${auditorFilter === a.auditor.id ? ' card-dropdown-item--selected' : ''}`}
                          onClick={() => { setAuditorFilter(a.auditor.id); setAuditorDropdownOpen(false); }}
                        >
                          {a.auditor.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          )}

          {/* Right group: uploads toggle, show all, select filter, search */}
          <div className="audit-detail-toolbar-right">

            <label className="audit-detail-toolbar-toggle">
              <span className="audit-detail-label">Show Uploads</span>
              <button
                role="switch"
                aria-checked={showUploads}
                className={`toggle-switch${showUploads ? ' toggle-switch--on' : ''}`}
                onClick={() => setShowUploads((v) => !v)}
              >
                <span className="toggle-thumb" />
              </button>
            </label>

            {/* Show all dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn--outlined btn--pill btn--sm"
                onClick={() => setShowAllDropdownOpen((o) => !o)}
              >
                Show all
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {showAllDropdownOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowAllDropdownOpen(false)} />
                  <div className="card-dropdown" style={{ zIndex: 200 }}>
                    {['Show all', 'Completed', 'Not started'].map((opt) => (
                      <button key={opt} className="card-dropdown-item" onClick={() => setShowAllDropdownOpen(false)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Select filter */}
            <button className="btn btn--outlined btn--pill btn--sm">
              Select filter
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Search */}
            <div className="audit-detail-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9aa5ae" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="audit-detail-search-input"
              />
            </div>

          </div>
        </div>

        {/* Breakdown list */}
        <div className="audit-detail-list">
          {visibleStores.length === 0 ? (
            <p className="audit-detail-empty">No stores match the selected filter.</p>
          ) : (
            regionGroups.map((region) => {
              const rCompleted = regionCompletedCount(region.stores);
              const rTotal = region.stores.length;
              const rPct = rTotal > 0 ? Math.round((rCompleted / rTotal) * 100) : 0;
              const rExpanded = expandedRegions.has(region.name);

              return (
                <div key={region.name} className="breakdown-region-group">
                  {/* Region row */}
                  <div className="breakdown-region-row" onClick={() => toggleRegion(region.name)}>
                    <span className={`breakdown-chevron${rExpanded ? ' breakdown-chevron--open' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                    <span className="breakdown-region-name">{region.name}</span>
                    <div className="breakdown-region-progress">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2" width="13" height="13">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 010 7.75"></path>
                      </svg>
                      <span className="breakdown-progress-text">
                        {rTotal} · {rCompleted}/{rTotal} completed · {rPct}%
                      </span>
                    </div>
                  </div>

                  {rExpanded && region.stores.map((storeName) => {
                    const status = getStatus(storeName);
                    const isCompleted = status === 'completed';

                    if (isAuditorsMode) {
                      if (role === 'areaManager') {
                        // Recipient view: flat row matching Mode B but with action button + 3-dot menu
                        const actionButton = status === 'completed' ? (
                          <button className="btn btn--outlined btn--pill btn--sm" onClick={(e) => e.stopPropagation()}>
                            View results
                          </button>
                        ) : status === 'in-progress' ? (
                          <button className="btn btn--filled btn--pill btn--sm" onClick={(e) => e.stopPropagation()}>
                            Continue
                          </button>
                        ) : status === 'not-started' ? (
                          <button className="btn btn--filled btn--pill btn--sm" onClick={(e) => e.stopPropagation()}>
                            Start
                          </button>
                        ) : null; // awaiting-approval, changes-needed, cancelled → status only

                        return (
                          <div
                            key={storeName}
                            className={`breakdown-store-group breakdown-store-group--${isCompleted ? 'completed' : 'not-started'}`}
                          >
                            <div
                              className="breakdown-entry-row breakdown-entry-row--flat breakdown-entry-row--clickable"
                              onClick={() => onViewStore(storeName, status)}
                            >
                              <span className="breakdown-store-name">{storeName}</span>
                              <StatusPill status={status} />
                              {isCompleted && <span className="breakdown-score">Score <strong>78%</strong></span>}
                              <span className="breakdown-date-text">
                                {isCompleted
                                  ? <>Started 11 Nov &nbsp; Submitted <strong>11 Nov</strong></>
                                  : <>Send out 11 Nov</>
                                }
                              </span>
                              {actionButton}
                              <RecipientEntryMenu />
                            </div>
                          </div>
                        );
                      }

                      // Mode B: flat store row, no child rows (HQ sender view)
                      return (
                        <div
                          key={storeName}
                          className={`breakdown-store-group breakdown-store-group--${isCompleted ? 'completed' : 'not-started'}`}
                        >
                          <div
                            className="breakdown-entry-row breakdown-entry-row--flat breakdown-entry-row--clickable"
                            onClick={() => onViewStore(storeName, status)}
                          >
                            <span className="breakdown-store-name">{storeName}</span>
                            <StatusPill status={status} />
                            {isCompleted && (
                              <span className="breakdown-score">Score <strong>78%</strong></span>
                            )}
                            <span className="breakdown-date-text">
                              {isCompleted
                                ? <>Started 11 Nov &nbsp; Submitted <strong>11 Nov</strong></>
                                : <>Send out 11 Nov</>
                              }
                            </span>
                            <EntryActions />
                          </div>
                        </div>
                      );
                    }

                    // Mode A: flat row when not started; store header + assignee row when picked up
                    const isPickedUp = status !== 'not-started';

                    return (
                      <div
                        key={storeName}
                        className={`breakdown-store-group breakdown-store-group--${isCompleted ? 'completed' : 'not-started'}`}
                      >
                        {isPickedUp ? (
                          <>
                            {/* Store header row — owner of the audit */}
                            <div className="breakdown-store-row breakdown-store-row--no-toggle breakdown-store-row--owner">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0, color: 'var(--qui-color-text-secondary)' }}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                              </svg>
                              <span
                                className="breakdown-store-name breakdown-store-name--link"
                                onClick={() => onViewStore(storeName, status)}
                              >{storeName}</span>
                            </div>
                            {/* Person row — execution context, indented under store */}
                            <div
                              className="breakdown-entry-row breakdown-entry-row--clickable breakdown-entry-row--child"
                              onClick={() => onViewStore(storeName, status)}
                            >
                              <span className="breakdown-picked-up-label">Picked up by</span>
                              <div className="avatar-sm breakdown-avatar">{MOCK_ASSIGNEE.initials}</div>
                              <span className="breakdown-entry-name">{MOCK_ASSIGNEE.name}</span>
                              <StatusPill status={status} />
                              {isCompleted && (
                                <span className="breakdown-score">Score <strong>78%</strong></span>
                              )}
                              <span className="breakdown-date-text">
                                {isCompleted
                                  ? <>Started 11 Nov &nbsp; Submitted <strong>11 Nov</strong></>
                                  : <>Send out 11 Nov</>
                                }
                              </span>
                              <EntryActions />
                            </div>
                          </>
                        ) : (
                          /* Not started: flat clickable store row */
                          <div
                            className="breakdown-entry-row breakdown-entry-row--flat breakdown-entry-row--clickable"
                            onClick={() => onViewStore(storeName, status)}
                          >
                            <span className="breakdown-store-name">{storeName}</span>
                            <StatusPill status={status} />
                            <span className="breakdown-date-text">Send out 11 Nov</span>
                            <EntryActions />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="audit-detail-bottom-bar">
        {role !== 'store' && (
          <button className="btn btn--outlined btn--pill btn--sm" onClick={onViewDetails}>View details</button>
        )}
      </div>
    </div>
  );
};

export default AuditDetailView;
