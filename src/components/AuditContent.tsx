import React, { useState, useEffect, useRef } from 'react';
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
        auditors: inst.auditors.slice(0, 2),
        moreCount: inst.auditors.length > 2 ? inst.auditors.length - 2 : undefined,
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

  useEffect(() => { setSelectedTab(tab); }, [tab]);

  useEffect(() => { setCreatorFilter(null); }, [collectionFilter, auditCollectionFilter, selectedTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
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

  // Audit instance filtering
  // Audits where Emily is assigned as an auditor (she's a recipient)
  // Area Manager sees:
  //   - store-audience audits (sent/scheduled, she may be the sender)
  //   - auditor-audience audits only where she is an assigned auditor
  const areaManagerOverviewAudits = role === 'areaManager'
    ? auditInstances.filter((i) => {
        if (i.status !== 'sent' && i.status !== 'scheduled') return false;
        if (i.audience === 'stores') return true;
        if (i.audience === 'auditors') return i.auditorAssignments?.some((a) => a.auditor.id === AREA_MANAGER_AUDITOR_ID) ?? false;
        return false;
      })
    : [];

  const storeAudits = role === 'store'
    ? auditInstances.filter((i) => i.stores.includes(STORE_NAME))
    : [];

  const filteredAuditCards = (() => {
    const sent      = auditInstances.filter((i) => i.status === 'sent');
    const scheduled = auditInstances.filter((i) => i.status === 'scheduled');
    const drafts    = auditInstances.filter((i) => i.status === 'draft');
    switch (auditCollectionFilter) {
      case 'overview':
        if (role === 'areaManager') return [...areaManagerOverviewAudits.map((i) => toAuditCardProps(projectForAM(i))), ...sampleAuditCards];
        if (role === 'store')       return [...storeAudits.map(toAuditCardProps), ...sampleAuditCards];
        return [...sent.map(toAuditCardProps), ...sampleAuditCards];
      case 'sent':          return sent.map(toAuditCardProps);
      case 'scheduled':     return scheduled.map(toAuditCardProps);
      case 'audit-drafts':  return drafts.map(toAuditCardProps);
      case 'all':           return [...auditInstances.map(toAuditCardProps), ...sampleAuditCards];
      case 'assigned-to-me':
        if (role === 'areaManager') return areaManagerOverviewAudits.filter((i) => i.audience === 'auditors').map((i) => toAuditCardProps(projectForAM(i)));
        if (role === 'store')       return storeAudits.map(toAuditCardProps);
        return sampleAuditCards;
      default:              return sampleAuditCards;
    }
  })() as Array<ReturnType<typeof toAuditCardProps> | (typeof sampleAuditCards)[number]>;

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

  const displayedTemplates =
    collectionFilter === 'library'
      ? templates.filter((t) => !t.status || t.status === 'library')
      : collectionFilter === 'drafts'
      ? templates.filter((t) => t.status === 'draft')
      : templates.filter((t) => t.status === 'archived');

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
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button className="tool-button" data-test-id="btn-globe">
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
            </svg>
          </button>
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className={`tool-button${creatorFilter ? ' tool-button--active' : ''}`}
              data-test-id="btn-filter"
              onClick={() => isTemplates && setFilterOpen((o) => !o)}
            >
              <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke={creatorFilter ? 'var(--qui-color-primary-main)' : '#465d6d'} strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="11" y1="18" x2="13" y2="18"></line>
              </svg>
              {creatorFilter && <span className="tool-button-badge" />}
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
          <button className="tool-button" data-test-id="btn-sort">
            <svg className="icon-sm" viewBox="0 0 24 24" fill="none" stroke="#465d6d" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
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
