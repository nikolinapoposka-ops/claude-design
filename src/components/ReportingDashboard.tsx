import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
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

function scoreColor(score: number): string {
  if (score >= 85) return '#2e7d32';
  if (score >= 70) return '#e65100';
  return '#b23d59';
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

// ─── Sub-components ────────────────────────────────────────────────────────────

const KPITile: React.FC<{
  label: string; value: string | number; sub?: string;
  trend?: number; accent?: 'pass' | 'risk' | 'fail' | 'neutral'; icon: React.ReactNode;
}> = ({ label, value, sub, trend, accent = 'neutral', icon }) => (
  <div className="rp-kpi-tile">
    <div className="rp-kpi-icon">{icon}</div>
    <div className="rp-kpi-body">
      <div className={`rp-kpi-value rp-kpi-value--${accent}`}>{value}</div>
      <div className="rp-kpi-label">{label}</div>
      {sub && <div className="rp-kpi-sub">{sub}</div>}
    </div>
    {trend !== undefined && (
      <div className={`rp-kpi-trend ${trend >= 0 ? 'rp-kpi-trend--up' : 'rp-kpi-trend--down'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const ScoreBar: React.FC<{ score: number; showLabel?: boolean }> = ({ score, showLabel = true }) => (
  <div className="rp-score-bar-wrap">
    <div className="rp-score-bar">
      <div className="rp-score-fill" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
    </div>
    {showLabel && <span className="rp-score-label" style={{ color: scoreColor(score) }}>{score}%</span>}
  </div>
);

const QuestionRow: React.FC<{ question: StoreAuditResult['sections'][0]['questions'][0]; index: number }> = ({ question, index }) => (
  <div className={`rp-question-row ${question.followUpTask ? 'rp-question-row--has-task' : ''}`}>
    <div className="rp-question-num">{index + 1}</div>
    <div className="rp-question-text">{question.text}</div>
    <div className="rp-question-answer">
      {question.isNA ? (
        <span className="rp-answer-badge rp-answer-badge--na">N/A</span>
      ) : (
        <span className={`rp-answer-badge rp-answer-badge--${question.answer === 'Yes' ? 'yes' : question.answer === 'Partially' ? 'partial' : 'no'}`}>
          {question.answer}
        </span>
      )}
    </div>
    <div className="rp-question-score">
      {question.isNA ? '—' : `${question.scoreValue}/${question.maxScore}`}
    </div>
    {question.followUpTask && (
      <div className="rp-question-task">
        <span className="rp-task-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Follow-up
        </span>
        <span className="rp-task-text">{question.followUpTask}</span>
      </div>
    )}
  </div>
);

const SectionAccordion: React.FC<{ section: SectionResult; storeId: string }> = ({ section }) => {
  const [open, setOpen] = useState(false);
  const taskCount = section.questions.filter(q => q.followUpTask).length;
  return (
    <div className="rp-section-accordion">
      <div className="rp-section-row" onClick={() => setOpen(v => !v)}>
        <svg className={`rp-chevron ${open ? 'rp-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="rp-section-name">{section.name}</span>
        <div className="rp-section-score-wrap"><ScoreBar score={section.score} /></div>
        {taskCount > 0 && <span className="rp-task-count">{taskCount} task{taskCount > 1 ? 's' : ''}</span>}
      </div>
      {open && (
        <div className="rp-questions-body">
          <div className="rp-questions-header">
            <span className="rp-qh-num">#</span><span className="rp-qh-text">Question</span>
            <span className="rp-qh-answer">Answer</span><span className="rp-qh-score">Score</span>
          </div>
          {section.questions.map((q, i) => <QuestionRow key={q.id} question={q} index={i} />)}
        </div>
      )}
    </div>
  );
};

// Full store drill-down row (used when a specific audit is selected)
const StoreRow: React.FC<{
  result: StoreAuditResult; storeName: string; areaName: string;
  comparisonResult?: StoreAuditResult; comparisonAuditName?: string; primaryAuditName?: string;
}> = ({ result, storeName, areaName, comparisonResult, comparisonAuditName, primaryAuditName }) => {
  const [open, setOpen] = useState(false);
  const taskCount = result.sections.flatMap(s => s.questions).filter(q => q.followUpTask).length;
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
          {comparisonResult ? (
            <div className="rp-comparison-scores">
              <div className="rp-comparison-score">
                <div className="rp-comparison-label">{primaryAuditName}</div>
                <ScoreBar score={result.overallScore} />
              </div>
              <div className="rp-comparison-score">
                <div className="rp-comparison-label">{comparisonAuditName}</div>
                <ScoreBar score={comparisonResult.overallScore} />
              </div>
            </div>
          ) : (
            <ScoreBar score={result.overallScore} />
          )}
        </div>
        <div className="rp-store-status">
          <span className={`rp-status-badge ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
        </div>
        {taskCount > 0 && (
          <div className="rp-store-tasks">
            <span className="rp-followup-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              {taskCount}
            </span>
          </div>
        )}
      </div>
      {open && (
        <div className="rp-store-expanded">
          <div className="rp-sections-label">Section breakdown</div>
          {result.sections.map(section => (
            <SectionAccordion key={section.name} section={section} storeId={result.storeId} />
          ))}
        </div>
      )}
    </div>
  );
};

// Area row — used in HQ default view
const AreaRow: React.FC<{
  areaName: string; avgScore: number; storeCount: number;
  completedCount: number; taskCount: number;
  stores: Array<{ id: string; name: string; score: number; date: string; auditor: string; status: string }>;
}> = ({ areaName, avgScore, storeCount, completedCount, taskCount, stores }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rp-store-block ${open ? 'rp-store-block--open' : ''}`}>
      <div className="rp-store-row" onClick={() => setOpen(v => !v)}>
        <svg className={`rp-chevron ${open ? 'rp-chevron--open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="rp-store-info">
          <div className="rp-store-name">{areaName}</div>
          <div className="rp-store-area">{storeCount} stores · {completedCount} completed</div>
        </div>
        <div className="rp-store-auditor">—</div>
        <div className="rp-store-date">—</div>
        <div className="rp-store-score-cell"><ScoreBar score={avgScore} /></div>
        <div className="rp-store-status">
          <span className="rp-status-badge rp-status--done">{completedCount}/{storeCount}</span>
        </div>
        {taskCount > 0 && (
          <div className="rp-store-tasks">
            <span className="rp-followup-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              {taskCount}
            </span>
          </div>
        )}
      </div>
      {open && (
        <div className="rp-store-expanded">
          <div className="rp-sections-label">Stores in this area — latest scores</div>
          {stores.map(store => (
            <div key={store.id} className="rp-area-store-row">
              <div className="rp-area-store-name">{store.name}</div>
              <div className="rp-area-store-auditor">{store.auditor}</div>
              <div className="rp-area-store-date">{store.date || '—'}</div>
              <div className="rp-area-store-score"><ScoreBar score={store.score} /></div>
              <span className={`rp-status-badge ${statusClass(store.status)}`}>{statusLabel(store.status)}</span>
            </div>
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
  const taskCount = result.sections.flatMap(s => s.questions).filter(q => q.followUpTask).length;
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
        <div className="rp-store-score-cell"><ScoreBar score={score} /></div>
        <div className="rp-store-status">
          <span className={`rp-status-badge ${statusClass(status)}`}>{statusLabel(status)}</span>
        </div>
        {taskCount > 0 && (
          <div className="rp-store-tasks">
            <span className="rp-followup-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              {taskCount}
            </span>
          </div>
        )}
      </div>
      {open && (
        <div className="rp-store-expanded">
          <div className="rp-sections-label">Section breakdown</div>
          {result.sections.map(section => (
            <SectionAccordion key={section.name} section={section} storeId={result.storeId} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const ReportingDashboard: React.FC = () => {
  const { role } = useRole();

  // ── Filter state ──
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedAuditId, setSelectedAuditId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareAuditId, setCompareAuditId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
  const availableAudits = useMemo(() =>
    selectedTemplateId ? REPORT_AUDITS.filter(a => a.templateId === selectedTemplateId) : [],
    [selectedTemplateId]
  );

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    setSelectedAuditId('');
    setCompareAuditId('');
  };

  const handleAreaChange = (id: string) => {
    setSelectedAreaId(id);
    setSelectedStoreId('');
  };

  // ── Filtered stores ──
  const filteredStores = useMemo(() => {
    let stores = visibleStores;
    if (selectedAreaId) stores = stores.filter(s => s.areaId === selectedAreaId);
    if (selectedStoreId) stores = stores.filter(s => s.id === selectedStoreId);
    return stores;
  }, [visibleStores, selectedAreaId, selectedStoreId]);

  // Stores available in the store dropdown (cascades from area, before store selection)
  const availableStoresForFilter = useMemo(() => {
    let stores = visibleStores;
    if (selectedAreaId) stores = stores.filter(s => s.areaId === selectedAreaId);
    return stores;
  }, [visibleStores, selectedAreaId]);

  // Single-store mode: a specific store is focused (either via filter or Store role)
  const singleStoreMode = !!selectedStoreId || role === 'store';
  const focusedStore = selectedStoreId
    ? REPORT_STORES.find(s => s.id === selectedStoreId)
    : role === 'store' ? filteredStores[0] : undefined;

  const filteredStoreIds = useMemo(() => new Set(filteredStores.map(s => s.id)), [filteredStores]);

  // ── All visible results (used for default state) ──
  const allVisibleResults = useMemo(() =>
    STORE_AUDIT_RESULTS.filter(r => filteredStoreIds.has(r.storeId)),
    [filteredStoreIds]
  );

  // Latest completed result per store
  const latestResultPerStore = useMemo(() => {
    const map: Record<string, StoreAuditResult> = {};
    [...allVisibleResults]
      .filter(r => r.status === 'done')
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(r => { if (!map[r.storeId]) map[r.storeId] = r; });
    return map;
  }, [allVisibleResults]);

  // ── Template-filtered results ──
  const templateResults = useMemo((): StoreAuditResult[] => {
    if (!selectedTemplateId) return [];
    const auditIds = new Set(availableAudits.map(a => a.id));
    return STORE_AUDIT_RESULTS.filter(r => auditIds.has(r.auditId) && filteredStoreIds.has(r.storeId));
  }, [selectedTemplateId, availableAudits, filteredStoreIds]);

  // ── Audit-specific results ──
  const primaryResults = useMemo((): StoreAuditResult[] => {
    if (!selectedAuditId) return [];
    return STORE_AUDIT_RESULTS.filter(r => r.auditId === selectedAuditId && filteredStoreIds.has(r.storeId));
  }, [selectedAuditId, filteredStoreIds]);

  const compareResults = useMemo((): StoreAuditResult[] => {
    if (!comparisonMode || !compareAuditId) return [];
    return STORE_AUDIT_RESULTS.filter(r => r.auditId === compareAuditId && filteredStoreIds.has(r.storeId));
  }, [comparisonMode, compareAuditId, filteredStoreIds]);

  const compareResultMap = useMemo(() => {
    const map: Record<string, StoreAuditResult> = {};
    compareResults.forEach(r => { map[r.storeId] = r; });
    return map;
  }, [compareResults]);

  // ── Chart data ──

  // Default: cross-template comparison (one bar per template)
  const templateComparisonData = useMemo(() => {
    return REPORT_TEMPLATES.map(template => {
      const auditIds = new Set(REPORT_AUDITS.filter(a => a.templateId === template.id).map(a => a.id));
      const results = allVisibleResults.filter(r => auditIds.has(r.auditId) && r.status === 'done');
      return {
        name: template.name.replace(' Standard', '').replace(' Audit', '').replace(' Review', ''),
        avgScore: avg(results.map(r => r.overallScore)),
        count: results.length,
      };
    }).filter(t => t.count > 0);
  }, [allVisibleResults]);

  // When template selected: trend per audit instance
  const trendData = useMemo(() =>
    availableAudits.map(audit => {
      const results = templateResults.filter(r => r.auditId === audit.id);
      return {
        name: audit.name.replace('Safety Audit ', '').replace('Ops Review ', '').replace('VM Audit ', ''),
        avgScore: avg(results.map(r => r.overallScore)),
      };
    }),
    [availableAudits, templateResults]
  );

  // Section breakdown
  const sectionData = useMemo(() => {
    const results = selectedAuditId ? primaryResults : templateResults;
    if (!results.length) return [];
    const map: Record<string, number[]> = {};
    results.forEach(r => r.sections.forEach(s => {
      if (!map[s.name]) map[s.name] = [];
      map[s.name].push(s.score);
    }));
    return Object.entries(map).map(([name, scores]) => ({ name, avgScore: avg(scores) }));
  }, [selectedAuditId, primaryResults, templateResults]);

  // Single-store (Store role or HQ/AM with store filter): historical trend line
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
        chartName: (REPORT_AUDITS.find(a => a.id === r.auditId)?.name ?? '')
          .replace('Safety Audit ', '').replace('Ops Review ', '').replace('VM Audit ', ''),
      }));
  }, [singleStoreMode, focusedStore, allVisibleResults]);

  // HQ/AM default: area table rows
  const areaTableData = useMemo(() => {
    return visibleAreas.map(area => {
      const areaStores = filteredStores.filter(s => s.areaId === area.id);
      const storeResults = areaStores
        .map(s => ({ store: s, result: latestResultPerStore[s.id] }))
        .filter(x => x.result);
      const taskCount = storeResults.flatMap(x => x.result.sections.flatMap(s => s.questions)).filter(q => q.followUpTask).length;
      return {
        areaId: area.id,
        areaName: area.name,
        storeCount: areaStores.length,
        completedCount: storeResults.length,
        avgScore: avg(storeResults.map(x => x.result.overallScore)),
        taskCount,
        stores: storeResults.map(x => ({
          id: x.store.id,
          name: x.store.name,
          score: x.result.overallScore,
          date: x.result.date,
          auditor: x.result.auditor,
          status: x.result.status,
        })),
      };
    }).filter(a => a.storeCount > 0);
  }, [visibleAreas, filteredStores, latestResultPerStore]);

  // ── KPIs ──
  const isDefault = !selectedTemplateId;
  const kpiResults = isDefault
    ? Object.values(latestResultPerStore)
    : selectedAuditId ? primaryResults : templateResults;

  const avgScore = avg(kpiResults.map(r => r.overallScore));
  const completedCount = kpiResults.filter(r => r.status === 'done').length;
  const totalCount = filteredStores.length;
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const followUpCount = kpiResults.flatMap(r => r.sections.flatMap(s => s.questions)).filter(q => q.followUpTask).length;
  const atRiskCount = kpiResults.filter(r => r.overallScore < 75).length;

  // Previous period trend
  const prevAuditIdx = selectedAuditId
    ? availableAudits.findIndex(a => a.id === selectedAuditId) - 1 : -1;
  const prevResults = prevAuditIdx >= 0
    ? STORE_AUDIT_RESULTS.filter(r => r.auditId === availableAudits[prevAuditIdx].id && filteredStoreIds.has(r.storeId)) : [];
  const scoreTrend = prevResults.length > 0 ? avgScore - avg(prevResults.map(r => r.overallScore)) : undefined;

  const primaryAudit = REPORT_AUDITS.find(a => a.id === selectedAuditId);
  const compareAudit = REPORT_AUDITS.find(a => a.id === compareAuditId);

  // ── What to render ──
  const showDefaultAreaTable  = isDefault && !singleStoreMode;
  const showDefaultStoreHistory = isDefault && singleStoreMode;
  const showTemplateTable     = !isDefault && !!selectedAuditId;
  const showTemplateHint      = !isDefault && !selectedAuditId;

  return (
    <div className="rp-root">
      {/* ── Header ── */}
      <div className="rp-header">
        <div className="rp-header-left">
          <h1 className="rp-title">Store Audits Reporting</h1>
          <span className="rp-role-tag">
            {role === 'hq' ? 'HQ — All Stores' : role === 'areaManager' ? 'Area Manager — West Coast' : 'Store Manager — San Francisco'}
          </span>
        </div>
        <div className="rp-header-right">
          <label className="rp-comparison-toggle">
            <span>Comparison mode</span>
            <span className="toggle-switch">
              <input type="checkbox" checked={comparisonMode} onChange={e => { setComparisonMode(e.target.checked); if (!e.target.checked) setCompareAuditId(''); }} />
              <span className="toggle-slider" />
            </span>
          </label>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="rp-filter-bar">
        <div className="rp-filter-group">
          <label className="rp-filter-label">Date from</label>
          <input className="rp-filter-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="rp-filter-group">
          <label className="rp-filter-label">Date to</label>
          <input className="rp-filter-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="rp-filter-sep" />
        <div className="rp-filter-group">
          <label className="rp-filter-label">
            Area
            {areaLocked && (
              <span title="Locked by your role" style={{ display: 'inline-flex', marginLeft: 4 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
            )}
          </label>
          <select className="rp-filter-select" value={selectedAreaId} onChange={e => handleAreaChange(e.target.value)} disabled={areaLocked || storeLocked}>
            {!areaLocked && <option value="">All areas</option>}
            {visibleAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        {!storeLocked && (
          <div className="rp-filter-group">
            <label className="rp-filter-label">Store</label>
            <select
              className="rp-filter-select"
              value={selectedStoreId}
              onChange={e => setSelectedStoreId(e.target.value)}
            >
              <option value="">All stores</option>
              {availableStoresForFilter.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="rp-filter-sep" />
        <div className="rp-filter-group">
          <label className="rp-filter-label">Audit template</label>
          <select className="rp-filter-select" value={selectedTemplateId} onChange={e => handleTemplateChange(e.target.value)}>
            <option value="">All templates</option>
            {REPORT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="rp-filter-group">
          <label className="rp-filter-label">Specific audit</label>
          <select className="rp-filter-select" value={selectedAuditId} onChange={e => setSelectedAuditId(e.target.value)} disabled={!selectedTemplateId}>
            <option value="">{selectedTemplateId ? 'All audits from template' : 'Select template first'}</option>
            {availableAudits.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        {comparisonMode && (
          <div className="rp-filter-group">
            <label className="rp-filter-label rp-filter-label--compare">Compare with</label>
            <select className="rp-filter-select rp-filter-select--compare" value={compareAuditId} onChange={e => setCompareAuditId(e.target.value)} disabled={!selectedTemplateId}>
              <option value="">Select audit to compare</option>
              {availableAudits.filter(a => a.id !== selectedAuditId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── KPI Tiles — always visible ── */}
      <div className="rp-kpi-row">
        <KPITile
          label="Average Score" value={avgScore > 0 ? `${avgScore}%` : '—'}
          sub={isDefault ? 'Latest score per store' : selectedAuditId ? primaryAudit?.name : 'Across all audits'}
          trend={scoreTrend}
          accent={avgScore >= 85 ? 'pass' : avgScore >= 70 ? 'risk' : 'fail'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
        />
        <KPITile
          label="Completion Rate" value={`${completionRate}%`}
          sub={`${completedCount} of ${totalCount} stores`}
          accent={completionRate >= 80 ? 'pass' : completionRate >= 60 ? 'risk' : 'fail'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>}
        />
        <KPITile
          label="Open Follow-up Tasks" value={followUpCount}
          sub="Across visible stores"
          accent={followUpCount === 0 ? 'pass' : followUpCount < 10 ? 'risk' : 'fail'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>}
        />
        <KPITile
          label="Stores at Risk" value={atRiskCount}
          sub="Score below 75%"
          accent={atRiskCount === 0 ? 'pass' : atRiskCount <= 2 ? 'risk' : 'fail'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
        />
      </div>

      {/* ── Charts ── */}
      <div className="rp-charts-row">
        {/* Left chart: default = template comparison, with template = trend over audits */}
        <div className="rp-chart-card">
          {isDefault ? (
            <>
              <div className="rp-chart-header">
                <div className="rp-chart-title">Performance by template</div>
                <div className="rp-chart-sub">Average score across all audits per template</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={templateComparisonData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a85' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Avg Score'] as [string, string]} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }} />
                  <Bar dataKey="avgScore" fill="#1565c0" radius={[3, 3, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : trendData.length > 1 ? (
            <>
              <div className="rp-chart-header">
                <div className="rp-chart-title">Score trend</div>
                <div className="rp-chart-sub">Avg score per audit — {REPORT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a85' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Avg Score'] as [string, string]} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }} />
                  <Bar dataKey="avgScore" fill="#1565c0" radius={[3, 3, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="rp-chart-empty">Select a template to see the score trend</div>
          )}
        </div>

        {/* Right chart: store role = personal trend line, others = section breakdown */}
        <div className="rp-chart-card">
          {singleStoreMode && isDefault ? (
            <>
              <div className="rp-chart-header">
                <div className="rp-chart-title">{role === 'store' ? 'Your score history' : 'Store score history'}</div>
                <div className="rp-chart-sub">{focusedStore?.name ?? 'Selected store'} · all completed audits</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={storeHistoryData.map(h => ({ name: h.chartName, score: h.result.overallScore }))} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7a85' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Score'] as [string, string]} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }} />
                  <Line type="monotone" dataKey="score" stroke="#2e7d32" strokeWidth={2} dot={{ r: 4, fill: '#2e7d32' }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : sectionData.length > 0 ? (
            <>
              <div className="rp-chart-header">
                <div className="rp-chart-title">Section breakdown</div>
                <div className="rp-chart-sub">Average score per section across filtered stores</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionData} layout="vertical" margin={{ top: 8, right: 40, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7a85' }} unit="%" />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#6b7a85' }} />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Avg Score'] as [string, string]} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e0e5ea' }} />
                  <Bar dataKey="avgScore" fill="#2e7d32" radius={[0, 3, 3, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="rp-chart-empty">Select a template to see section breakdown</div>
          )}
        </div>
      </div>

      {/* ── Table ── */}

      {/* Default: HQ / Area Manager → area rows */}
      {showDefaultAreaTable && (
        <div className="rp-table-card">
          <div className="rp-table-header">
            <div className="rp-table-title">
              {role === 'hq' ? 'Performance by area — latest scores' : 'Store overview — latest scores'}
            </div>
            <div className="rp-table-count">
              {role === 'hq' ? `${areaTableData.length} areas` : `${filteredStores.length} stores`}
            </div>
          </div>
          <div className="rp-col-headers">
            <div className="rp-col-expand" />
            <div className="rp-col-store">{role === 'hq' ? 'Area' : 'Store'}</div>
            <div className="rp-col-auditor">Auditor</div>
            <div className="rp-col-date">Last audit</div>
            <div className="rp-col-score">Avg score</div>
            <div className="rp-col-status">Completed</div>
            <div className="rp-col-tasks">Tasks</div>
          </div>
          {role === 'hq' ? (
            areaTableData.map(area => (
              <AreaRow key={area.areaId} {...area} />
            ))
          ) : (
            filteredStores.map(store => {
              const result = latestResultPerStore[store.id];
              if (!result) return null;
              return (
                <StoreRow
                  key={store.id} result={result}
                  storeName={store.name} areaName={store.areaName}
                />
              );
            })
          )}
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

      {/* Template → specific audit selected → store results */}
      {showTemplateTable && (
        <div className="rp-table-card">
          <div className="rp-table-header">
            <div className="rp-table-title">
              {comparisonMode && compareAuditId
                ? `Comparing: ${primaryAudit?.name} vs ${compareAudit?.name}`
                : primaryAudit?.name ?? 'Store Results'}
            </div>
            <div className="rp-table-count">{primaryResults.length} store{primaryResults.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="rp-col-headers">
            <div className="rp-col-expand" />
            <div className="rp-col-store">Store / Area</div>
            <div className="rp-col-auditor">Auditor</div>
            <div className="rp-col-date">Completed</div>
            <div className="rp-col-score">Score</div>
            <div className="rp-col-status">Status</div>
            <div className="rp-col-tasks">Tasks</div>
          </div>
          {[...primaryResults]
            .sort((a, b) => b.overallScore - a.overallScore)
            .map(result => {
              const store = REPORT_STORES.find(s => s.id === result.storeId);
              return (
                <StoreRow
                  key={result.storeId} result={result}
                  storeName={store?.name ?? result.storeId} areaName={store?.areaName ?? ''}
                  comparisonResult={compareResultMap[result.storeId]}
                  primaryAuditName={primaryAudit?.name} comparisonAuditName={compareAudit?.name}
                />
              );
            })}
        </div>
      )}

      {/* Template selected but no specific audit → hint */}
      {showTemplateHint && (
        <div className="rp-empty rp-empty--inline">
          <p className="rp-empty-title">Showing trend for {REPORT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</p>
          <p className="rp-empty-sub">Select a specific audit above to see store-level results</p>
        </div>
      )}
    </div>
  );
};

export default ReportingDashboard;
