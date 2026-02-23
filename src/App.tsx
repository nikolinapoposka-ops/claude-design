import { useState, useEffect } from 'react';
import './App.css';
import { useRole, STORE_NAME, AREA_MANAGER_AUDITOR_ID } from './context/RoleContext';
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
import AuditDetailView from './components/AuditDetailView';
import AuditConfigView from './components/AuditConfigView';
import EditAudienceDatesView from './components/EditAudienceDatesView';
import type { EditAudienceData } from './components/EditAudienceDatesView';
import StoreSubmissionView from './components/StoreSubmissionView';
import AssignAuditorsView from './components/AssignAuditorsView';
import AssignStoresView from './components/AssignStoresView';
import ReportingDashboard from './components/ReportingDashboard';
import ReviewAudienceView from './components/ReviewAudienceView';
import type { SendAuditData } from './components/ReviewAndSendContent';
import { ToastProvider, useToast } from './components/Toast';
import type { Template } from './components/TemplateCard';
import type { CollectionFilter, AuditCollectionFilter } from './components/AuditContent';

type View = 'list' | 'create-template' | 'template-detail' | 'edit-template'
           | 'choose-template' | 'template-overview' | 'review-and-send'
           | 'assign-auditors' | 'assign-stores' | 'review-audience' | 'audit-detail' | 'audit-config'
           | 'edit-audience-dates' | 'store-submission' | 'reporting';

export interface MockAuditor {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface AuditorAssignment {
  auditor: MockAuditor;
  stores: string[];
}

export interface AuditInstance {
  id: string;
  title: string;
  category: string;
  sendOutDate: string;
  startDate: string;
  dueDate: string;
  recurringDate?: string;
  status: 'draft' | 'sent' | 'scheduled';
  audience: 'stores' | 'auditors' | null;
  stores: string[];
  auditors: { name: string; initials: string }[];
  completedCount: number;
  auditorAssignments?: AuditorAssignment[];
  sectionData?: Array<{ title: string; questions: string[] }>;
  description?: string;
  isPriority?: boolean;
  message?: string;
  createdBy?: string; // auditor id — used to detect self-created audits (viewer = executor → hide chat)
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
  description: 'Comprehensive fire safety compliance check including extinguishers, exits, and alarm systems. This audit ensures all stores meet regulatory requirements.',
}));

const SEED_AUDIT_INSTANCES: AuditInstance[] = [
  {
    id: 'seed-1',
    title: 'Fire safety audit',
    category: 'Security',
    sendOutDate: '2025-10-03T19:30:00',
    startDate: '2025-10-03',
    dueDate: '2025-10-30',
    status: 'sent',
    audience: 'stores',
    isPriority: true,
    stores: [
      'San Francisco - Downtown',
      'Los Angeles - Westside',
      'Seattle - Capitol Hill',
      'Portland - Pearl District',
    ],
    auditors: [],
    completedCount: 1,
    description:
      'Comprehensive fire safety compliance check including extinguishers, exits, and alarm systems. This audit ensures all stores meet regulatory requirements and maintain a safe environment for staff and customers.',
    sectionData: [
      { title: 'Maintenance & Safety', questions: [] },
      { title: 'Customer service', questions: [] },
      { title: 'Branding', questions: [] },
    ],
  },
  {
    id: 'seed-2',
    title: 'Monthly operations review',
    category: 'Operations',
    sendOutDate: '2025-11-01T09:00:00',
    startDate: '2025-11-01',
    dueDate: '2025-11-15',
    status: 'sent',
    audience: 'auditors',
    stores: [
      'San Francisco - Downtown',
      'Los Angeles - Westside',
      'Seattle - Capitol Hill',
      'Portland - Pearl District',
      'Denver - LoDo',
      'Chicago - River North',
    ],
    auditors: [
      { name: 'Emily Davis', initials: 'ED' },
      { name: 'John Smith', initials: 'JS' },
    ],
    completedCount: 2,
    createdBy: 'hq',
    auditorAssignments: [
      {
        auditor: { id: 'ed', name: 'Emily Davis', role: 'Area Manager', initials: 'ED' },
        stores: ['San Francisco - Downtown', 'Los Angeles - Westside', 'Seattle - Capitol Hill'],
      },
      {
        auditor: { id: 'js', name: 'John Smith', role: 'Auditor', initials: 'JS' },
        stores: ['Portland - Pearl District', 'Denver - LoDo', 'Chicago - River North'],
      },
    ],
  },
  {
    // Self-created: Emily assigned herself — chat hidden for Area Manager, visible for HQ
    id: 'seed-3',
    title: 'Self-initiated store walkthrough',
    category: 'Operations',
    sendOutDate: '2025-12-01T08:00:00',
    startDate: '2025-12-01',
    dueDate: '2025-12-20',
    status: 'sent',
    audience: 'auditors',
    stores: ['San Francisco - Downtown', 'Los Angeles - Westside'],
    auditors: [{ name: 'Emily Davis', initials: 'ED' }],
    completedCount: 0,
    createdBy: 'ed',
    auditorAssignments: [
      {
        auditor: { id: 'ed', name: 'Emily Davis', role: 'Area Manager', initials: 'ED' },
        stores: ['San Francisco - Downtown', 'Los Angeles - Westside'],
      },
    ],
  },
];

