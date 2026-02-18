import React, { useState, useEffect, useRef } from 'react';
import SegmentedControls from './SegmentedControls';
import AuditCard from './AuditCard';
import TemplateCard from './TemplateCard';
import type { Template } from './TemplateCard';

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
      auditorInitials: ['AB', 'AB'],
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

const collectionItems: { key: CollectionFilter; label: string }[] = [
  { key: 'library', label: 'Template library' },
  { key: 'drafts', label: 'Template drafts' },
  { key: 'archived', label: 'Archived' },
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
}

const AuditContent: React.FC<AuditContentProps> = ({ tab, onTabChange, templates, onArchiveTemplate, onDeleteTemplate, onViewTemplate, collectionFilter, onCollectionFilterChange }) => {
  const [selectedTab, setSelectedTab] = useState(tab);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSelectedTab(tab); }, [tab]);

  useEffect(() => { setCreatorFilter(null); }, [collectionFilter, selectedTab]);

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
    : 'Audits (40)';

  const formatCount = (n: number) => (n > 99 ? '99+' : String(n));

  return (
    <div className="audit-content">

      {/* Collection sidebar */}
      {collectionOpen && isTemplates && (
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
              {collectionItems.map((item) => (
                <button
                  key={item.key}
                  className={`collection-sidebar-item${collectionFilter === item.key ? ' collection-sidebar-item--active' : ''}`}
                  onClick={() => {
                    onCollectionFilterChange(item.key);
                    setCollectionOpen(false);
                  }}
                >
                  <span className="collection-sidebar-label">{item.label}</span>
                  <span className="collection-badge">{formatCount(countsMap[item.key])}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Row 1: Segmented controls */}
      <SegmentedControls
        aria-label="View mode"
        data-test-id="segmented-audit-view"
        defaultSelected={tab}
        size="m"
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

      {/* Row 2: List header */}
      <div className="audit-list-header">
        <h2 className="audit-list-title">{listTitle}</h2>
        <div className="audit-list-actions">
          <button
            className="btn btn--outlined btn--pill"
            data-test-id="btn-primary-action"
            onClick={() => isTemplates && setCollectionOpen((o) => !o)}
          >
            {isTemplates ? (collectionItems.find((i) => i.key === collectionFilter)?.label ?? 'Template library') : 'Overview'}
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
          : sampleAuditCards.map((card) => <AuditCard key={card.id} {...card} />)
        }
      </div>

    </div>
  );
};

export default AuditContent;
