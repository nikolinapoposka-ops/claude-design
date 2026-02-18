import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import SecondaryNav from './components/SecondaryNav';
import MainContent from './components/MainContent';
import CreateTemplateNav from './components/CreateTemplateNav';
import CreateTemplateContent from './components/CreateTemplateContent';
import TemplateDetailContent from './components/TemplateDetailContent';
import EditTemplateContent from './components/EditTemplateContent';
import DiscardChangesModal from './components/DiscardChangesModal';
import ChooseTemplateView from './components/ChooseTemplateView';
import TemplateOverviewContent from './components/TemplateOverviewContent';
import ReviewAndSendContent from './components/ReviewAndSendContent';
import type { SendAuditData } from './components/ReviewAndSendContent';
import { ToastProvider, useToast } from './components/Toast';
import type { Template } from './components/TemplateCard';
import type { CollectionFilter } from './components/AuditContent';

type View = 'list' | 'create-template' | 'template-detail' | 'edit-template'
           | 'choose-template' | 'template-overview' | 'review-and-send';

export interface AuditInstance {
  id: string;
  title: string;
  category: string;
  sendOutDate: string;
  dueDate: string;
  status: 'draft' | 'sent';
}

const DEFAULT_DRAFT_TITLE = 'New brush and sponge drop';

const INITIAL_TEMPLATES: Template[] = Array.from({ length: 10 }, (_, i) => ({
  id: `sample-${i + 1}`,
  title: 'Fire safety audit',
  sections: 4,
  questions: 24,
  createdBy: 'Created by HQ safety operations',
  publishedOn: 'Published on 24 Jan 2025',
  category: 'Security',
  status: 'library',
}));

