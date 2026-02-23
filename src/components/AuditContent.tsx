import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Globe, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import SegmentedControls from './SegmentedControls';
import AuditCard from './AuditCard';
import TemplateCard from './TemplateCard';
import type { Template } from './TemplateCard';
import type { AuditInstance } from '../App';
import { useRole, AREA_MANAGER_AUDITOR_ID, STORE_NAME } from '../context/RoleContext';

const sampleAuditCards = [
  {
    id: 1,
    title: 'Monthly safety audit plus another line',
    store: 'Store 011',
    statusLabel: 'Not started',
    startDate: 'Jul 20, 2024',
    dueDate: 'Jul 30, 2024',
    category: 'Security',
    bookmarked: true,
  },
  {
    id: 2,
    title: 'Monthly safety audit plus..',
    store: 'Store 011',
    statusLabel: 'Not started',
    auditor: { name: 'Anna Bok', initials: 'AB' },
    startDate: 'Jul 20, 2024',
    dueDate: 'Jul 30, 2024',
    category: 'Security',
    bookmarked: true,
  },
  {
    id: 3,
    title: 'Monthly safety audit plus another line',
    store: 'Store 011',
    statusLabel: 'Not started',
    startDate: 'Jul 20, 2024',
    dueDate: 'Jul 30, 2024',
    category: 'Security',
    bookmarked: true,
  },
  {
    id: 4,
    title: 'Monthly safety audit plus..',
    progress: {
      total: 3,
      fraction: '1/3',
      percentage: 33,
      auditors: [{ initials: 'AB', name: 'Alice Brown' }, { initials: 'JD', name: 'James Doe' }],
      moreCount: 20,
    },
    startDate: 'Jul 20, 2024',
    dueDate: 'Jul 30, 2024',
    category: 'Security',
    bookmarked: true,
  },
  {
    id: 5,
    title: 'Monthly safety audit plus another line',
    store: 'Store 011',
    statusLabel: 'Not started',
    startDate: 'Jul 20, 2024',
    dueDate: 'Jul 30, 2024',
    category: 'Security',
    bookmarked: true,
  },
];

const chevronIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export type CollectionFilter = 'library' | 'drafts' | 'archived';
export type AuditCollectionFilter = 'overview' | 'assigned-to-me' | 'awaiting-approval' | 'done' | 'sent' | 'scheduled' | 'audit-drafts' | 'all';

const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatScheduledDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
  return `${date}, ${time}`; // "Feb 25, 09:00"
};

