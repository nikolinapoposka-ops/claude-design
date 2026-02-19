import React, { useState, useRef, useEffect } from 'react';

const MOCK_REGIONS = [
  { name: 'West Region',    stores: ['San Francisco - Downtown', 'San Francisco - Mission', 'San Francisco - Marina', 'Oakland - Broadway', 'Oakland - Lake Merritt', 'San Jose - Downtown', 'San Jose - Willow Glen', 'Sacramento - Midtown'] },
  { name: 'East Region',   stores: ['New York - Manhattan', 'New York - Brooklyn', 'Boston - Downtown', 'Philadelphia - Center City', 'Washington DC - Downtown'] },
  { name: 'Central Region', stores: ['Chicago - Loop', 'Chicago - North Side', 'Dallas - Downtown', 'Houston - Midtown', 'Minneapolis - Downtown'] },
];

const ALL_STORES = MOCK_REGIONS.flatMap((r) => r.stores);

interface Props {
  initialStores: string[];
  onConfirm: (stores: string[]) => void;
  onCancel: () => void;
}

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

const AssignStoresView: React.FC<Props> = ({ initialStores, onConfirm, onCancel }) => {
  const [selectedStores, setSelectedStores] = useState<string[]>(initialStores);
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_REGIONS.map((r) => [r.name, true]))
  );
  const [nationalExpanded, setNationalExpanded] = useState(true);

  const toggleStore = (store: string) => {
    setSelectedStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  };

  const toggleRegion = (regionStores: string[]) => {
    const allSelected = regionStores.every((s) => selectedStores.includes(s));
    if (allSelected) {
      setSelectedStores((prev) => prev.filter((s) => !regionStores.includes(s)));
    } else {
      setSelectedStores((prev) => [...new Set([...prev, ...regionStores])]);
    }
  };

  const toggleNational = () => {
    const allSelected = ALL_STORES.every((s) => selectedStores.includes(s));
    setSelectedStores(allSelected ? [] : [...ALL_STORES]);
  };

  const getRegionState = (regionStores: string[]) => {
    const count = regionStores.filter((s) => selectedStores.includes(s)).length;
    return { checked: count === regionStores.length, indeterminate: count > 0 && count < regionStores.length };
  };

  const getNationalState = () => {
    const count = ALL_STORES.filter((s) => selectedStores.includes(s)).length;
    return { checked: count === ALL_STORES.length, indeterminate: count > 0 && count < ALL_STORES.length };
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
            <h1 className="assign-page-title">Assign Stores</h1>
            <p className="assign-page-subtitle">Select stores for self-audit</p>
          </div>
        </div>
        <div className="assign-header-pills">
          <span className="assign-pill assign-pill--teal">{selectedStores.length} stores selected</span>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="assign-page-body">
        {/* Left / Middle: Store tree */}
        <div className="assign-middle assign-middle--full">
          <div className="assign-store-tree-card">
            <p className="assign-tree-hint">Check regions or individual stores to assign them.</p>

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
                  {ALL_STORES.filter((s) => selectedStores.includes(s)).length}/{ALL_STORES.length}
                </span>
              </button>
            </div>

            {nationalExpanded && MOCK_REGIONS.map((region) => {
              const regionState = getRegionState(region.stores);
              const isExpanded = expandedRegions[region.name];
              const selectedInRegion = region.stores.filter((s) => selectedStores.includes(s)).length;
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
                    <label key={store} className="assign-store-row assign-store-row--indented">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store)}
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
        </div>

        {/* Right: Summary */}
        <div className="assign-right">
          <div className="assign-summary-header">
            <span className="assign-summary-title">Summary</span>
            {selectedStores.length > 0 && (
              <button className="assign-clear-all-btn" onClick={() => setSelectedStores([])}>Clear All</button>
            )}
          </div>

          {selectedStores.length === 0 ? (
            <p className="assign-summary-empty">No stores selected</p>
          ) : (
            <>
              <p className="assign-summary-meta">
                {selectedStores.length} store{selectedStores.length !== 1 ? 's' : ''} selected
              </p>
              <ul className="assign-summary-stores-flat">
                {selectedStores.map((store) => (
                  <li key={store} className="assign-summary-store">{store}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="assign-page-footer">
        <span className="assign-footer-status">
          {selectedStores.length > 0
            ? `${selectedStores.length} store${selectedStores.length !== 1 ? 's' : ''} selected`
            : 'No stores selected'}
        </span>
        <div className="assign-footer-actions">
          <button className="btn btn--outline btn--pill" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn--filled btn--pill"
            onClick={() => onConfirm(selectedStores)}
            disabled={selectedStores.length === 0}
          >
            Confirm Stores
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStoresView;
