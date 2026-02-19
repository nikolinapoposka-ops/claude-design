import React from 'react';
import AuditContent from './AuditContent';
import type { CollectionFilter, AuditCollectionFilter } from './AuditContent';
import type { Template } from './TemplateCard';
import type { AuditInstance } from '../App';

interface MainContentProps {
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

const MainContent: React.FC<MainContentProps> = ({ tab, onTabChange, templates, onArchiveTemplate, onDeleteTemplate, onViewTemplate, collectionFilter, onCollectionFilterChange, auditInstances, auditCollectionFilter, onAuditCollectionFilterChange, onViewAudit }) => {
  return (
    <main className="main-content">
      <AuditContent tab={tab} onTabChange={onTabChange} templates={templates} onArchiveTemplate={onArchiveTemplate} onDeleteTemplate={onDeleteTemplate} onViewTemplate={onViewTemplate} collectionFilter={collectionFilter} onCollectionFilterChange={onCollectionFilterChange} auditInstances={auditInstances} auditCollectionFilter={auditCollectionFilter} onAuditCollectionFilterChange={onAuditCollectionFilterChange} onViewAudit={onViewAudit} />
    </main>
  );
};

export default MainContent;