const formatCardDate = (dateStr: string) => {
  if (!dateStr) return today;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return today;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Returns a version of the instance scoped to only the AM's assigned stores/auditor
const projectForAM = (inst: AuditInstance): AuditInstance => {
  if (inst.audience !== 'auditors' || !inst.auditorAssignments) return inst;
  const amAssignment = inst.auditorAssignments.find((a) => a.auditor.id === AREA_MANAGER_AUDITOR_ID);
  if (!amAssignment) return inst;
  return { ...inst, stores: amAssignment.stores, auditors: [amAssignment.auditor], completedCount: 0 };
};

const toAuditCardProps = (inst: AuditInstance) => {
  const base = {
    id: inst.id,
    title: inst.title,
    startDate: inst.startDate ? formatCardDate(inst.startDate) : undefined,
    dueDate: inst.dueDate || undefined,
    category: inst.category,
  };

  if (inst.status === 'draft') {
    return { ...base, statusLabel: 'Draft' };
  }

  if (inst.status === 'scheduled') {
    const scheduledDate = formatScheduledDate(inst.sendOutDate);
    const storeCount = inst.stores.length;
    const auditorCount = inst.auditors.length;
    if (inst.audience === 'stores' && storeCount <= 1) {
      return { ...base, store: inst.stores[0] ?? '—', scheduledDate };
    }
    if (inst.audience === 'auditors' && auditorCount === 1 && storeCount <= 1) {
      return { ...base, store: inst.stores[0] ?? '—', auditor: inst.auditors[0], scheduledDate };
    }
    return { ...base, scheduledDate };
  }

  const storeCount = inst.stores.length;
  const auditorCount = inst.auditors.length;

  if (inst.audience === 'stores') {
    if (storeCount <= 1) {
      return { ...base, store: inst.stores[0] ?? '—', statusLabel: 'Not started' };
    }
    return {
      ...base,
      progress: {
        total: storeCount,
        fraction: `${inst.completedCount}/${storeCount}`,
        percentage: Math.round((inst.completedCount / storeCount) * 100),
      },
    };
  }

  if (inst.audience === 'auditors') {
    if (auditorCount === 1 && storeCount <= 1) {
      return { ...base, store: inst.stores[0] ?? '—', statusLabel: 'Not started', auditor: inst.auditors[0] };
    }
    if (auditorCount === 1) {
      return {
        ...base,
        progress: {
          total: storeCount,
          fraction: `${inst.completedCount}/${storeCount}`,
          percentage: Math.round((inst.completedCount / storeCount) * 100),
        },
        auditor: inst.auditors[0],
      };
    }
    return {
      ...base,
      progress: {
        total: storeCount,
        fraction: `${inst.completedCount}/${storeCount}`,
        percentage: Math.round((inst.completedCount / storeCount) * 100),
        auditors: inst.auditors,
      },
    };
  }

  return { ...base, statusLabel: 'Not started' };
};

const collectionItems: { key: CollectionFilter; label: string }[] = [
  { key: 'library', label: 'Template library' },
  { key: 'drafts', label: 'Template drafts' },
  { key: 'archived', label: 'Archived' },
];

const auditCollectionItems: { key: AuditCollectionFilter; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'assigned-to-me', label: 'Assigned to me' },
  { key: 'awaiting-approval', label: 'Awaiting my approval' },
  { key: 'done', label: 'Done' },
  { key: 'sent', label: 'Sent' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'audit-drafts', label: 'Audit drafts' },
  { key: 'all', label: 'All' },
];

type SortKey = 'due-date' | 'priority' | 'completion' | 'alphabetical' | 'date-created' | 'category';

interface AuditFilters {
  statuses: string[];
  priority: boolean;
  expired: boolean;
  categories: string[];
  auditTypes: ('self-audit' | 'auditor-led')[];
}
const EMPTY_AUDIT_FILTERS: AuditFilters = { statuses: [], priority: false, expired: false, categories: [], auditTypes: [] };

const FILTER_STATUS_OPTIONS = ['Not started', 'In progress', 'Awaiting approval', 'Changes needed'];
const FILTER_CATEGORY_OPTIONS = ['HR', 'Operations', 'Product', 'Security', 'Training', 'Visual Merchandising'];

const auditSortOptions: { key: SortKey; label: string }[] = [
  { key: 'due-date',    label: 'Due date (first to last)' },
  { key: 'priority',    label: 'Priority (highest first)' },
  { key: 'completion',  label: 'Completion % (lowest first)' },
  { key: 'alphabetical', label: 'Alphabetically (A - Z)' },
];

const templateSortOptions: { key: SortKey; label: string }[] = [
  { key: 'alphabetical', label: 'Alphabetically (A - Z)' },
  { key: 'date-created', label: 'Date created (newest first)' },
  { key: 'category',     label: 'Category' },
];

interface AuditContentProps {
  tab: number;
  onTabChange: (tab: number) => void;
  templates: Template[];
  onArchiveTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onViewTemplate: (template: Template) => void;
  collectionFilter: CollectionFilter;
  onCollectionFilterChange: (filter: CollectionFilter) => void;
  auditInstances: AuditInstance[];
  auditCollectionFilter: AuditCollectionFilter;
  onAuditCollectionFilterChange: (filter: AuditCollectionFilter) => void;
  onViewAudit: (instance: AuditInstance) => void;
}

