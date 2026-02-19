import React, { useState, useRef, useEffect } from 'react';
import type { AuditorAssignment, MockAuditor } from '../App';

const MOCK_AUDITORS: MockAuditor[] = [
  { id: 'js', name: 'John Smith',    role: 'Area Manager - West',       initials: 'JS' },
  { id: 'mw', name: 'Mike Williams', role: 'Senior Auditor',             initials: 'MW' },
  { id: 'ed', name: 'Emily Davis',   role: 'Regional Auditor - West',    initials: 'ED' },
  { id: 'sj', name: 'Sarah Johnson', role: 'Regional Auditor - East',    initials: 'SJ' },
  { id: 'dc', name: 'David Chen',    role: 'Regional Auditor - Central', initials: 'DC' },
];

const MOCK_REGIONS = [
  { name: 'West Region',    stores: ['San Francisco - Downtown', 'San Francisco - Mission', 'San Francisco - Marina', 'Oakland - Broadway', 'Oakland - Lake Merritt', 'San Jose - Downtown', 'San Jose - Willow Glen', 'Sacramento - Midtown'] },
  { name: 'East Region',   stores: ['New York - Manhattan', 'New York - Brooklyn', 'Boston - Downtown', 'Philadelphia - Center City', 'Washington DC - Downtown'] },
  { name: 'Central Region', stores: ['Chicago - Loop', 'Chicago - North Side', 'Dallas - Downtown', 'Houston - Midtown', 'Minneapolis - Downtown'] },
];

const ALL_STORES = MOCK_REGIONS.flatMap((r) => r.stores);

interface Props {
  initialAssignments: AuditorAssignment[];
  onConfirm: (assignments: AuditorAssignment[]) => void;
  onCancel: () => void;
}

