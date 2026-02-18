import React from 'react';
import AuditContent from './AuditContent';
import type { CollectionFilter } from './AuditContent';
import type { Template } from './TemplateCard';

interface MainContentProps {
  tab: number;
  onTabChange: (tab: number) => void;
  templates: Template[];
  onArchiveTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onViewTemplate: (template: Template) => void;
  collectionFilter: CollectionFilter;
  onCollectionFilterChange: (filter: CollectionFilter) => void;
}

const MainContent: React.FC<MainContentProps> = ({ tab, onTabChange, templates, onArchiveTemplate, onDeleteTemplate, onViewTemplate, collectionFilter, onCollectionFilterChange }) => {
  return (
    <main className="main-content">
      <AuditContent tab={tab} onTabChange={onTabChange} templates={templates} onArchiveTemplate={onArchiveTemplate} onDeleteTemplate={onDeleteTemplate} onViewTemplate={onViewTemplate} collectionFilter={collectionFilter} onCollectionFilterChange={onCollectionFilterChange} />
    </main>
  );
};

export default MainContent;