const AuditContent: React.FC<AuditContentProps> = ({ tab, onTabChange, templates, onArchiveTemplate, onDeleteTemplate, onViewTemplate, collectionFilter, onCollectionFilterChange, auditInstances, auditCollectionFilter, onAuditCollectionFilterChange, onViewAudit }) => {
  const { role } = useRole();
  const [selectedTab, setSelectedTab] = useState(tab);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortReverse, setSortReverse] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [auditFilterPanelOpen, setAuditFilterPanelOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<AuditFilters>(EMPTY_AUDIT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>(EMPTY_AUDIT_FILTERS);

  useEffect(() => { setSelectedTab(tab); }, [tab]);

  useEffect(() => {
    setCreatorFilter(null); setSortBy(null); setSortReverse(false);
    setAppliedFilters(EMPTY_AUDIT_FILTERS); setPendingFilters(EMPTY_AUDIT_FILTERS);
  }, [collectionFilter, auditCollectionFilter, selectedTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    onTabChange(index);
    setCollectionOpen(false);
  };

  const isTemplates = selectedTab === 1;

  const sortedAuditInstances = useMemo(() => {
    const base = !sortBy ? auditInstances : [...auditInstances].sort((a, b) => {
      if (sortBy === 'due-date')   return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
      if (sortBy === 'priority')   return (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0);
      if (sortBy === 'completion') {
        const ra = a.stores.length ? a.completedCount / a.stores.length : 0;
        const rb = b.stores.length ? b.completedCount / b.stores.length : 0;
        return ra - rb;
      }
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });
    return sortReverse ? [...base].reverse() : base;
  }, [auditInstances, sortBy, sortReverse]);

  const typeFilteredAuditInstances = useMemo(() => {
    if (appliedFilters.auditTypes.length === 0) return sortedAuditInstances;
    return sortedAuditInstances.filter((i) => {
      const type = i.audience === 'stores' ? 'self-audit' : 'auditor-led';
      return appliedFilters.auditTypes.includes(type);
    });
  }, [sortedAuditInstances, appliedFilters.auditTypes]);

  const auditFilteredInstances = useMemo(() => {
    let base = typeFilteredAuditInstances;
    if (appliedFilters.priority) base = base.filter((i) => i.isPriority);
    if (appliedFilters.categories.length > 0) base = base.filter((i) => appliedFilters.categories.includes(i.category));
    if (appliedFilters.statuses.length > 0) {
      base = base.filter((i) => {
        if (appliedFilters.statuses.includes('Not started') && i.completedCount === 0 && i.status === 'sent') return true;
        if (appliedFilters.statuses.includes('In progress') && i.completedCount > 0 && i.completedCount < i.stores.length) return true;
        return false;
      });
    }
    return base;
  }, [typeFilteredAuditInstances, appliedFilters]);

  const filteredSampleCards = appliedFilters.auditTypes.length === 0
    ? sampleAuditCards
    : sampleAuditCards.filter((card) => {
        const hasAuditor =
          ('auditor' in card && !!(card as { auditor?: unknown }).auditor) ||
          ('progress' in card && Array.isArray((card as { progress?: { auditors?: unknown[] } }).progress?.auditors) &&
            ((card as { progress?: { auditors?: unknown[] } }).progress?.auditors?.length ?? 0) > 0);
        const cardType: 'self-audit' | 'auditor-led' = hasAuditor ? 'auditor-led' : 'self-audit';
        return appliedFilters.auditTypes.includes(cardType);
      });

  // Audit instance filtering
  // Audits where Emily is assigned as an auditor (she's a recipient)
  // Area Manager sees:
  //   - store-audience audits (sent/scheduled, she may be the sender)
  //   - auditor-audience audits only where she is an assigned auditor
  const areaManagerOverviewAudits = role === 'areaManager'
    ? auditFilteredInstances.filter((i) => {
        if (i.status !== 'sent' && i.status !== 'scheduled') return false;
        if (i.audience === 'stores') return true;
        if (i.audience === 'auditors') return i.auditorAssignments?.some((a) => a.auditor.id === AREA_MANAGER_AUDITOR_ID) ?? false;
        return false;
      })
    : [];

  const storeAudits = role === 'store'
    ? auditFilteredInstances.filter((i) => i.stores.includes(STORE_NAME))
    : [];

  const filteredAuditCards = (() => {
    const sent      = auditFilteredInstances.filter((i) => i.status === 'sent');
    const scheduled = auditFilteredInstances.filter((i) => i.status === 'scheduled');
    const drafts    = auditFilteredInstances.filter((i) => i.status === 'draft');
    switch (auditCollectionFilter) {
      case 'overview':
        if (role === 'areaManager') return [...areaManagerOverviewAudits.map((i) => toAuditCardProps(projectForAM(i))), ...filteredSampleCards];
        if (role === 'store')       return [...storeAudits.map(toAuditCardProps), ...filteredSampleCards];
        return [...sent.map(toAuditCardProps), ...filteredSampleCards];
      case 'sent':          return sent.map(toAuditCardProps);
      case 'scheduled':     return scheduled.map(toAuditCardProps);
      case 'audit-drafts':  return drafts.map(toAuditCardProps);
      case 'all':           return [...auditFilteredInstances.map(toAuditCardProps), ...filteredSampleCards];
      case 'assigned-to-me':
        if (role === 'areaManager') return areaManagerOverviewAudits.filter((i) => i.audience === 'auditors').map((i) => toAuditCardProps(projectForAM(i)));
        if (role === 'store')       return storeAudits.map(toAuditCardProps);
        return filteredSampleCards;
      default:              return filteredSampleCards;
    }
  })() as Array<ReturnType<typeof toAuditCardProps> | (typeof sampleAuditCards)[number]>;

  const appliedAuditFilterCount =
    appliedFilters.statuses.length +
    (appliedFilters.priority ? 1 : 0) +
    (appliedFilters.expired ? 1 : 0) +
    appliedFilters.categories.length +
    appliedFilters.auditTypes.length;
  const hasAppliedAuditFilters = appliedAuditFilterCount > 0;

  // Audit collection counts (show 99+ for mock items, real counts for instances)
  const auditCountsMap: Record<AuditCollectionFilter, number> = {
    'overview':
      role === 'areaManager' ? areaManagerOverviewAudits.length + sampleAuditCards.length :
      role === 'store'       ? storeAudits.length + sampleAuditCards.length :
      auditInstances.filter((i) => i.status === 'sent').length + sampleAuditCards.length,
    'assigned-to-me':
      role === 'areaManager' ? areaManagerOverviewAudits.filter((i) => i.audience === 'auditors').length :
      role === 'store'       ? storeAudits.length :
      sampleAuditCards.length,
    'awaiting-approval': 0,
    'done':            0,
    'sent':            auditInstances.filter((i) => i.status === 'sent').length,
    'scheduled':       auditInstances.filter((i) => i.status === 'scheduled').length,
    'audit-drafts':    auditInstances.filter((i) => i.status === 'draft').length,
    'all':             auditInstances.length + sampleAuditCards.length,
  };

  // Counts per filter
  const libCount = templates.filter((t) => !t.status || t.status === 'library').length;
  const draftCount = templates.filter((t) => t.status === 'draft').length;
  const archivedCount = templates.filter((t) => t.status === 'archived').length;

  const countsMap: Record<CollectionFilter, number> = {
    library: libCount,
    drafts: draftCount,
    archived: archivedCount,
  };

  const displayedTemplates = (() => {
    const base = collectionFilter === 'library'
      ? templates.filter((t) => !t.status || t.status === 'library')
      : collectionFilter === 'drafts'
      ? templates.filter((t) => t.status === 'draft')
      : templates.filter((t) => t.status === 'archived');
    const sorted = !sortBy ? base
      : sortBy === 'alphabetical'  ? [...base].sort((a, b) => a.title.localeCompare(b.title))
      : sortBy === 'date-created'  ? [...base].sort((a, b) => b.id.localeCompare(a.id))
      : sortBy === 'category'      ? [...base].sort((a, b) => a.category.localeCompare(b.category))
      : base;
    return sortReverse ? [...sorted].reverse() : sorted;
  })();

  const uniqueCreators = Array.from(new Set(displayedTemplates.map((t) => t.createdBy)));

  const filteredTemplates = creatorFilter
    ? displayedTemplates.filter((t) => t.createdBy === creatorFilter)
    : displayedTemplates;

  const listTitle = isTemplates
    ? `Templates (${filteredTemplates.length})`
    : `Audits (${filteredAuditCards.length})`;

  const formatCount = (n: number) => (n > 99 ? '99+' : String(n));

  return (
    <div className="audit-content">

      {/* Collection sidebar */}
      {collectionOpen && (
        <>
          <div className="collection-backdrop" onClick={() => setCollectionOpen(false)} />
          <div className="collection-sidebar">
            <div className="collection-sidebar-header">
              <h2 className="collection-sidebar-title">Collection</h2>
              <button
                className="collection-sidebar-close"
                onClick={() => setCollectionOpen(false)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="collection-sidebar-items">
              {isTemplates
                ? collectionItems.map((item) => (
                    <button
                      key={item.key}
                      className={`collection-sidebar-item${collectionFilter === item.key ? ' collection-sidebar-item--active' : ''}`}
                      onClick={() => { onCollectionFilterChange(item.key); setCollectionOpen(false); }}
                    >
                      <span className="collection-sidebar-label">{item.label}</span>
                      <span className="collection-badge">{formatCount(countsMap[item.key])}</span>
                    </button>
                  ))
                : auditCollectionItems.map((item) => (
                    <button
                      key={item.key}
                      className={`collection-sidebar-item${auditCollectionFilter === item.key ? ' collection-sidebar-item--active' : ''}`}
                      onClick={() => { onAuditCollectionFilterChange(item.key); setCollectionOpen(false); }}
                    >
                      <span className="collection-sidebar-label">{item.label}</span>
                      <span className="collection-badge">{formatCount(auditCountsMap[item.key])}</span>
                    </button>
                  ))
              }
            </div>
          </div>
        </>
      )}

      {/* Audit filter panel */}
      {auditFilterPanelOpen && !isTemplates && (
        <>
          <div className="collection-backdrop" onClick={() => setAuditFilterPanelOpen(false)} />
          <div className="audit-filter-panel">
            <div className="audit-filter-panel-header">
              <span className="audit-filter-panel-title">Filters</span>
              <button className="collection-sidebar-close" onClick={() => setAuditFilterPanelOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="audit-filter-panel-body">
              <div className="audit-filter-section">
                <span className="audit-filter-section-title">Audit type</span>
                <div className="audit-filter-radio-group">
                  {(['self-audit', 'auditor-led'] as const).map((type) => (
                    <label key={type} className="audit-filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={pendingFilters.auditTypes.includes(type)}
                        onChange={() => setPendingFilters((prev) => ({
                          ...prev,
                          auditTypes: prev.auditTypes.includes(type)
                            ? prev.auditTypes.filter((t) => t !== type)
                            : [...prev.auditTypes, type],
                        }))}
                      />
                      <span>{type === 'self-audit' ? 'Self-audit' : 'Auditor-led'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="audit-filter-divider" />
              <div className="audit-filter-section">
                <span className="audit-filter-section-title">Status</span>
                <div className="audit-filter-checkbox-grid">
                  {FILTER_STATUS_OPTIONS.map((s) => (
                    <label key={s} className="audit-filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={pendingFilters.statuses.includes(s)}
                        onChange={() => setPendingFilters((prev) => ({
                          ...prev,
                          statuses: prev.statuses.includes(s) ? prev.statuses.filter((x) => x !== s) : [...prev.statuses, s],
                        }))}
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="audit-filter-divider" />
              <label className="audit-filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={pendingFilters.priority}
                  onChange={() => setPendingFilters((prev) => ({ ...prev, priority: !prev.priority }))}
                />
                <span>Priority</span>
              </label>

              <div className="audit-filter-divider" />
              <label className="audit-filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={pendingFilters.expired}
                  onChange={() => setPendingFilters((prev) => ({ ...prev, expired: !prev.expired }))}
                />
                <span>Expired</span>
              </label>

              <div className="audit-filter-divider" />
              <div className="audit-filter-section">
                <span className="audit-filter-section-title">Categories</span>
                <div className="audit-filter-checkbox-grid">
                  {FILTER_CATEGORY_OPTIONS.map((c) => (
                    <label key={c} className="audit-filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={pendingFilters.categories.includes(c)}
                        onChange={() => setPendingFilters((prev) => ({
                          ...prev,
                          categories: prev.categories.includes(c) ? prev.categories.filter((x) => x !== c) : [...prev.categories, c],
                        }))}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="audit-filter-panel-footer">
              <button className="audit-filter-clear-btn" onClick={() => { setAppliedFilters(EMPTY_AUDIT_FILTERS); setPendingFilters(EMPTY_AUDIT_FILTERS); setAuditFilterPanelOpen(false); }}>
                Clear All
              </button>
              <button
                className="btn btn--filled btn--pill"
                onClick={() => { setAppliedFilters(pendingFilters); setAuditFilterPanelOpen(false); }}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}

      {/* Row 1: Segmented controls — HQ only (Audits + Templates) */}
      {role === 'hq' && (
        <SegmentedControls
          key={tab}
          aria-label="View mode"
          data-test-id="segmented-audit-view"
          defaultSelected={tab}
          size="s"
          border
        >
          <SegmentedControls.Button
            text="Audits"
            data-test-id="segmented-btn-audits"
            onClick={handleTabChange}
          />
          <SegmentedControls.Button
            text="Templates"
            data-test-id="segmented-btn-templates"
            onClick={handleTabChange}
          />
        </SegmentedControls>
      )}

      {/* Row 2: List header */}
      <div className="audit-list-header">
        <h2 className="audit-list-title">{listTitle}</h2>
        <div className="audit-list-actions">
          <button
            className="btn btn--outlined btn--pill"
            data-test-id="btn-primary-action"
            onClick={() => setCollectionOpen((o) => !o)}
          >
            {isTemplates
              ? (collectionItems.find((i) => i.key === collectionFilter)?.label ?? 'Template library')
              : (auditCollectionItems.find((i) => i.key === auditCollectionFilter)?.label ?? 'Overview')}
            {chevronIcon}
          </button>
          <button className="tool-button" data-test-id="btn-search">
            <Search className="icon-sm" strokeWidth={2} />
          </button>
          <button className="tool-button" data-test-id="btn-globe">
            <Globe className="icon-sm" strokeWidth={2} />
          </button>
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className={`tool-button${(creatorFilter || hasAppliedAuditFilters) ? ' tool-button--active' : ''}`}
              data-test-id="btn-filter"
              onClick={() => {
                if (isTemplates) {
                  setFilterOpen((o) => !o);
                } else {
                  setPendingFilters(appliedFilters);
                  setAuditFilterPanelOpen(true);
                }
              }}
            >
              <SlidersHorizontal className="icon-sm" strokeWidth={2} stroke={(creatorFilter || hasAppliedAuditFilters) ? 'var(--qui-color-primary-main)' : '#465d6d'} />
              {(creatorFilter || hasAppliedAuditFilters) && (
                <span className="tool-button-badge">
                  {!isTemplates && appliedAuditFilterCount > 0 ? appliedAuditFilterCount : null}
                </span>
              )}
            </button>
            {filterOpen && isTemplates && (
              <div className="filter-dropdown">
                <div className="filter-dropdown-header">
                  <span className="filter-dropdown-title">Filter by creator</span>
                  {creatorFilter && (
                    <button className="filter-dropdown-clear" onClick={() => setCreatorFilter(null)}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="filter-dropdown-items">
                  {uniqueCreators.map((creator) => (
                    <button
                      key={creator}
                      className={`filter-dropdown-item${creatorFilter === creator ? ' filter-dropdown-item--selected' : ''}`}
                      onClick={() => { setCreatorFilter(creatorFilter === creator ? null : creator); setFilterOpen(false); }}
                    >
                      <span className="filter-dropdown-item-check">
                        {creatorFilter === creator && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </span>
                      {creator}
                    </button>
                  ))}
                  {uniqueCreators.length === 0 && (
                    <p className="filter-dropdown-empty">No templates to filter</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }} ref={sortRef}>
            <button
              className={`tool-button${(sortBy !== null || sortReverse) ? ' tool-button--active' : ''}`}
              data-test-id="btn-sort"
              onClick={() => setSortOpen((o) => !o)}
            >
              <ArrowUpDown className="icon-sm" strokeWidth={2} stroke={(sortBy !== null || sortReverse) ? 'var(--qui-color-primary-main)' : '#465d6d'} />
              {(sortBy !== null || sortReverse) && <span className="tool-button-badge" />}
            </button>
            {sortOpen && (
              <div className="sort-panel">
                <div className="sort-panel-header">
                  <span className="sort-panel-title">Sort</span>
                  <button className="sort-panel-close" onClick={() => setSortOpen(false)} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="sort-panel-options">
                  {(isTemplates ? templateSortOptions : auditSortOptions).map((opt, i, arr) => (
                    <React.Fragment key={opt.key}>
                      <div
                        className={`sort-radio-item${sortBy === opt.key ? ' sort-radio-item--selected' : ''}`}
                        onClick={() => setSortBy(sortBy === opt.key ? null : opt.key)}
                      >
                        <span className={`sort-radio-circle${sortBy === opt.key ? ' sort-radio-circle--selected' : ''}`}>
                          {sortBy === opt.key && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="12" height="12">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </span>
                        <span className="sort-radio-label">{opt.label}</span>
                      </div>
                      {i < arr.length - 1 && <div className="sort-panel-divider" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="sort-panel-divider" />
                <label className="sort-reverse-row">
                  <span className="sort-reverse-label">Reverse</span>
                  <span className="toggle-switch">
                    <input type="checkbox" checked={sortReverse} onChange={e => setSortReverse(e.target.checked)} />
                    <span className="toggle-slider" />
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Cards grid */}
      <div className="audit-grid">
        {isTemplates
          ? filteredTemplates.map((card) => (
              <TemplateCard
                key={card.id}
                title={card.title}
                sections={card.sections}
                questions={card.questions}
                createdBy={card.createdBy}
                publishedOn={card.publishedOn}
                category={card.category}
                isSaving={card.isSaving}
                status={card.status}
                onArchive={() => onArchiveTemplate(card.id)}
                onDelete={() => onDeleteTemplate(card.id)}
                onClick={() => onViewTemplate(card)}
              />
            ))
          : filteredAuditCards.map((card) => {
            const instance = auditInstances.find((i) => i.id === card.id);
            return (
              <AuditCard
                key={card.id}
                {...card}
                onClick={instance ? () => onViewAudit(instance) : undefined}
              />
            );
          })
        }
      </div>

    </div>
  );
};

export default AuditContent;