// IndeterminateCheckbox handles the indeterminate visual state
interface IndeterminateCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}
const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({ checked, indeterminate, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />;
};

const AssignAuditorsView: React.FC<Props> = ({ initialAssignments, onConfirm, onCancel }) => {
  // assignments: auditorId → selected stores[]
  const [assignments, setAssignments] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const a of initialAssignments) map[a.auditor.id] = [...a.stores];
    return map;
  });
  const [activeAuditorId, setActiveAuditorId] = useState<string | null>(
    initialAssignments.length > 0 ? initialAssignments[0].auditor.id : null
  );
  const [auditorSearch, setAuditorSearch] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_REGIONS.map((r) => [r.name, true]))
  );
  const [nationalExpanded, setNationalExpanded] = useState(true);

  const activeAuditor = MOCK_AUDITORS.find((a) => a.id === activeAuditorId) ?? null;
  const activeStores = activeAuditorId ? (assignments[activeAuditorId] ?? []) : [];

  const filteredAuditors = MOCK_AUDITORS.filter((a) =>
    a.name.toLowerCase().includes(auditorSearch.toLowerCase()) ||
    a.role.toLowerCase().includes(auditorSearch.toLowerCase())
  );

  const totalAssignments = Object.values(assignments).filter((s) => s.length > 0).length;
  const totalStores = [...new Set(Object.values(assignments).flat())].length;

  const setActiveStores = (stores: string[]) => {
    if (!activeAuditorId) return;
    setAssignments((prev) => ({ ...prev, [activeAuditorId]: stores }));
  };

  const toggleStore = (store: string) => {
    setActiveStores(
      activeStores.includes(store)
        ? activeStores.filter((s) => s !== store)
        : [...activeStores, store]
    );
  };

  const toggleRegion = (regionStores: string[]) => {
    const allSelected = regionStores.every((s) => activeStores.includes(s));
    if (allSelected) {
      setActiveStores(activeStores.filter((s) => !regionStores.includes(s)));
    } else {
      const merged = [...new Set([...activeStores, ...regionStores])];
      setActiveStores(merged);
    }
  };

  const toggleNational = () => {
    const allSelected = ALL_STORES.every((s) => activeStores.includes(s));
    if (allSelected) {
      setActiveStores([]);
    } else {
      setActiveStores([...ALL_STORES]);
    }
  };

  const getRegionState = (regionStores: string[]) => {
    const count = regionStores.filter((s) => activeStores.includes(s)).length;
    return { checked: count === regionStores.length, indeterminate: count > 0 && count < regionStores.length };
  };

  const getNationalState = () => {
    const count = ALL_STORES.filter((s) => activeStores.includes(s)).length;
    return { checked: count === ALL_STORES.length, indeterminate: count > 0 && count < ALL_STORES.length };
  };

  const handleClearAll = () => {
    setAssignments({});
  };

  const handleConfirm = () => {
    const result: AuditorAssignment[] = MOCK_AUDITORS
      .filter((a) => (assignments[a.id] ?? []).length > 0)
      .map((a) => ({ auditor: a, stores: assignments[a.id] }));
    onConfirm(result);
  };

  const national = getNationalState();

  return (
    <div className="assign-page">
      {/* Header */}
      <div className="assign-page-header">
        <div className="assign-header-left">
          <button className="assign-back-btn" onClick={onCancel} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="assign-page-title">Assign Auditors</h1>
            <p className="assign-page-subtitle">Select an auditor and assign stores individually</p>
          </div>
        </div>
        <div className="assign-header-pills">
          <span className="assign-pill assign-pill--teal">{totalStores} stores</span>
          <span className="assign-pill assign-pill--teal">{totalAssignments} assignments</span>
        </div>
      </div>

      {/* Body: 3 columns */}
      <div className="assign-page-body">
        {/* Left: Auditor list */}
        <div className="assign-left">
          <div className="assign-left-header">
            <span className="assign-left-title">All Auditors</span>
            <span className="assign-left-count">{MOCK_AUDITORS.length}</span>
          </div>
          <input
            className="assign-search"
            type="text"
            placeholder="Search auditors…"
            value={auditorSearch}
            onChange={(e) => setAuditorSearch(e.target.value)}
          />
          <div className="assign-auditor-list">
            {filteredAuditors.map((auditor) => {
              const storeCount = (assignments[auditor.id] ?? []).length;
              const isActive = auditor.id === activeAuditorId;
              return (
                <button
                  key={auditor.id}
                  className={`assign-auditor-row${isActive ? ' assign-auditor-row--active' : ''}`}
                  onClick={() => setActiveAuditorId(auditor.id)}
                >
                  <input
                    type="checkbox"
                    checked={storeCount > 0}
                    readOnly
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                      if (storeCount > 0) {
                        setAssignments((prev) => ({ ...prev, [auditor.id]: [] }));
                      } else {
                        setActiveAuditorId(auditor.id);
                      }
                    }}
                  />
                  <div className="avatar-sm">{auditor.initials}</div>
                  <div className="assign-auditor-info">
                    <span className="assign-auditor-name">{auditor.name}</span>
                    <span className="assign-auditor-role">{auditor.role}</span>
                  </div>
                  {storeCount > 0 && (
                    <span className="assign-selected-chip">{storeCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Store workspace */}
        <div className="assign-middle">
          {!activeAuditor ? (
            <div className="assign-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="#b0c4ce" strokeWidth="1.5" width="48" height="48">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              <p className="assign-empty-text">Select an auditor to begin assigning stores</p>
            </div>
          ) : (
            <>
              {/* Workspace header */}
              <div className="assign-workspace-header">
                <div className="avatar-lg">{activeAuditor.initials}</div>
                <div className="assign-workspace-info">
                  <span className="assign-workspace-name">{activeAuditor.name}</span>
                  <span className="assign-workspace-role">{activeAuditor.role}</span>
                  {activeStores.length > 0 && (
                    <span className="assign-active-dot">
                      <svg viewBox="0 0 8 8" width="8" height="8" fill="#22a06b"><circle cx="4" cy="4" r="4" /></svg>
                      Active workspace
                    </span>
                  )}
                </div>
                <span className="assign-workspace-count">{activeStores.length}</span>
              </div>

              {/* Store tree */}
              <div className="assign-store-tree-card">
                <p className="assign-tree-hint">Select stores for {activeAuditor.name.split(' ')[0]}. Check regions or individual stores.</p>

                {/* National District */}
                <div className="assign-region-row assign-region-row--national">
                  <IndeterminateCheckbox
                    checked={national.checked}
                    indeterminate={national.indeterminate}
                    onChange={toggleNational}
                  />
                  <button
                    className="assign-region-toggle"
                    onClick={() => setNationalExpanded((v) => !v)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
                      style={{ transform: nationalExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="assign-region-name">National District</span>
                    <span className="assign-region-count">
                      {ALL_STORES.filter((s) => activeStores.includes(s)).length}/{ALL_STORES.length}
                    </span>
                  </button>
                </div>

                {nationalExpanded && MOCK_REGIONS.map((region) => {
                  const regionState = getRegionState(region.stores);
                  const isExpanded = expandedRegions[region.name];
                  const selectedInRegion = region.stores.filter((s) => activeStores.includes(s)).length;
                  return (
                    <React.Fragment key={region.name}>
                      <div className="assign-region-row assign-region-row--indented">
                        <IndeterminateCheckbox
                          checked={regionState.checked}
                          indeterminate={regionState.indeterminate}
                          onChange={() => toggleRegion(region.stores)}
                        />
                        <button
                          className="assign-region-toggle"
                          onClick={() => setExpandedRegions((prev) => ({ ...prev, [region.name]: !prev[region.name] }))}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          <span className="assign-region-name">{region.name}</span>
                          <span className="assign-region-count">{selectedInRegion}/{region.stores.length}</span>
                        </button>
                      </div>
                      {isExpanded && region.stores.map((store) => (
                        <label key={store} className="assign-store-row">
                          <input
                            type="checkbox"
                            checked={activeStores.includes(store)}
                            onChange={() => toggleStore(store)}
                          />
                          <svg viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="1.5" width="14" height="14" style={{ flexShrink: 0 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          <span className="assign-store-name">{store}</span>
                        </label>
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Assignment Summary */}
        <div className="assign-right">
          <div className="assign-summary-header">
            <span className="assign-summary-title">Assignment Summary</span>
            {totalAssignments > 0 && (
              <button className="assign-clear-all-btn" onClick={handleClearAll}>Clear All</button>
            )}
          </div>

          {totalAssignments === 0 ? (
            <p className="assign-summary-empty">No assignments yet</p>
          ) : (
            <>
              <p className="assign-summary-meta">
                {totalAssignments} auditor{totalAssignments !== 1 ? 's' : ''} · {totalStores} store{totalStores !== 1 ? 's' : ''}
              </p>
              <div className="assign-summary-list">
                {MOCK_AUDITORS.filter((a) => (assignments[a.id] ?? []).length > 0).map((auditor) => {
                  const stores = assignments[auditor.id];
                  return (
                    <div key={auditor.id} className="assign-summary-auditor">
                      <div className="assign-summary-auditor-header">
                        <div className="avatar-sm">{auditor.initials}</div>
                        <span className="assign-summary-auditor-name">{auditor.name}</span>
                        <span className="assign-selected-chip">{stores.length}</span>
                      </div>
                      <ul className="assign-summary-stores">
                        {stores.map((s) => (
                          <li key={s} className="assign-summary-store">{s}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="assign-page-footer">
        <span className="assign-footer-status">
          {totalAssignments > 0
            ? `Ready to confirm ${totalAssignments} assignment${totalAssignments !== 1 ? 's' : ''}`
            : 'No assignments yet'}
        </span>
        <div className="assign-footer-actions">
          <button className="btn btn--outline btn--pill" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn--filled btn--pill"
            onClick={handleConfirm}
            disabled={totalAssignments === 0}
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAuditorsView;