let tempIdCounter = 0;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AppContent() {
  const createToast = useToast();
  const { role } = useRole();
  const [view, setView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setView('list');
    if (role === 'hq') {
      setActiveTab(0);
      setAuditCollectionFilter('overview');
    } else if (role === 'areaManager') {
      setActiveTab(0);
      setAuditCollectionFilter('overview');
    } else {
      setActiveTab(0);
      setAuditCollectionFilter('overview');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);
  const [reusableTemplates, setReusableTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [draftTitle, setDraftTitle] = useState(DEFAULT_DRAFT_TITLE);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editIsDirty, setEditIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('library');
  const [auditCollectionFilter, setAuditCollectionFilter] = useState<AuditCollectionFilter>('overview');
  const [selectedAuditTemplate, setSelectedAuditTemplate] = useState<Template | null>(null);
  const [auditInstances, setAuditInstances] = useState<AuditInstance[]>(SEED_AUDIT_INSTANCES);
  const [auditorAssignments, setAuditorAssignments] = useState<AuditorAssignment[]>([]);
  const [selfAuditStores, setSelfAuditStores] = useState<string[]>([]);
  const [pendingAudienceStores, setPendingAudienceStores] = useState<string[]>([]);
  const [selectedAuditInstance, setSelectedAuditInstance] = useState<AuditInstance | null>(null);
  const [pendingReviewFormData, setPendingReviewFormData] = useState<SendAuditData | null>(null);
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [selectedStoreStatus, setSelectedStoreStatus] = useState<string>('');

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

  const handleDirectUseTemplate = (template: Template) => {
    setSelectedAuditTemplate(template);
    setView('review-and-send');
  };

  const handleBackFromChooseTemplate = () => {
    setView('list');
  };

  const handleBackFromTemplateOverview = () => {
    setView('choose-template');
  };

  const handleBackFromReviewAndSend = () => {
    if (!selectedAuditInstance && selectedAuditTemplate) {
      // Auto-save as draft, then offer an undo via toast
      const draftId = `audit-draft-${Date.now()}`;
      const draft: AuditInstance = {
        id: draftId,
        title: selectedAuditTemplate.title,
        category: selectedAuditTemplate.category,
        sendOutDate: '',
        startDate: '',
        dueDate: '',
        status: 'draft',
        audience: null,
        stores: [],
        auditors: [],
        completedCount: 0,
      };
      setAuditInstances((prev) => [draft, ...prev]);
      createToast({
        message: 'Audit saved as draft.',
        type: 'positive',
        duration: 6000,
        action: {
          label: 'Undo',
          onClick: () => setAuditInstances((prev) => prev.filter((a) => a.id !== draftId)),
        },
      });
    } else if (selectedAuditInstance) {
      // Editing an existing draft — auto-save silently
      const updated: AuditInstance = {
        ...selectedAuditInstance,
        sendOutDate: pendingReviewFormData?.sendOutDate ?? selectedAuditInstance.sendOutDate,
        startDate: pendingReviewFormData?.startDate ?? selectedAuditInstance.startDate,
        dueDate: pendingReviewFormData?.dueDate ?? selectedAuditInstance.dueDate,
        recurringDate: pendingReviewFormData?.recurringDate ?? selectedAuditInstance.recurringDate,
        message: pendingReviewFormData?.message ?? selectedAuditInstance.message,
        audience: auditorAssignments.length > 0 ? 'auditors' : selfAuditStores.length > 0 ? 'stores' : selectedAuditInstance.audience,
        stores: auditorAssignments.length > 0
          ? [...new Set(auditorAssignments.flatMap((a) => a.stores))]
          : selfAuditStores.length > 0 ? selfAuditStores : selectedAuditInstance.stores,
        auditors: auditorAssignments.length > 0
          ? auditorAssignments.map((a) => ({ name: a.auditor.name, initials: a.auditor.initials }))
          : selectedAuditInstance.auditors,
        auditorAssignments: auditorAssignments.length > 0 ? [...auditorAssignments] : selectedAuditInstance.auditorAssignments,
      };
      setAuditInstances((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
    setSelectedAuditInstance(null);
    setSelectedAuditTemplate(null);
    setAuditorAssignments([]);
    setSelfAuditStores([]);
    setPendingReviewFormData(null);
    setActiveTab(0);
    setView('list');
  };


  // --- Audience assignment handlers ---

  const handleAssignAuditors = () => setView('assign-auditors');
  const handleAssignStores = () => {
    setPendingAudienceStores(selfAuditStores);
    setView('assign-stores');
  };

  const handleConfirmAuditorAssignments = (assignments: AuditorAssignment[]) => {
    setAuditorAssignments(assignments);
    setSelfAuditStores([]);
    setView('review-and-send');
  };

  const handleConfirmStoreSelection = (stores: string[]) => {
    setPendingAudienceStores(stores);
    setView('review-audience');
  };

  const handleSetAudience = () => {
    setSelfAuditStores(pendingAudienceStores);
    setAuditorAssignments([]);
    setView('review-and-send');
  };

  const handleClearAuditors = () => setAuditorAssignments([]);
  const handleClearStores = () => setSelfAuditStores([]);

  const handleViewAudit = (instance: AuditInstance) => {
    setSelectedAuditInstance(instance);
    if (instance.status === 'draft') {
      const draftTemplate: Template = {
        id: instance.id,
        title: instance.title,
        category: instance.category,
        sections: instance.sectionData?.length ?? 0,
        questions: instance.sectionData?.reduce((sum, s) => sum + s.questions.length, 0) ?? 0,
        sectionData: instance.sectionData,
        description: instance.description,
        isPriority: instance.isPriority,
        createdBy: '',
        publishedOn: '',
        status: 'library',
      };
      setSelectedAuditTemplate(draftTemplate);
      if (instance.auditorAssignments && instance.auditorAssignments.length > 0) {
        setAuditorAssignments(instance.auditorAssignments);
      } else if (instance.audience === 'stores' && instance.stores.length > 0) {
        setSelfAuditStores(instance.stores);
      }
      setView('review-and-send');
    } else if (role === 'store') {
      // Store sees their own audit directly — no breakdown view
      setSelectedStoreName(STORE_NAME);
      setSelectedStoreStatus('not-started');
      setView('store-submission');
    } else {
      setView('audit-detail');
    }
  };

  const handleBackFromAuditDetail = () => {
    setSelectedAuditInstance(null);
    setView('list');
  };

  const handleViewDetails = () => {
    setView('audit-config');
  };

  const handleBackFromAuditConfig = () => {
    setView('audit-detail');
  };

  const handleViewStore = (storeName: string, status: string) => {
    setSelectedStoreName(storeName);
    setSelectedStoreStatus(status);
    setView('store-submission');
  };

  const handleEditAudienceDates = () => {
    setView('edit-audience-dates');
  };

  const handleSaveAudienceDates = (data: EditAudienceData) => {
    if (selectedAuditInstance) {
      const updated: AuditInstance = {
        ...selectedAuditInstance,
        recurringDate: data.recurringDate,
        dueDate: data.dueDate,
      };
      setSelectedAuditInstance(updated);
      setAuditInstances((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    }
    setView('audit-config');
    createToast({ message: 'Audience & dates updated', type: 'positive', duration: 3000 });
  };

  const handleSendAudit = (data: SendAuditData) => {
    if (selectedAuditTemplate) {
      const isScheduled = !!data.sendOutDate && new Date(data.sendOutDate) > new Date();
      const instance: AuditInstance = {
        id: `audit-${Date.now()}`,
        title: selectedAuditTemplate.title,
        category: selectedAuditTemplate.category,
        sendOutDate: data.sendOutDate || formatDate(new Date()),
        startDate: data.startDate || '',
        dueDate: data.dueDate || '',
        status: isScheduled ? 'scheduled' : 'sent',
        audience: auditorAssignments.length > 0 ? 'auditors' : selfAuditStores.length > 0 ? 'stores' : null,
        stores: auditorAssignments.length > 0
          ? [...new Set(auditorAssignments.flatMap((a) => a.stores))]
          : selfAuditStores,
        auditors: auditorAssignments.map((a) => ({ name: a.auditor.name, initials: a.auditor.initials })),
        completedCount: 0,
        auditorAssignments: auditorAssignments.length > 0 ? [...auditorAssignments] : undefined,
        sectionData: selectedAuditTemplate.sectionData,
        description: selectedAuditTemplate.description,
        isPriority: selectedAuditTemplate.isPriority,
        recurringDate: data.recurringDate || '',
        message: data.message || '',
        createdBy: role === 'areaManager' ? AREA_MANAGER_AUDITOR_ID : 'hq',
      };
      if (selectedAuditInstance) {
        // Replace the existing draft with the new sent/scheduled instance
        setAuditInstances((prev) => [instance, ...prev.filter((i) => i.id !== selectedAuditInstance.id)]);
      } else {
        setAuditInstances((prev) => [instance, ...prev]);
      }
    }
    setSelectedAuditInstance(null);
    setAuditorAssignments([]);
    setSelfAuditStores([]);
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
            onNavigateToAudit={() => setView('list')}
            onNavigateToReporting={() => setView('reporting')}
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
            auditCollectionFilter={auditCollectionFilter}
            onAuditCollectionFilterChange={setAuditCollectionFilter}
            onViewAudit={handleViewAudit}
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
              onUseTemplate={() => {
                setSelectedAuditTemplate(selectedTemplate);
                setView('review-and-send');
              }}
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
            onUseTemplate={handleDirectUseTemplate}
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
      ) : view === 'assign-auditors' ? (
        <AssignAuditorsView
          initialAssignments={auditorAssignments}
          onConfirm={handleConfirmAuditorAssignments}
          onCancel={() => setView('review-and-send')}
        />
      ) : view === 'assign-stores' ? (
        <AssignStoresView
          initialStores={pendingAudienceStores}
          onConfirm={handleConfirmStoreSelection}
          onCancel={() => setView('review-and-send')}
        />
      ) : view === 'review-audience' ? (
        <ReviewAudienceView
          templateName={selectedAuditTemplate?.title ?? ''}
          selectedStores={pendingAudienceStores}
          onBack={() => setView('assign-stores')}
          onConfirm={handleSetAudience}
        />
      ) : view === 'audit-detail' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromAuditDetail} />
          {selectedAuditInstance && (
            <AuditDetailView instance={selectedAuditInstance} onViewDetails={handleViewDetails} onViewStore={handleViewStore} />
          )}
        </>
      ) : view === 'audit-config' ? (
        <>
          <CreateTemplateNav onBack={handleBackFromAuditConfig} />
          {selectedAuditInstance && (
            <AuditConfigView
              instance={selectedAuditInstance}
              onHideDetails={handleBackFromAuditConfig}
              onEditAudienceDates={handleEditAudienceDates}
            />
          )}
        </>
      ) : view === 'edit-audience-dates' ? (
        <>
          <CreateTemplateNav onBack={() => setView('audit-config')} />
          {selectedAuditInstance && (
            <EditAudienceDatesView
              instance={selectedAuditInstance}
              onCancel={() => setView('audit-config')}
              onSave={handleSaveAudienceDates}
            />
          )}
        </>
      ) : view === 'store-submission' ? (
        <>
          <CreateTemplateNav onBack={() => setView(role === 'store' ? 'list' : 'audit-detail')} />
          {selectedAuditInstance && (
            <StoreSubmissionView instance={selectedAuditInstance} storeName={selectedStoreName} storeStatus={selectedStoreStatus} />
          )}
        </>
      ) : view === 'reporting' ? (
        <>
          <SecondaryNav
            onNavigateToTemplate={handleNavigateToTemplate}
            onReuseTemplate={handleReuseTemplate}
            onNavigateToAudit={() => setView('list')}
            onNavigateToReporting={() => setView('reporting')}
            reportingActive={true}
          />
          <ReportingDashboard />
        </>
      ) : (
        <>
          <CreateTemplateNav onBack={handleBackFromReviewAndSend} />
          {selectedAuditTemplate && (
            <ReviewAndSendContent
              template={selectedAuditTemplate}
              auditorAssignments={auditorAssignments}
              selfAuditStores={selfAuditStores}
              onAssignAuditors={handleAssignAuditors}
              onAssignStores={handleAssignStores}
              onClearAuditors={handleClearAuditors}
              onClearStores={handleClearStores}
              onSend={handleSendAudit}
              onFormChange={setPendingReviewFormData}
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