let tempIdCounter = 0;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AppContent() {
  const createToast = useToast();
  const [view, setView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState(0);
  const [reusableTemplates, setReusableTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [draftTitle, setDraftTitle] = useState(DEFAULT_DRAFT_TITLE);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editIsDirty, setEditIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('library');
  const [selectedAuditTemplate, setSelectedAuditTemplate] = useState<Template | null>(null);
  const [auditInstances, setAuditInstances] = useState<AuditInstance[]>([]);

  // --- Template library handlers ---

  const handleNavigateToTemplate = () => {
    setDraftTitle(DEFAULT_DRAFT_TITLE);
    setEditingDraftId(null);
    setView('create-template');
  };

  const handleViewTemplate = (template: Template) => {
    if (template.status === 'draft') {
      setDraftTitle(template.title);
      setEditingDraftId(template.id);
      setView('create-template');
    } else {
      setSelectedTemplate(template);
      setView('template-detail');
    }
  };

  const handleBackFromDetail = () => {
    setSelectedTemplate(null);
    setView('list');
  };

  const handleEditTemplate = () => {
    setEditIsDirty(false);
    setView('edit-template');
  };

  const handleConfirmDiscardEdit = () => {
    setShowDiscardModal(false);
    setEditIsDirty(false);
    setView('template-detail');
  };

  const handleRequestLeaveEdit = () => {
    if (editIsDirty) {
      setShowDiscardModal(true);
    } else {
      handleConfirmDiscardEdit();
    }
  };

  const handleSaveEditedTemplate = (data: { title: string; category: string }) => {
    if (!selectedTemplate) return;
    const updated: Template = { ...selectedTemplate, ...data };
    setReusableTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTemplate(updated);
    setView('template-detail');
  };

  const handleBackFromTemplate = () => {
    if (editingDraftId) {
      setReusableTemplates((prev) =>
        prev.map((t) => (t.id === editingDraftId ? { ...t, title: draftTitle.trim() || t.title } : t))
      );
      setEditingDraftId(null);
      setActiveTab(1);
      setView('list');
    } else {
      if (draftTitle.trim()) {
        const draftTemplate: Template = {
          id: `draft-${Date.now()}`,
          title: draftTitle.trim(),
          sections: 0,
          questions: 0,
          createdBy: 'Created by you',
          publishedOn: `Published on ${formatDate(new Date())}`,
          category: 'Security',
          status: 'draft',
        };
        setReusableTemplates((prev) => [draftTemplate, ...prev]);
      }
      setActiveTab(1);
      setView('list');
    }
  };

  const handleArchiveTemplate = (id: string) => {
    setReusableTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'archived' as const } : t))
    );
    createToast({ message: 'Template has been archived', type: 'positive', duration: 3000 });
  };

  const handleArchiveAndReturn = (id: string) => {
    setReusableTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'archived' as const } : t))
    );
    setSelectedTemplate(null);
    setCollectionFilter('library');
    setActiveTab(1);
    setView('list');
    createToast({ message: 'Template has been archived', type: 'positive', duration: 3000 });
  };

  const handleDeleteDraftById = (id: string) => {
    setReusableTemplates((prev) => prev.filter((t) => t.id !== id));
    createToast({ message: 'Template draft deleted', type: 'positive', duration: 3000 });
  };

  const handleDeleteDraft = () => {
    if (editingDraftId) {
      setReusableTemplates((prev) => prev.filter((t) => t.id !== editingDraftId));
      setEditingDraftId(null);
    }
    setActiveTab(1);
    setView('list');
    createToast({ message: 'Template draft deleted', type: 'positive', duration: 3000 });
  };

  const handleSaveTemplate = (data: { title: string; category: string; isPriority: boolean; description: string; sections: Array<{ title: string; questions: string[] }> }) => {
    if (editingDraftId) {
      setReusableTemplates((prev) =>
        prev.map((t) =>
          t.id === editingDraftId
            ? { ...t, title: data.title || t.title, category: data.category || t.category, isPriority: data.isPriority, description: data.description, sectionData: data.sections, sections: data.sections.length, questions: data.sections.reduce((acc, s) => acc + s.questions.length, 0), status: 'library' as const }
            : t
        )
      );
      setEditingDraftId(null);
      setView('list');
      setActiveTab(1);
      createToast({ message: 'Reusable audit template created', type: 'positive', duration: 3000 });
      return;
    }

    const tempId = `temp-${++tempIdCounter}`;
    const optimisticTemplate: Template = {
      id: tempId,
      title: data.title || 'Untitled template',
      sections: data.sections.length,
      questions: data.sections.reduce((acc, s) => acc + s.questions.length, 0),
      sectionData: data.sections,
      description: data.description,
      createdBy: 'Created by you',
      publishedOn: `Published on ${formatDate(new Date())}`,
      category: data.category || 'Security',
      isPriority: data.isPriority,
      status: 'library',
      isSaving: true,
    };

    setReusableTemplates((prev) => [optimisticTemplate, ...prev]);
    setView('list');
    setActiveTab(1);

    setTimeout(() => {
      const realId = `template-${Date.now()}`;
      setReusableTemplates((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: realId, isSaving: false } : t))
      );
      createToast({ message: 'Reusable audit template created', type: 'positive', duration: 3000 });
    }, 600);
  };

  // --- Reuse audit flow handlers ---

  const handleReuseTemplate = () => {
    setView('choose-template');
  };

  const handleSelectAuditTemplate = (template: Template) => {
    setSelectedAuditTemplate(template);
    setView('template-overview');
  };

  const handleUseTemplate = () => {
    setView('review-and-send');
  };

  const handleBackFromChooseTemplate = () => {
    setView('list');
  };

  const handleBackFromTemplateOverview = () => {
    setView('choose-template');
  };

  const handleBackFromReviewAndSend = () => {
    if (selectedAuditTemplate) {
      const draft: AuditInstance = {
        id: `audit-draft-${Date.now()}`,
        title: selectedAuditTemplate.title,
        category: selectedAuditTemplate.category,
        sendOutDate: '',
        dueDate: '',
        status: 'draft',
      };
      setAuditInstances((prev) => [draft, ...prev]);
    }
    setSelectedAuditTemplate(null);
    setActiveTab(0);
    setView('list');
  };

  const handleSendAudit = (data: SendAuditData) => {
    if (selectedAuditTemplate) {
      const instance: AuditInstance = {
        id: `audit-${Date.now()}`,
        title: selectedAuditTemplate.title,
        category: selectedAuditTemplate.category,
        sendOutDate: data.sendOutDate || formatDate(new Date()),
        dueDate: data.dueDate || '',
        status: 'sent',
      };
      setAuditInstances((prev) => [instance, ...prev]);
    }
    setSelectedAuditTemplate(null);
    setActiveTab(0);
    setView('list');
    createToast({ message: 'Audit created', type: 'positive', duration: 3000 });
  };

  return (
    <>
      <Navbar />
      {view === 'list' ? (
        <>
          <SecondaryNav
            onNavigateToTemplate={handleNavigateToTemplate}
            onReuseTemplate={handleReuseTemplate}
          />
          <MainContent
            tab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            templates={reusableTemplates}
            onArchiveTemplate={handleArchiveTemplate}
            onDeleteTemplate={handleDeleteDraftById}
            onViewTemplate={handleViewTemplate}
            collectionFilter={collectionFilter}
            onCollectionFilterChange={setCollectionFilter}
            auditInstances={auditInstances}
          />
        </>
      ) : view === 'create-template' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromTemplate} />
          <CreateTemplateContent
            title={draftTitle}
            onTitleChange={setDraftTitle}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteDraft}
          />
        </>
      ) : view === 'template-detail' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromDetail} />
          {selectedTemplate && (
            <TemplateDetailContent
              template={selectedTemplate}
              onEdit={handleEditTemplate}
              onArchive={() => handleArchiveAndReturn(selectedTemplate.id)}
            />
          )}
        </>
      ) : view === 'edit-template' ? (
        <>
          <CreateTemplateNav onBack={handleRequestLeaveEdit} />
          {selectedTemplate && (
            <EditTemplateContent
              template={selectedTemplate}
              onCancel={handleRequestLeaveEdit}
              onSave={handleSaveEditedTemplate}
              onDirtyChange={setEditIsDirty}
            />
          )}
        </>
      ) : view === 'choose-template' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromChooseTemplate} />
          <ChooseTemplateView
            templates={reusableTemplates.filter((t) => !t.status || t.status === 'library')}
            onSelect={handleSelectAuditTemplate}
          />
        </>
      ) : view === 'template-overview' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromTemplateOverview} />
          {selectedAuditTemplate && (
            <TemplateOverviewContent
              template={selectedAuditTemplate}
              onUseTemplate={handleUseTemplate}
            />
          )}
        </>
      ) : (
        <>
          <CreateTemplateNav onBack={handleBackFromReviewAndSend} />
          {selectedAuditTemplate && (
            <ReviewAndSendContent
              template={selectedAuditTemplate}
              onSend={handleSendAudit}
            />
          )}
        </>
      )}
      {showDiscardModal && (
        <DiscardChangesModal
          onKeepEditing={() => setShowDiscardModal(false)}
          onDiscard={handleConfirmDiscardEdit}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
