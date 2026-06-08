import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { useRole } from '../context/RoleContext';
import {
  REPORT_TEMPLATES, REPORT_AUDITS, REPORT_AREAS, REPORT_STORES, STORE_AUDIT_RESULTS,
  type StoreAuditResult, type SectionResult,
} from '../data/reportingData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function scoreColor(_score: number): string {
  return '#1a2b3c';
}


function statusLabel(status: string): string {
  if (status === 'done') return 'Completed';
  if (status === 'in-progress') return 'In Progress';
  return 'Not Started';
}

function statusClass(status: string): string {
  if (status === 'done') return 'rp-status--done';
  if (status === 'in-progress') return 'rp-status--progress';
  return 'rp-status--pending';
}

const COMPARISON_COLORS = ['#1565c0', '#2e7d32', '#e65100'] as const;
const TEMPLATE_COLORS = ['#26a69a', '#ffa726', '#ab47bc'] as const;
const AREA_LINE_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#ab47bc', '#00838f', '#f57c00'] as const;

const LocationPinIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 24 24" fill={color} width="11" height="11" style={{ flexShrink: 0 }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const renderGroupLegend = (props: { payload?: readonly { color?: string; value?: string }[] }) => {
  const { payload = [] } = props;
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', listStyle: 'none', padding: 0, margin: 0, justifyContent: 'center' }}>
      {payload.map((entry, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          <LocationPinIcon color={entry.color ?? '#888'} />
          <span style={{ color: '#444' }}>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

function shortAuditName(name: string): string {
  return name;
}

function periodFromDate(date: string): string {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function sectionAbsolute(section: SectionResult): { earned: number; max: number } {
  const earned = section.questions.reduce((s, q) => s + q.scoreValue, 0);
  const max = section.questions.reduce((s, q) => s + q.maxScore, 0);
  return { earned, max };
}

function resultAbsolute(result: StoreAuditResult): { earned: number; max: number } {
  let earned = 0, max = 0;
  result.sections.forEach(s => { const a = sectionAbsolute(s); earned += a.earned; max += a.max; });
  return { earned, max };
}

function fullDate(date: string): string {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}


type RollingDir = 'Last' | 'Next';
type RollingUnit = 'Days' | 'Weeks' | 'Months' | 'Years';
const ROLLING_DIRS: RollingDir[] = ['Last', 'Next'];
const ROLLING_UNITS: RollingUnit[] = ['Days', 'Weeks', 'Months', 'Years'];

function computeRollingRange(dir: RollingDir, amount: number, unit: RollingUnit): { from: string; to: string } {
  const today = new Date();
  const other = new Date(today);
  const n = dir === 'Last' ? -amount : amount;
  if (unit === 'Days') other.setDate(today.getDate() + n);
  else if (unit === 'Weeks') other.setDate(today.getDate() + n * 7);
  else if (unit === 'Months') other.setMonth(today.getMonth() + n);
  else other.setFullYear(today.getFullYear() + n);
  const [from, to] = dir === 'Last' ? [other, today] : [today, other];
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const ScoreBar: React.FC<{ score: number; showLabel?: boolean; color?: string }> = ({ score, showLabel = true, color }) => (
  <div className="rp-score-bar-wrap">
    <div className="rp-score-bar">
      <div className="rp-score-fill" style={{ width: `${score}%`, backgroundColor: color ?? scoreColor(score) }} />
    </div>
    {showLabel && <span className="rp-score-label" style={{ color: color ?? scoreColor(score) }}>{score}%</span>}
  </div>
);

const SectionAccordion: React.FC<{ section: SectionResult }> = ({ section }) => {
  const openTaskCount = section.questions.filter(q => q.followUpTask && q.followUpTaskStatus !== 'resolved').length;
  const resolvedTaskCount = section.questions.filter(q => q.followUpTask && q.followUpTaskStatus === 'resolved').length;
  const abs = sectionAbsolute(section);
  return (
    <div className="rp-section-accordion">
      <div className="rp-section-row">
        <span className="rp-section-name">{section.name}</span>
        <div className="rp-section-score-wrap">
          <span className="rp-score-absolute">{abs.earned}/{abs.max}</span>
          <span className="rp-score-dash">—</span>
          <span style={{ color: scoreColor(section.score), fontWeight: 600, fontSize: 13 }}>{section.score}%</span>
        </div>
        {openTaskCount > 0 && <span className="rp-task-count">{openTaskCount} open</span>}
        {resolvedTaskCount > 0 && <span className="rp-task-count rp-task-count--resolved">{resolvedTaskCount} resolved</span>}
      </div>
    </div>
  );
};

// Full store drill-down row (used when a specific audit is selected)
const StoreRow: React.FC<{
  result: StoreAuditResult; storeName: string; areaName: string;
  allAuditResults?: { auditName: string; result: StoreAuditResult }[];
}> = ({ result, storeName, areaName, allAuditResults }) => {
  const [open, setOpen] = useState(false);
  const allQuestions = result.sections.flatMap(s => s.questions);
  const openTaskCount = allQuestions.filter(q => q.followUpTask && q.followUpTaskStatus !== 'resolved').length;
  const resolvedTaskCount = allQuestions.filter(q => q.followUpTask && q.followUpTaskStatus === 'resolved').length;
  const isMulti = allAuditResults && allAuditResults.length > 1;
  return (
    <div className={`rp-store-block ${open ? 'rp-store-block--open' : ''}`}>
      <div className="rp-store-row" onClick={() => setOpen(v => !v)}>
        <svg className={`rp-chevron ${open ? 'rp-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="rp-store-info">
          <div className="rp-store-name">{storeName}</div>
          <div className="rp-store-area">{areaName}</div>
        </div>
        <div className="rp-store-auditor">{result.auditor}</div>
        <div className="rp-store-date">{result.date || '—'}</div>
        <div className="rp-store-score-cell">
          {isMulti ? (
            <div className="rp-comparison-scores">
              {allAuditResults.map(({ auditName, result: r }, i) => (
                <div key={i} className="rp-comparison-score">
                  <div className="rp-comparison-label" style={{ color: COMPARISON_COLORS[i % COMPARISON_COLORS.length] }}>{shortAuditName(auditName)}</div>
                  <ScoreBar score={r.overallScore} color={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} />
                </div>
              ))}
            </div>
          ) : result.status === 'done' ? (
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="rp-score-absolute">{resultAbsolute(result).earned}/{resultAbsolute(result).max}</span>
              <span className="rp-score-dash">—</span>
              <span style={{ color: scoreColor(result.overallScore), fontWeight: 600, fontSize: 13 }}>{result.overallScore}%</span>
            </span>
          ) : (
            <span className="rp-score-absolute">—</span>
          )}
        </div>
        <div className="rp-store-status">
          <span className={`rp-status-badge ${result.isOverdue ? 'rp-status--overdue' : statusClass(result.status)}`}>
            {result.isOverdue ? 'Overdue' : statusLabel(result.status)}
          </span>
        </div>
        {(openTaskCount > 0 || resolvedTaskCount > 0) && (
          <div className="rp-store-tasks">
            {openTaskCount > 0 && (
              <span className="rp-followup-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {openTaskCount} open
              </span>
            )}
            {resolvedTaskCount > 0 && (
              <span className="rp-followup-badge rp-followup-badge--resolved">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {resolvedTaskCount} done
              </span>
            )}
          </div>
        )}
      </div>
      {open && (
        <div className="rp-store-expanded">
          <div className="rp-sections-label">Section breakdown</div>
          {result.sections.map(section => (
            <SectionAccordion key={section.name} section={section} />
          ))}
        </div>
      )}
    </div>
  );
};

// Store history row — used in Store role default view
const StoreHistoryRow: React.FC<{
  auditName: string; templateName: string; date: string;
  score: number; status: string; result: StoreAuditResult;
}> = ({ auditName, templateName, date, score, status, result }) => {
  const [open, setOpen] = useState(false);
  const allQuestions = result.sections.flatMap(s => s.questions);
  const openTaskCount = allQuestions.filter(q => q.followUpTask && q.followUpTaskStatus !== 'resolved').length;
  const resolvedTaskCount = allQuestions.filter(q => q.followUpTask && q.followUpTaskStatus === 'resolved').length;
  return (
    <div className={`rp-store-block ${open ? 'rp-store-block--open' : ''}`}>
      <div className="rp-store-row" onClick={() => setOpen(v => !v)}>
        <svg className={`rp-chevron ${open ? 'rp-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="rp-store-info">
          <div className="rp-store-name">{auditName}</div>
          <div className="rp-store-area">{templateName}</div>
        </div>
        <div className="rp-store-auditor">{result.auditor}</div>
        <div className="rp-store-date">{date || '—'}</div>
        <div className="rp-store-score-cell">
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="rp-score-absolute">{resultAbsolute(result).earned}/{resultAbsolute(result).max}</span>
            <span className="rp-score-dash">—</span>
            <span style={{ color: scoreColor(score), fontWeight: 600, fontSize: 13 }}>{score}%</span>
          </span>
        </div>
        <div className="rp-store-status">
          <span className={`rp-status-badge ${statusClass(status)}`}>{statusLabel(status)}</span>
        </div>
        {(openTaskCount > 0 || resolvedTaskCount > 0) && (
          <div className="rp-store-tasks">
            {openTaskCount > 0 && (
              <span className="rp-followup-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {openTaskCount} open
              </span>
            )}
            {resolvedTaskCount > 0 && (
              <span className="rp-followup-badge rp-followup-badge--resolved">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {resolvedTaskCount} done
              </span>
            )}
          </div>
        )}
      </div>
      {open && (
        <div className="rp-store-expanded">
          <div className="rp-sections-label">Section breakdown</div>
          {result.sections.map(section => (
            <SectionAccordion key={section.name} section={section} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Date Filter Modal ─────────────────────────────────────────────────────────

const DateFilterModal: React.FC<{
  initialFrom: string;
  initialTo: string;
  initialLabel: string;
  onApply: (from: string, to: string, label: string) => void;
  onCancel: () => void;
}> = ({ initialFrom, initialTo, initialLabel, onApply, onCancel }) => {
  const isInitialRolling = !initialLabel.startsWith('Between') && !initialLabel.startsWith('Fixed');
  const [mode, setMode] = useState<'rolling' | 'fixed'>(isInitialRolling ? 'rolling' : 'fixed');
  const [rollingDir, setRollingDir] = useState<RollingDir>(() =>
    initialLabel.startsWith('Next') ? 'Next' : 'Last'
  );
  const [rollingAmount, setRollingAmount] = useState<string>(() => {
    const m = initialLabel.match(/\d+/);
    return m ? m[0] : '90';
  });
  const [rollingUnit, setRollingUnit] = useState<RollingUnit>(() => {
    for (const u of ROLLING_UNITS) { if (initialLabel.includes(u)) return u; }
    return 'Days';
  });
  const [fixedFrom, setFixedFrom] = useState(initialFrom);
  const [fixedTo, setFixedTo] = useState(initialTo);

  const previewRange = useMemo(() => {
    if (mode === 'rolling') return computeRollingRange(rollingDir, parseInt(rollingAmount) || 0, rollingUnit);
    return { from: fixedFrom, to: fixedTo };
  }, [mode, rollingDir, rollingAmount, rollingUnit, fixedFrom, fixedTo]);

  const previewLabel = mode === 'rolling'
    ? `${rollingDir} ${rollingAmount} ${rollingUnit}`
    : 'Fixed range';

  const previewText = mode === 'rolling'
    ? `${rollingDir} ${rollingAmount} ${rollingUnit} (${fmtDate(previewRange.from)} < ${fmtDate(previewRange.to)})`
    : (fixedFrom && fixedTo)
      ? `Between (${fmtDate(fixedFrom)} <= ${fmtDate(fixedTo)})`
      : 'Select dates above';

  return (
    <div className="rp-date-modal-overlay" onClick={onCancel}>
      <div className="rp-date-modal" onClick={e => e.stopPropagation()}>

        <div className="rp-date-modal-header">
          <span className="rp-date-modal-title">Select value for : Audit Date</span>
        </div>

        <div className="rp-date-modal-body">
          {/* Rolling / Fixed toggle */}
          <div className="rp-date-mode-toggle">
            <button className={`rp-date-mode-btn${mode === 'rolling' ? ' rp-date-mode-btn--active' : ''}`} onClick={() => setMode('rolling')} type="button">Rolling</button>
            <button className={`rp-date-mode-btn${mode === 'fixed' ? ' rp-date-mode-btn--active' : ''}`} onClick={() => setMode('fixed')} type="button">Fixed</button>
          </div>

          {mode === 'rolling' ? (
            <div className="rp-date-rolling-row">
              <select className="rp-date-rolling-select" value={rollingDir} onChange={e => setRollingDir(e.target.value as RollingDir)}>
                {ROLLING_DIRS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input className="rp-date-rolling-num" type="number" min="1" value={rollingAmount} onChange={e => setRollingAmount(e.target.value)} />
              <select className="rp-date-rolling-select" value={rollingUnit} onChange={e => setRollingUnit(e.target.value as RollingUnit)}>
                {ROLLING_UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          ) : (
            <div className="rp-date-fixed-row">
              <div className="rp-date-fixed-type">Between</div>
              <div className="rp-date-fixed-field">
                <input className="rp-date-fixed-input" type="date" value={fixedFrom} onChange={e => setFixedFrom(e.target.value)} />
                {fixedFrom && <button className="rp-date-fixed-clear" onClick={() => setFixedFrom('')} type="button">×</button>}
              </div>
              <span className="rp-date-fixed-to">to</span>
              <div className="rp-date-fixed-field">
                <input className="rp-date-fixed-input" type="date" value={fixedTo} onChange={e => setFixedTo(e.target.value)} />
                {fixedTo && <button className="rp-date-fixed-clear" onClick={() => setFixedTo('')} type="button">×</button>}
              </div>
            </div>
          )}

          <div className="rp-date-preview-section">
            <div className="rp-date-preview-hr" />
            <span className="rp-date-preview-label">Preview:</span>
            <div className="rp-date-preview-pill">
              Audit Date <strong>&nbsp;{previewText}</strong>
            </div>
          </div>
        </div>

        <div className="rp-date-modal-footer">
          <div className="rp-date-modal-footer-hr" />
          <div className="rp-date-modal-footer-btns">
            <button className="rp-date-cancel-btn" onClick={onCancel} type="button">Cancel</button>
            <button
              className="rp-date-apply-btn"
              onClick={() => onApply(previewRange.from, previewRange.to, previewLabel)}
              type="button"
            >Apply</button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const ReportingDashboard: React.FC = () => {
  const { role } = useRole();

  // ── Filter state ──
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [trendsOpen, setTrendsOpen] = useState(false);

  // ── Role-based scoping ──
  const visibleStores = useMemo(() => {
    if (role === 'hq') return REPORT_STORES;
    if (role === 'areaManager') return REPORT_STORES.filter(s => s.areaId === 'area-wc');
    return REPORT_STORES.filter(s => s.name === 'San Francisco - Downtown');
  }, [role]);

  const visibleAreas = useMemo(() => {
    if (role === 'hq') return REPORT_AREAS;
    return REPORT_AREAS.filter(a => a.id === 'area-wc');
  }, [role]);

  const areaLocked = role !== 'hq';
  const storeLocked = role === 'store';

  // ── Cascading audit options ──
  // Audits dropdown only available when exactly one template is selected
  const availableAudits = useMemo(() =>
    selectedTemplateIds.length === 1 ? REPORT_AUDITS.filter(a => a.templateId === selectedTemplateIds[0]) : [],
    [selectedTemplateIds]
  );

  const toggleTemplateId = (id: string) => {
    setSelectedTemplateIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    setSelectedAuditIds([]);
  };

  const toggleStoreId = (id: string) => {
    setSelectedStoreIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'done', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-started', label: 'Not Started' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s]);
  };

  const toggleAuditor = (name: string) => {
    setSelectedAuditors(prev => prev.includes(name) ? prev.filter(v => v !== name) : [...prev, name]);
  };

  const toggleAuditId = (id: string) => {
    setSelectedAuditIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openFilter) return;
    const handler = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openFilter]);
  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const handleAreaChange = (id: string) => {
    setSelectedAreaId(id);
    setSelectedStoreIds([]);
  };

  // ── Filtered stores ──
  const filteredStores = useMemo(() => {
    let stores = visibleStores;
    if (selectedAreaId) stores = stores.filter(s => s.areaId === selectedAreaId);
    if (selectedStoreIds.length > 0) stores = stores.filter(s => selectedStoreIds.includes(s.id));
    return stores;
  }, [visibleStores, selectedAreaId, selectedStoreIds]);

  // Stores available in the store dropdown (cascades from area, before store selection)
  const availableStoresForFilter = useMemo(() => {
    let stores = visibleStores;
    if (selectedAreaId) stores = stores.filter(s => s.areaId === selectedAreaId);
    return stores;
  }, [visibleStores, selectedAreaId]);

  // Single-store mode: exactly one store is focused (either via filter or Store role)
  const singleStoreMode = selectedStoreIds.length === 1 || role === 'store';
  const focusedStore = selectedStoreIds.length === 1
    ? REPORT_STORES.find(s => s.id === selectedStoreIds[0])
    : role === 'store' ? filteredStores[0] : undefined;

  const filteredStoreIds = useMemo(() => new Set(filteredStores.map(s => s.id)), [filteredStores]);

  // ── All visible results — respects all active filters ──
  const allVisibleResults = useMemo(() => {
    const templateAuditIds = selectedTemplateIds.length > 0
      ? new Set(REPORT_AUDITS.filter(a => selectedTemplateIds.includes(a.templateId)).map(a => a.id))
      : null;
    const specificAuditIds = selectedAuditIds.length > 0 ? new Set(selectedAuditIds) : null;
    return STORE_AUDIT_RESULTS.filter(r => {
      if (!filteredStoreIds.has(r.storeId)) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      if (templateAuditIds && !templateAuditIds.has(r.auditId)) return false;
      if (specificAuditIds && !specificAuditIds.has(r.auditId)) return false;
      if (selectedAuditors.length > 0 && !selectedAuditors.includes(r.auditor)) return false;
      return true;
    });
  }, [filteredStoreIds, dateFrom, dateTo, selectedTemplateIds, selectedAuditIds, selectedAuditors]);

  // Available auditors — derived from all results (before auditor filter)
  const availableAuditors = useMemo(() => {
    const auditors = new Set(STORE_AUDIT_RESULTS.filter(r => filteredStoreIds.has(r.storeId)).map(r => r.auditor));
    return [...auditors].sort();
  }, [filteredStoreIds]);

  // Latest completed result per store
  // Latest result per store — completed result shown first, plus any non-completed
  const latestResultPerStore = useMemo(() => {
    const map: Record<string, StoreAuditResult> = {};
    [...allVisibleResults]
      .filter(r => r.status === 'done')
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(r => { if (!map[r.storeId]) map[r.storeId] = r; });
    return map;
  }, [allVisibleResults]);

  // Non-completed results per store (in-progress, not-started, overdue)
  const nonCompletedResultsPerStore = useMemo(() => {
    const map: Record<string, StoreAuditResult[]> = {};
    allVisibleResults
      .filter(r => r.status !== 'done')
      .forEach(r => {
        if (!map[r.storeId]) map[r.storeId] = [];
        map[r.storeId].push(r);
      });
    return map;
  }, [allVisibleResults]);

  // Store history — used by the store-role audit history table
  const storeHistoryData = useMemo(() => {
    if (!singleStoreMode) return [];
    const sfStore = focusedStore;
    if (!sfStore) return [];
    return [...allVisibleResults]
      .filter(r => r.storeId === sfStore.id && r.status === 'done')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({
        result: r,
        auditName: REPORT_AUDITS.find(a => a.id === r.auditId)?.name ?? r.auditId,
        templateName: (() => {
          const audit = REPORT_AUDITS.find(a => a.id === r.auditId);
          return REPORT_TEMPLATES.find(t => t.id === audit?.templateId)?.name ?? '';
        })(),
      }));
  }, [singleStoreMode, focusedStore, allVisibleResults]);

  // Area drill-down history — all completed results for filtered stores when an area is selected
  const areaHistoryData = useMemo(() => {
    if (singleStoreMode || !selectedAreaId) return [];
    return [...allVisibleResults]
      .filter(r => r.status === 'done')
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(r => {
        const store = REPORT_STORES.find(s => s.id === r.storeId);
        const audit = REPORT_AUDITS.find(a => a.id === r.auditId);
        return { result: r, storeName: store?.name ?? r.storeId, auditName: audit?.name ?? r.auditId };
      });
  }, [singleStoreMode, selectedAreaId, allVisibleResults]);

  // ── Chart data ──

  // Templates to render in the grouped bar chart — selected ones, or all if none selected
  const templatesToShow = useMemo(() =>
    selectedTemplateIds.length > 0 ? REPORT_TEMPLATES.filter(t => selectedTemplateIds.includes(t.id)) : REPORT_TEMPLATES,
    [selectedTemplateIds]
  );

  // Score Trend by Audit — grouped bar chart
  // HQ overview: one group per area. HQ drilled into area / Area Manager / single store: one group per store.
  const scoreTrendByAuditData = useMemo(() => {
    if (role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0) {
      return visibleAreas.map(area => {
        const entry: Record<string, string | number> = { store: area.name };
        templatesToShow.forEach(template => {
          const auditIds = new Set(REPORT_AUDITS.filter(a => a.templateId === template.id).map(a => a.id));
          const areaStoreIds = new Set(filteredStores.filter(s => s.areaId === area.id).map(s => s.id));
          const results = allVisibleResults
            .filter(r => areaStoreIds.has(r.storeId) && auditIds.has(r.auditId) && r.status === 'done');
          const key = template.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '');
          entry[key] = results.length ? avg(results.map(r => r.overallScore)) : 0;
          let totalEarned = 0, totalMax = 0;
          results.forEach(r => { const a = resultAbsolute(r); totalEarned += a.earned; totalMax += a.max; });
          entry[`${key}_earned`] = totalEarned;
          entry[`${key}_max`] = totalMax;
        });
        return entry;
      });
    }
    // One group per store (area manager or HQ drilled into area)
    return filteredStores.map(store => {
      const entry: Record<string, string | number> = { store: store.name.split(' - ')[0] };
      templatesToShow.forEach(template => {
        const auditIds = new Set(REPORT_AUDITS.filter(a => a.templateId === template.id).map(a => a.id));
        const result = allVisibleResults
          .filter(r => r.storeId === store.id && auditIds.has(r.auditId) && r.status === 'done')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        const key = template.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '');
        entry[key] = result?.overallScore ?? 0;
        if (result) {
          const a = resultAbsolute(result);
          entry[`${key}_earned`] = a.earned;
          entry[`${key}_max`] = a.max;
        }
      });
      return entry;
    });
  }, [role, selectedAreaId, selectedStoreIds, visibleAreas, filteredStores, allVisibleResults, templatesToShow]);

  // Score Trend by Group — heatmap data
  // Rows = areas (HQ default) or stores (drilled-in). Columns = deduplicated time periods.
  const heatmapData = useMemo(() => {
    const completedAudits = REPORT_AUDITS
      .filter(a => a.status === 'done'
        && (selectedTemplateIds.length === 0 || selectedTemplateIds.includes(a.templateId))
        && (selectedAuditIds.length === 0 || selectedAuditIds.includes(a.id)))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Build ordered unique period labels
    const periodOrder: string[] = [];
    const periodDates: Record<string, string> = {};
    completedAudits.forEach(a => {
      const label = periodFromDate(a.date);
      if (!periodDates[label]) { periodOrder.push(label); periodDates[label] = a.date; }
    });
    const periods = [...periodOrder].sort((a, b) => periodDates[a].localeCompare(periodDates[b]));
    const isHQAreaView = role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0;
    const groups = isHQAreaView
      ? visibleAreas.map(ar => ({ id: ar.id, name: ar.name, isArea: true }))
      : filteredStores.map(s => ({ id: s.id, name: s.name.split(' - ')[0], isArea: false }));
    const rows = groups.map(group => {
      const cells = periods.map(period => {
        const auditsForPeriod = completedAudits.filter(a => {
          const label = periodFromDate(a.date);
          return label === period;
        });
        let results: StoreAuditResult[];
        if (group.isArea) {
          const areaStoreIds = new Set(filteredStores.filter(s => s.areaId === group.id).map(s => s.id));
          results = allVisibleResults.filter(r =>
            auditsForPeriod.some(a => a.id === r.auditId) && areaStoreIds.has(r.storeId) && r.status === 'done'
          );
        } else {
          results = allVisibleResults.filter(r =>
            auditsForPeriod.some(a => a.id === r.auditId) && r.storeId === group.id && r.status === 'done'
          );
        }
        if (!results.length) return { score: null as number | null, earned: 0, max: 0 };
        let earned = 0, max = 0;
        results.forEach(r => { const a = resultAbsolute(r); earned += a.earned; max += a.max; });
        return { score: avg(results.map(r => r.overallScore)), earned, max };
      });
      return { name: group.name, cells };
    }).filter(row => row.cells.some(c => c.score !== null));
    return { periods, rows, periodDates };
  }, [role, selectedAreaId, selectedStoreIds, visibleAreas, filteredStores, allVisibleResults, selectedTemplateIds, selectedAuditIds]);

  // Group trend line chart — derived from heatmapData to reuse deduplicated periods
  const groupTrendData = useMemo(() =>
    heatmapData.periods.map((period, i) => {
      const entry: Record<string, string | number> = { name: period, fullDate: fullDate(heatmapData.periodDates[period]) };
      heatmapData.rows.forEach(row => {
        const cell = row.cells[i];
        if (cell.score !== null) {
          entry[row.name] = cell.score;
          entry[`${row.name}_earned`] = cell.earned;
          entry[`${row.name}_max`] = cell.max;
        }
      });
      return entry;
    }).filter(e => Object.keys(e).some(k => k !== 'name' && k !== 'fullDate')),
    [heatmapData]
  );
  const groupTrendLines = useMemo(() => heatmapData.rows.map(r => r.name), [heatmapData]);

  // Template trend over time — one line per template, x-axis = deduplicated time periods
  const templateTrendData = useMemo(() => {
    const completedAudits = REPORT_AUDITS
      .filter(a => a.status === 'done'
        && (selectedTemplateIds.length === 0 || selectedTemplateIds.includes(a.templateId))
        && (selectedAuditIds.length === 0 || selectedAuditIds.includes(a.id)))
      .sort((a, b) => a.date.localeCompare(b.date));
    // Group by period label — each unique label (e.g. "Q1 2024") becomes one x-axis point
    const periodMap = new Map<string, { date: string; scores: Record<string, number[]>; results: Record<string, StoreAuditResult[]> }>();
    completedAudits.forEach(audit => {
      const periodLabel = periodFromDate(audit.date);
      const matchingTemplate = templatesToShow.find(t => t.id === audit.templateId);
      if (!matchingTemplate) return;
      const key = matchingTemplate.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '');
      const results = allVisibleResults.filter(r => r.auditId === audit.id && r.status === 'done');
      if (results.length === 0) return;
      if (!periodMap.has(periodLabel)) periodMap.set(periodLabel, { date: audit.date, scores: {}, results: {} });
      const entry = periodMap.get(periodLabel)!;
      if (!entry.scores[key]) { entry.scores[key] = []; entry.results[key] = []; }
      results.forEach(r => { entry.scores[key].push(r.overallScore); entry.results[key].push(r); });
    });
    return [...periodMap.entries()]
      .sort((a, b) => a[1].date.localeCompare(b[1].date))
      .map(([periodLabel, { date, scores, results: resMap }]) => {
        const entry: Record<string, string | number> = { name: periodLabel, fullDate: fullDate(date) };
        Object.entries(scores).forEach(([key, vals]) => {
          entry[key] = avg(vals);
          let earned = 0, max = 0;
          resMap[key].forEach(r => { const a = resultAbsolute(r); earned += a.earned; max += a.max; });
          entry[`${key}_earned`] = earned;
          entry[`${key}_max`] = max;
        });
        return entry;
      });
  }, [templatesToShow, allVisibleResults, selectedTemplateIds, selectedAuditIds]);


  // Bar click handler — sets template + area/store filter from a bar click in the Score Trend chart
  const handleBarClick = (barData: Record<string, string | number>, template: (typeof REPORT_TEMPLATES)[number]) => {
    const clickedLabel = String(barData.store);
    const isHQAreaView = role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0;
    if (isHQAreaView) {
      const area = visibleAreas.find(a => a.name === clickedLabel);
      if (!area) return;
      const alreadyActive = selectedTemplateIds.length === 1 && selectedTemplateIds[0] === template.id && selectedAreaId === area.id;
      if (alreadyActive) {
        setSelectedTemplateIds([]);
        setSelectedAreaId('');
      } else {
        setSelectedTemplateIds([template.id]);
        setSelectedAuditIds([]);
        setSelectedAreaId(area.id);
        setSelectedStoreIds([]);
      }
    } else {
      const store = filteredStores.find(s => s.name.split(' - ')[0] === clickedLabel);
      if (!store) return;
      const alreadyActive = selectedTemplateIds.length === 1 && selectedTemplateIds[0] === template.id
        && selectedStoreIds.length === 1 && selectedStoreIds[0] === store.id;
      if (alreadyActive) {
        setSelectedTemplateIds([]);
        setSelectedStoreIds([]);
      } else {
        setSelectedTemplateIds([template.id]);
        setSelectedAuditIds([]);
        setSelectedStoreIds([store.id]);
      }
    }
  };


  // ── KPI summary ──
  const kpiData = useMemo(() => {
    const totalSent = allVisibleResults.length;
    const completed = allVisibleResults.filter(r => r.status === 'done');
    const completedCount = completed.length;
    let totalEarned = 0, totalMax = 0;
    completed.forEach(r => { const a = resultAbsolute(r); totalEarned += a.earned; totalMax += a.max; });
    const overallScore = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    const overdueCount = allVisibleResults.filter(r => r.isOverdue).length;
    // Audited stores: unique stores with at least one completed result
    const auditedStoreIds = new Set(completed.map(r => r.storeId));
    const auditedStores = auditedStoreIds.size;
    const totalStores = filteredStores.length;
    // Tasks resolved: follow-up tasks from completed results
    let totalTasks = 0, resolvedTasks = 0;
    completed.forEach(r => {
      r.sections.forEach(s => {
        s.questions.forEach(q => {
          if (q.followUpTask) {
            totalTasks++;
            if (q.followUpTaskStatus === 'resolved') resolvedTasks++;
          }
        });
      });
    });
    const tasksResolvedPct = totalTasks > 0 ? Math.round((resolvedTasks / totalTasks) * 100) : 0;
    return { totalSent, completedCount, overallScore, overdueCount, auditedStores, totalStores, tasksResolvedPct, resolvedTasks, totalTasks };
  }, [allVisibleResults, filteredStores]);

  // ── Template summary — aggregated scores + section breakdowns per template ──
  const templateSummary = useMemo(() => {
    const completed = allVisibleResults.filter(r => r.status === 'done');
    return templatesToShow.map(template => {
      const auditIds = new Set(REPORT_AUDITS.filter(a => a.templateId === template.id).map(a => a.id));
      const results = completed.filter(r => auditIds.has(r.auditId));
      if (!results.length) return null;
      // Aggregate overall
      let totalEarned = 0, totalMax = 0;
      results.forEach(r => { const a = resultAbsolute(r); totalEarned += a.earned; totalMax += a.max; });
      const overallPct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
      // Aggregate per section
      const sectionMap: Record<string, { earned: number; max: number; scores: number[] }> = {};
      results.forEach(r => {
        r.sections.forEach(s => {
          if (!sectionMap[s.name]) sectionMap[s.name] = { earned: 0, max: 0, scores: [] };
          const abs = sectionAbsolute(s);
          sectionMap[s.name].earned += abs.earned;
          sectionMap[s.name].max += abs.max;
          sectionMap[s.name].scores.push(s.score);
        });
      });
      const sections = Object.entries(sectionMap).map(([name, data]) => ({
        name,
        earned: data.earned,
        max: data.max,
        pct: data.max > 0 ? Math.round((data.earned / data.max) * 100) : 0,
      }));
      return { template: template.name, earned: totalEarned, max: totalMax, pct: overallPct, sections, count: results.length };
    }).filter(Boolean) as { template: string; earned: number; max: number; pct: number; sections: { name: string; earned: number; max: number; pct: number }[]; count: number }[];
  }, [allVisibleResults, templatesToShow]);

  // ── Flop-5: most frequently failed checkpoints across completed results ──
  const flop5Data = useMemo(() => {
    const failCounts: Record<string, { count: number; category: string }> = {};
    allVisibleResults.filter(r => r.status === 'done').forEach(r => {
      r.sections.forEach(s => {
        s.questions.forEach(q => {
          if (!q.isNA && q.scoreValue === 0 && q.maxScore > 0) {
            if (!failCounts[q.text]) failCounts[q.text] = { count: 0, category: s.name };
            failCounts[q.text].count++;
          }
        });
      });
    });
    return Object.entries(failCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([issue, { count, category }]) => ({ issue, count, category }));
  }, [allVisibleResults]);

  // ── Critical stores: lowest-scoring locations from latest completed results ──
  const criticalStores = useMemo(() =>
    Object.entries(latestResultPerStore)
      .map(([storeId, result]) => {
        const store = REPORT_STORES.find(s => s.id === storeId);
        return { storeId, storeName: store?.name ?? storeId, areaName: store?.areaName ?? '', score: result.overallScore };
      })
      .filter(s => s.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 7),
    [latestResultPerStore]
  );

  // ── Top stores: highest-scoring locations ──
  const topStores = useMemo(() =>
    Object.entries(latestResultPerStore)
      .map(([storeId, result]) => {
        const store = REPORT_STORES.find(s => s.id === storeId);
        return { storeId, storeName: store?.name ?? storeId, areaName: store?.areaName ?? '', score: result.overallScore };
      })
      .filter(s => s.score >= 90)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [latestResultPerStore]
  );

  // ── Region × Template matrix ──
  const regionTemplateSummary = useMemo(() => {
    if (role !== 'hq' || selectedAreaId || selectedStoreIds.length > 0) return null;
    const rows = visibleAreas.map(area => {
      const areaStoreIds = new Set(filteredStores.filter(s => s.areaId === area.id).map(s => s.id));
      const cols = templatesToShow.map(template => {
        const auditIds = new Set(REPORT_AUDITS.filter(a => a.templateId === template.id).map(a => a.id));
        const results = allVisibleResults.filter(r =>
          areaStoreIds.has(r.storeId) && auditIds.has(r.auditId) && r.status === 'done'
        );
        const score = results.length ? avg(results.map(r => r.overallScore)) : null;
        return {
          key: template.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', ''),
          score,
        };
      });
      return { areaName: area.name, cols };
    }).filter(row => row.cols.some(c => c.score !== null));
    return rows.length > 0 ? { rows, colHeaders: templatesToShow.map(t => t.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '')) } : null;
  }, [role, selectedAreaId, selectedStoreIds, visibleAreas, filteredStores, allVisibleResults, templatesToShow]);

  // ── What to render — layout never changes based on filters ──
  const showDefaultAreaTable    = !singleStoreMode && !selectedAreaId;
  const showAreaHistory         = !singleStoreMode && !!selectedAreaId;
  const showDefaultStoreHistory = singleStoreMode;

  // ── Contextual sidebar text ──

  return (
    <div className="rp-root">
      {/* ── Header ── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <h1 className="rp-title">Audit Reporting</h1>
          <span className="rp-role-tag">
            {role === 'hq' ? 'HQ — All Stores' : role === 'areaManager' ? 'Area Manager — West Coast' : 'Store Manager — San Francisco'}
          </span>
        </div>
        <div className="rp-header-right" />
      </div>

      {/* ── Filter Bar ── */}
      <div className="rp-filter-bar" ref={filterBarRef}>

        {/* Date pill — opens modal */}
        <div className="rp-filter-pill-wrap">
          <button
            className={`rp-filter-pill${dateLabel ? ' rp-filter-pill--active' : ''}`}
            onClick={() => setDateModalOpen(true)}
            type="button"
          >
            <span className="rp-pill-label">Date</span>
            {dateLabel && <span className="rp-pill-value">{dateLabel}</span>}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className="rp-pill-chevron">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dateLabel && (
            <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setDateFrom(''); setDateTo(''); setDateLabel(''); }} type="button" title="Clear">×</button>
          )}
        </div>

        {/* Area pill */}
        <div className="rp-filter-pill-wrap">
          <button
            className={`rp-filter-pill${selectedAreaId ? ' rp-filter-pill--active' : ''}${areaLocked ? ' rp-filter-pill--locked' : ''}`}
            onClick={() => !areaLocked && toggleFilter('area')}
            type="button"
            disabled={areaLocked}
          >
            {areaLocked && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11" className="rp-pill-lock">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            )}
            <span className="rp-pill-label">Area</span>
            {selectedAreaId && <span className="rp-pill-value">{visibleAreas.find(a => a.id === selectedAreaId)?.name}</span>}
            {!areaLocked && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'area' ? ' rp-pill-chevron--open' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
          {selectedAreaId && !areaLocked && (
            <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); handleAreaChange(''); }} type="button" title="Clear">×</button>
          )}
          {openFilter === 'area' && (
            <div className="rp-pill-dropdown">
              <div
                className={`rp-pill-dropdown__option${!selectedAreaId ? ' rp-pill-dropdown__option--selected' : ''}`}
                onClick={() => { handleAreaChange(''); setOpenFilter(null); }}
              >All areas</div>
              {visibleAreas.map(a => (
                <div
                  key={a.id}
                  className={`rp-pill-dropdown__option${selectedAreaId === a.id ? ' rp-pill-dropdown__option--selected' : ''}`}
                  onClick={() => { handleAreaChange(a.id); setOpenFilter(null); }}
                >{a.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* Store pill — multi-select */}
        {!storeLocked && (
          <div className="rp-filter-pill-wrap">
            <button
              className={`rp-filter-pill${selectedStoreIds.length > 0 ? ' rp-filter-pill--active' : ''}`}
              onClick={() => toggleFilter('store')}
              type="button"
            >
              <span className="rp-pill-label">Store</span>
              {selectedStoreIds.length > 0 && (
                <span className="rp-pill-value">
                  {selectedStoreIds.length === 1
                    ? availableStoresForFilter.find(s => s.id === selectedStoreIds[0])?.name.split(' - ')[0]
                    : `${selectedStoreIds.length} selected`}
                </span>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'store' ? ' rp-pill-chevron--open' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {selectedStoreIds.length > 0 && (
              <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setSelectedStoreIds([]); }} type="button" title="Clear">×</button>
            )}
            {openFilter === 'store' && (
              <div className="rp-pill-dropdown">
                {availableStoresForFilter.map(s => {
                  const isSelected = selectedStoreIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className="rp-pill-dropdown__option"
                      onClick={() => toggleStoreId(s.id)}
                    >
                      <div className={`rp-multiselect-checkbox${isSelected ? ' rp-multiselect-checkbox--checked' : ''}`}
                        style={isSelected ? { borderColor: '#1565c0', backgroundColor: '#1565c0' } : {}}>
                        {isSelected && (
                          <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="9" height="9">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        )}
                      </div>
                      <span>{s.name.split(' - ')[0]}</span>
                      <span style={{ fontSize: 11, color: '#9aa5ae', marginLeft: 4 }}>{s.areaName}</span>
                    </div>
                  );
                })}
                {selectedStoreIds.length > 0 && (
                  <div className="rp-multiselect-hint" style={{ borderTop: '1px solid #e8ecef', marginTop: 4, paddingTop: 4 }}>
                    <button style={{ background: 'none', border: 'none', color: '#1565c0', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}
                      onClick={() => setSelectedStoreIds([])}>Clear all</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Template pill — multi-select */}
        <div className="rp-filter-pill-wrap">
          <button
            className={`rp-filter-pill${selectedTemplateIds.length > 0 ? ' rp-filter-pill--active' : ''}`}
            onClick={() => toggleFilter('template')}
            type="button"
          >
            <span className="rp-pill-label">Template</span>
            {selectedTemplateIds.length > 0 && (
              <span className="rp-pill-value">
                {selectedTemplateIds.length === 1
                  ? REPORT_TEMPLATES.find(t => t.id === selectedTemplateIds[0])?.name
                      .replace(' Standard', '').replace(' Audit', '').replace(' Review', '')
                  : `${selectedTemplateIds.length} selected`}
              </span>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'template' ? ' rp-pill-chevron--open' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {selectedTemplateIds.length > 0 && (
            <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setSelectedTemplateIds([]); setSelectedAuditIds([]); }} type="button" title="Clear">×</button>
          )}
          {openFilter === 'template' && (
            <div className="rp-pill-dropdown">
              {REPORT_TEMPLATES.map(t => {
                const isSelected = selectedTemplateIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className="rp-pill-dropdown__option"
                    onClick={() => toggleTemplateId(t.id)}
                  >
                    <div className={`rp-multiselect-checkbox${isSelected ? ' rp-multiselect-checkbox--checked' : ''}`}
                      style={isSelected ? { borderColor: '#1565c0', backgroundColor: '#1565c0' } : {}}>
                      {isSelected && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="9" height="9">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                    <span>{t.name}</span>
                  </div>
                );
              })}
              {selectedTemplateIds.length > 0 && (
                <div className="rp-multiselect-hint" style={{ borderTop: '1px solid #e8ecef', marginTop: 4, paddingTop: 4 }}>
                  <button style={{ background: 'none', border: 'none', color: '#1565c0', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}
                    onClick={() => { setSelectedTemplateIds([]); setSelectedAuditIds([]); }}>Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit instances pill — only when exactly one template selected */}
        {selectedTemplateIds.length === 1 && (
          <div className="rp-filter-pill-wrap">
            <button
              className={`rp-filter-pill${selectedAuditIds.length > 0 ? ' rp-filter-pill--active' : ''}`}
              onClick={() => toggleFilter('audits')}
              type="button"
            >
              <span className="rp-pill-label">Audits</span>
              {selectedAuditIds.length > 0 && (
                <span className="rp-pill-value">
                  {selectedAuditIds.length === 1
                    ? shortAuditName(availableAudits.find(a => a.id === selectedAuditIds[0])?.name ?? '')
                    : `${selectedAuditIds.length} selected`}
                </span>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'audits' ? ' rp-pill-chevron--open' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {selectedAuditIds.length > 0 && (
              <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setSelectedAuditIds([]); }} type="button" title="Clear">×</button>
            )}
            {openFilter === 'audits' && (
              <div className="rp-pill-dropdown">
                {availableAudits.map(audit => {
                  const isSelected = selectedAuditIds.includes(audit.id);
                  return (
                    <div
                      key={audit.id}
                      className="rp-pill-dropdown__option"
                      onClick={() => toggleAuditId(audit.id)}
                    >
                      <div
                        className={`rp-multiselect-checkbox${isSelected ? ' rp-multiselect-checkbox--checked' : ''}`}
                        style={isSelected ? { borderColor: '#1565c0', backgroundColor: '#1565c0' } : {}}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="9" height="9">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        )}
                      </div>
                      <span>{shortAuditName(audit.name)}</span>
                      <span style={{ fontSize: 11, color: '#9aa5ae', marginLeft: 4 }}>{fullDate(audit.date)}</span>
                    </div>
                  );
                })}
                {selectedAuditIds.length > 0 && (
                  <div className="rp-multiselect-hint" style={{ borderTop: '1px solid #e8ecef', marginTop: 4, paddingTop: 4 }}>
                    <button style={{ background: 'none', border: 'none', color: '#1565c0', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}
                      onClick={() => setSelectedAuditIds([])}>Clear all</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Auditor pill */}
        <div className="rp-filter-pill-wrap">
          <button
            className={`rp-filter-pill${selectedAuditors.length > 0 ? ' rp-filter-pill--active' : ''}`}
            onClick={() => toggleFilter('auditor')}
            type="button"
          >
            <span className="rp-pill-label">Auditor</span>
            {selectedAuditors.length > 0 && (
              <span className="rp-pill-value">
                {selectedAuditors.length === 1
                  ? selectedAuditors[0]
                  : `${selectedAuditors.length} selected`}
              </span>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'auditor' ? ' rp-pill-chevron--open' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {selectedAuditors.length > 0 && (
            <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setSelectedAuditors([]); }} type="button" title="Clear">×</button>
          )}
          {openFilter === 'auditor' && (
            <div className="rp-pill-dropdown">
              {availableAuditors.map(name => {
                const isSelected = selectedAuditors.includes(name);
                return (
                  <div
                    key={name}
                    className="rp-pill-dropdown__option"
                    onClick={() => toggleAuditor(name)}
                  >
                    <div
                      className={`rp-multiselect-checkbox${isSelected ? ' rp-multiselect-checkbox--checked' : ''}`}
                      style={isSelected ? { borderColor: '#1565c0', backgroundColor: '#1565c0' } : {}}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="9" height="9">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                    <span>{name}</span>
                  </div>
                );
              })}
              {selectedAuditors.length > 0 && (
                <div className="rp-multiselect-hint" style={{ borderTop: '1px solid #e8ecef', marginTop: 4, paddingTop: 4 }}>
                  <button style={{ background: 'none', border: 'none', color: '#1565c0', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}
                    onClick={() => setSelectedAuditors([])}>Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status pill */}
        <div className="rp-filter-pill-wrap">
          <button
            className={`rp-filter-pill${selectedStatuses.length > 0 ? ' rp-filter-pill--active' : ''}`}
            onClick={() => toggleFilter('status')}
            type="button"
          >
            <span className="rp-pill-label">Status</span>
            {selectedStatuses.length > 0 && (
              <span className="rp-pill-value">
                {selectedStatuses.length === 1
                  ? STATUS_OPTIONS.find(s => s.value === selectedStatuses[0])?.label
                  : `${selectedStatuses.length} selected`}
              </span>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" className={`rp-pill-chevron${openFilter === 'status' ? ' rp-pill-chevron--open' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {selectedStatuses.length > 0 && (
            <button className="rp-pill-clear" onClick={e => { e.stopPropagation(); setSelectedStatuses([]); }} type="button" title="Clear">×</button>
          )}
          {openFilter === 'status' && (
            <div className="rp-pill-dropdown">
              {STATUS_OPTIONS.map(opt => {
                const isSelected = selectedStatuses.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    className="rp-pill-dropdown__option"
                    onClick={() => toggleStatus(opt.value)}
                  >
                    <div
                      className={`rp-multiselect-checkbox${isSelected ? ' rp-multiselect-checkbox--checked' : ''}`}
                      style={isSelected ? { borderColor: '#1565c0', backgroundColor: '#1565c0' } : {}}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" width="9" height="9">
                          <polyline points="2 6 5 9 10 3" />
                        </svg>
                      )}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                );
              })}
              {selectedStatuses.length > 0 && (
                <div className="rp-multiselect-hint" style={{ borderTop: '1px solid #e8ecef', marginTop: 4, paddingTop: 4 }}>
                  <button style={{ background: 'none', border: 'none', color: '#1565c0', fontSize: 12, cursor: 'pointer', padding: '2px 0' }}
                    onClick={() => setSelectedStatuses([])}>Clear all</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Template Summary with KPIs ── */}
      {templateSummary.length > 0 && (
        <div className="rp-results-card">
          <div className="rp-results-header">
            <div className="rp-results-kpi">
              <span className="rp-overall-score-value">{kpiData.overallScore}%</span>
              <span className="rp-overall-score-label">Overall Score</span>
            </div>
            <div className="rp-results-kpi">
              <span className="rp-results-kpi-value">{kpiData.auditedStores}<span className="rp-kpi-total">/{kpiData.totalStores}</span></span>
              <span className="rp-results-kpi-label">Audited Stores</span>
            </div>
            <div className="rp-results-kpi rp-results-kpi--tasks">
              <span className="rp-results-kpi-value">{kpiData.tasksResolvedPct}%</span>
              <span className="rp-results-kpi-label">Tasks Resolved</span>
              <div className="rp-tasks-bar">
                <div className="rp-tasks-bar-fill" style={{ width: `${kpiData.tasksResolvedPct}%` }} />
              </div>
              <span className="rp-tasks-bar-sub">{kpiData.resolvedTasks} of {kpiData.totalTasks} tasks</span>
            </div>
            <div className="rp-results-kpi">
              <span className="rp-results-kpi-value" style={{ color: kpiData.overdueCount > 0 ? '#b23d59' : '#2e7d32' }}>{kpiData.overdueCount}</span>
              <span className="rp-results-kpi-label">{kpiData.overdueCount === 1 ? 'Audit Overdue' : 'Audits Overdue'}</span>
            </div>
          </div>
          <div className="rp-template-summary">
            {templateSummary.map(ts => (
              <div key={ts.template} className="rp-template-summary-card">
                <div className="rp-template-summary-header">
                  <span className="rp-template-summary-name">{ts.template}</span>
                  <span className="rp-template-summary-score">{ts.earned}/{ts.max} — {ts.pct}%</span>
                  <span className="rp-template-summary-count">{ts.count} audits</span>
                </div>
                <div className="rp-template-summary-sections">
                  {ts.sections.map(s => (
                    <div key={s.name} className="rp-template-summary-section">
                      <span className="rp-template-summary-section-name">{s.name}</span>
                      <div className="rp-template-summary-bar">
                        <div className="rp-template-summary-fill" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="rp-template-summary-section-score">{s.earned}/{s.max} — {s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Insights Row: Flop-5 + Critical/Top Stores ── */}
      {!singleStoreMode && (flop5Data.length > 0 || criticalStores.length > 0) && (
        <div className="rp-insights-row">

          {/* Flop-5 */}
          {flop5Data.length > 0 && (
            <div className="rp-insights-card">
              <div className="rp-insights-header">
                <span className="rp-insights-title">Top recurring issues</span>
                <span className="rp-insights-sub">Most frequently failed checkpoints</span>
              </div>
              <div className="rp-flop-list">
                {flop5Data.map((item, i) => (
                  <div key={item.issue} className="rp-flop-row">
                    <span className="rp-flop-rank">{i + 1}</span>
                    <div className="rp-flop-body">
                      <span className="rp-flop-issue">{item.issue}</span>
                      <span className="rp-flop-category">{item.category}</span>
                    </div>
                    <div className="rp-flop-bar-wrap">
                      <div className="rp-flop-bar">
                        <div className="rp-flop-fill" style={{ width: `${Math.round((item.count / flop5Data[0].count) * 100)}%` }} />
                      </div>
                      <span className="rp-flop-count">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical + Top stores side panel */}
          <div className="rp-insights-card rp-insights-card--stores">
            {criticalStores.length > 0 && (
              <>
                <div className="rp-insights-header">
                  <span className="rp-insights-title">Needs attention</span>
                  <span className="rp-insights-sub">Locations scoring below 75%</span>
                </div>
                <div className="rp-store-spotlight-list">
                  {criticalStores.map(s => (
                    <div key={s.storeId} className="rp-store-spotlight-row">
                      <div className="rp-store-spotlight-info">
                        <span className="rp-store-spotlight-name">{s.storeName.split(' - ')[0]}</span>
                        <span className="rp-store-spotlight-area">{s.areaName}</span>
                      </div>
                      <div className="rp-store-spotlight-score-wrap">
                        <div className="rp-store-spotlight-bar">
                          <div className="rp-store-spotlight-fill rp-store-spotlight-fill--critical" style={{ width: `${s.score}%` }} />
                        </div>
                        <span className="rp-store-spotlight-pct rp-store-spotlight-pct--critical">{s.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {topStores.length > 0 && (
              <>
                <div className="rp-insights-header" style={{ marginTop: criticalStores.length > 0 ? '20px' : 0 }}>
                  <span className="rp-insights-title">Top performers</span>
                  <span className="rp-insights-sub">Locations scoring 90%+</span>
                </div>
                <div className="rp-store-spotlight-list">
                  {topStores.map(s => (
                    <div key={s.storeId} className="rp-store-spotlight-row">
                      <div className="rp-store-spotlight-info">
                        <span className="rp-store-spotlight-name">{s.storeName.split(' - ')[0]}</span>
                        <span className="rp-store-spotlight-area">{s.areaName}</span>
                      </div>
                      <div className="rp-store-spotlight-score-wrap">
                        <div className="rp-store-spotlight-bar">
                          <div className="rp-store-spotlight-fill rp-store-spotlight-fill--top" style={{ width: `${s.score}%` }} />
                        </div>
                        <span className="rp-store-spotlight-pct rp-store-spotlight-pct--top">{s.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      )}

      {/* ── Region × Template breakdown ── */}
      {regionTemplateSummary && (
        <div className="rp-insights-card rp-region-matrix-card">
          <div className="rp-insights-header">
            <span className="rp-insights-title">Score by region &amp; audit type</span>
            <span className="rp-insights-sub">Average completed score per area</span>
          </div>
          <table className="rp-region-matrix">
            <thead>
              <tr>
                <th className="rp-matrix-th rp-matrix-th--region" />
                {regionTemplateSummary.colHeaders.map(h => (
                  <th key={h} className="rp-matrix-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regionTemplateSummary.rows.map(row => (
                <tr key={row.areaName}>
                  <td className="rp-matrix-region">{row.areaName}</td>
                  {row.cols.map(col => {
                    const cls = col.score === null ? 'rp-matrix-cell--empty'
                      : col.score >= 85 ? 'rp-matrix-cell--high'
                      : col.score >= 70 ? 'rp-matrix-cell--mid'
                      : 'rp-matrix-cell--low';
                    return (
                      <td key={col.key} className={`rp-matrix-cell ${cls}`}>
                        {col.score !== null ? `${col.score}%` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rp-matrix-legend">
            <span className="rp-matrix-legend-item rp-matrix-legend-item--high">≥ 85%</span>
            <span className="rp-matrix-legend-item rp-matrix-legend-item--mid">70–84%</span>
            <span className="rp-matrix-legend-item rp-matrix-legend-item--low">&lt; 70%</span>
          </div>
        </div>
      )}

      {/* ── Charts (collapsible) ── */}
      <div className="rp-trends-toggle" onClick={() => setTrendsOpen(v => !v)}>
        <svg className={`rp-trends-chevron${trendsOpen ? ' rp-trends-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="rp-trends-toggle-label">Trend charts</span>
      </div>
      {trendsOpen && (
        <>
          <div className="rp-charts-row">
            <div className="rp-chart-card">
              {scoreTrendByAuditData.length > 0 ? (
                <>
                  <div className="rp-chart-header">
                    <div className="rp-chart-title">{role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0 ? 'Score by Area' : 'Score by Store'}</div>
                    <div className="rp-chart-sub">{role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0 ? 'Average score per area by audit' : 'Latest score per store by audit'}</div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={scoreTrendByAuditData} margin={{ top: 8, right: 16, left: -10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                      <XAxis dataKey="store" tick={{ fontSize: 10, fill: '#6b7a85', angle: -45, textAnchor: 'end', dy: 4 } as object} height={72} interval={0} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                      <Tooltip
                        formatter={(v, name, props) => {
                          const earned = props?.payload?.[`${name}_earned`];
                          const max = props?.payload?.[`${name}_max`];
                          const pts = earned != null && max != null ? ` — ${earned}/${max} pts` : '';
                          return [`${v}%${pts}`, name];
                        }}
                        contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                      {templatesToShow.map((template) => {
                        const key = template.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '');
                        const colorIdx = REPORT_TEMPLATES.indexOf(template);
                        return (
                          <Bar key={key} dataKey={key} fill={TEMPLATE_COLORS[colorIdx % TEMPLATE_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={18} cursor="pointer" onClick={(data: unknown) => handleBarClick(data as Record<string, string | number>, template)} />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="rp-chart-empty">No data for the current filters</div>
              )}
            </div>
            <div className="rp-chart-card">
              {templateTrendData.length > 0 ? (
                <>
                  <div className="rp-chart-header">
                    <div className="rp-chart-title">Trend over Time</div>
                    <div className="rp-chart-sub">Average score per audit over time</div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={templateTrendData} margin={{ top: 8, right: 16, left: -10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7a85', angle: -45, textAnchor: 'end', dy: 4 } as object} height={72} interval={0} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                      <Tooltip
                        formatter={(v, name, props) => {
                          const earned = props?.payload?.[`${name}_earned`];
                          const max = props?.payload?.[`${name}_max`];
                          const pts = earned != null && max != null ? ` — ${earned}/${max} pts` : '';
                          return [`${v}%${pts}`, name];
                        }}
                        labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate ?? _label}
                        contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }}
                      />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                      {templatesToShow.map((t, i) => {
                        const key = t.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', '');
                        return (
                          <Line key={key} type="monotone" dataKey={key} stroke={TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]} strokeWidth={2} dot={{ r: 4, fill: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length] }} activeDot={{ r: 6 }} connectNulls={true} />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="rp-chart-empty">No trend data for the current filters</div>
              )}
            </div>
          </div>
          {groupTrendData.length > 0 && (
            <div className="rp-charts-row rp-charts-row--single">
              <div className="rp-chart-card">
                <div className="rp-chart-header">
                  <div className="rp-chart-title">Score Trend by Group</div>
                  <div className="rp-chart-sub">{role === 'hq' && !selectedAreaId && selectedStoreIds.length === 0 ? 'Average score per area over time' : 'Score per store over time'}</div>
                </div>
                {groupTrendLines.length <= 8 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={groupTrendData} margin={{ top: 8, right: 16, left: -10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7a85', angle: -45, textAnchor: 'end', dy: 4 } as object} height={72} interval={0} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                      <Tooltip formatter={(v, name, props) => { const earned = props?.payload?.[`${name}_earned`]; const max = props?.payload?.[`${name}_max`]; const pts = earned != null && max != null ? ` — ${earned}/${max} pts` : ''; return [`${v}%${pts}`, name]; }} labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate ?? _label} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }} />
                      <Legend content={renderGroupLegend} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                      {groupTrendLines.map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={AREA_LINE_COLORS[i % AREA_LINE_COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: AREA_LINE_COLORS[i % AREA_LINE_COLORS.length] }} activeDot={{ r: 5 }} connectNulls={true} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="rp-chart-empty" style={{ padding: '24px 0' }}>
                    Too many groups to display as a line chart ({groupTrendLines.length}). Use the table below to explore scores and trends.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Store Overview Table ── */}
      {showDefaultAreaTable && (
        <div className="rp-table-card">
          <div className="rp-table-header">
            <div className="rp-table-title">Overview — latest scores</div>
            <div className="rp-table-count">{filteredStores.length} locations</div>
          </div>
          <div className="rp-col-headers">
            <div className="rp-col-expand" />
            <div className="rp-col-store">Location</div>
            <div className="rp-col-auditor">Auditor</div>
            <div className="rp-col-date">Last audit</div>
            <div className="rp-col-score">Score</div>
            <div className="rp-col-status">Status</div>
            <div className="rp-col-tasks">Tasks</div>
          </div>
          {filteredStores.flatMap(store => {
            const noFilter = selectedStatuses.length === 0;
            const effectiveStatus = (r: StoreAuditResult) => r.isOverdue ? 'overdue' : r.status;
            const rows: React.ReactNode[] = [];
            const completedResult = latestResultPerStore[store.id];
            if (completedResult && (noFilter || selectedStatuses.includes(effectiveStatus(completedResult)))) {
              rows.push(
                <StoreRow
                  key={store.id} result={completedResult}
                  storeName={store.name} areaName={store.areaName}
                />
              );
            }
            const pending = nonCompletedResultsPerStore[store.id] ?? [];
            pending.forEach(r => {
              if (!noFilter && !selectedStatuses.includes(effectiveStatus(r))) return;
              const audit = REPORT_AUDITS.find(a => a.id === r.auditId);
              const auditLabel = audit ? `${audit.name}` : '';
              rows.push(
                <div key={`${store.id}-${r.auditId}`} className="rp-store-block">
                  <div className="rp-store-row rp-store-row--no-result">
                    <div className="rp-chevron-placeholder" />
                    <div className="rp-store-info">
                      <div className="rp-store-name">{store.name}</div>
                      <div className="rp-store-area">{auditLabel}</div>
                    </div>
                    <div className="rp-store-auditor">{r.auditor}</div>
                    <div className="rp-store-date">{r.dueDate ? fullDate(r.dueDate) : '—'}</div>
                    <div className="rp-store-score-cell"><span className="rp-score-absolute">—</span></div>
                    <div className="rp-store-status">
                      <span className={`rp-status-badge ${r.isOverdue ? 'rp-status--overdue' : statusClass(r.status)}`}>
                        {r.isOverdue ? 'Overdue' : statusLabel(r.status)}
                      </span>
                    </div>
                    <div className="rp-store-tasks" />
                  </div>
                </div>
              );
            });
            if (rows.length === 0 && noFilter) {
              rows.push(
                <div key={store.id} className="rp-store-block">
                  <div className="rp-store-row rp-store-row--no-result">
                    <div className="rp-chevron-placeholder" />
                    <div className="rp-store-info">
                      <div className="rp-store-name">{store.name}</div>
                      <div className="rp-store-area">{store.areaName}</div>
                    </div>
                    <div className="rp-store-auditor">—</div>
                    <div className="rp-store-date">—</div>
                    <div className="rp-store-score-cell"><span className="rp-score-absolute">—</span></div>
                    <div className="rp-store-status"><span className="rp-status-badge rp-status--pending">Not Started</span></div>
                    <div className="rp-store-tasks" />
                  </div>
                </div>
              );
            }
            return rows;
          })}
        </div>
      )}

      {/* ── Drill-down Tables ── */}

      {/* Area selected → audit history for stores in that area */}
      {showAreaHistory && (
        <div className="rp-table-card">
          <div className="rp-table-header">
            <div className="rp-table-title">{visibleAreas.find(a => a.id === selectedAreaId)?.name ?? 'Area'} — audit history</div>
            <div className="rp-table-count">{areaHistoryData.length} completed audit{areaHistoryData.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="rp-col-headers">
            <div className="rp-col-expand" />
            <div className="rp-col-store">Store / Audit</div>
            <div className="rp-col-auditor">Auditor</div>
            <div className="rp-col-date">Completed</div>
            <div className="rp-col-score">Score</div>
            <div className="rp-col-status">Status</div>
            <div className="rp-col-tasks">Tasks</div>
          </div>
          {areaHistoryData.map(h => (
            <StoreHistoryRow
              key={`${h.result.storeId}-${h.result.auditId}`}
              auditName={h.storeName.split(' - ')[0]}
              templateName={h.auditName}
              date={h.result.date}
              score={h.result.overallScore}
              status={h.result.status}
              result={h.result}
            />
          ))}
        </div>
      )}

      {/* Default: Store role → audit history */}
      {showDefaultStoreHistory && (
        <div className="rp-table-card">
          <div className="rp-table-header">
            <div className="rp-table-title">{role === 'store' ? 'Your audit history' : `${focusedStore?.name ?? 'Store'} — audit history`}</div>
            <div className="rp-table-count">{storeHistoryData.length} completed audit{storeHistoryData.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="rp-col-headers">
            <div className="rp-col-expand" />
            <div className="rp-col-store">Audit / Template</div>
            <div className="rp-col-auditor">Auditor</div>
            <div className="rp-col-date">Completed</div>
            <div className="rp-col-score">Score</div>
            <div className="rp-col-status">Status</div>
            <div className="rp-col-tasks">Tasks</div>
          </div>
          {storeHistoryData.map(h => (
            <StoreHistoryRow
              key={h.result.auditId}
              auditName={h.auditName} templateName={h.templateName}
              date={h.result.date} score={h.result.overallScore}
              status={h.result.status} result={h.result}
            />
          ))}
        </div>
      )}


      {/* Date filter modal */}
      {dateModalOpen && (
        <DateFilterModal
          initialFrom={dateFrom}
          initialTo={dateTo}
          initialLabel={dateLabel}
          onApply={(from, to, label) => { setDateFrom(from); setDateTo(to); setDateLabel(label); setDateModalOpen(false); }}
          onCancel={() => setDateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ReportingDashboard;
