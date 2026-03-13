import React, { useState } from 'react';

// ── Task types ────────────────────────────────────────────────────────────────

type TaskStatus = 'in-progress' | 'not-started' | 'completed';

interface TaskItem {
  id: string;
  assignee: string;        // name or "Store 011 - Unassigned"
  assigneeInitials: string;
  isUnassigned?: boolean;
  title: string;
  startDate?: string;
  dueDate: string;
  isOverdue?: boolean;
  status: TaskStatus;
  progress?: { done: number; total: number }; // e.g. 1/3 people completed
  isPriority?: boolean;
}

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't1',
    assignee: 'Johanna Josefsson',
    assigneeInitials: 'JJ',
    title: 'Redress window display',
    startDate: 'Jul 20',
    dueDate: 'Jul 30',
    isOverdue: true,
    status: 'in-progress',
    isPriority: true,
  },
  {
    id: 't2',
    assignee: 'Store 011 - Unassigned',
    assigneeInitials: '11',
    isUnassigned: true,
    title: 'Redress window display',
    dueDate: 'Jul 31',
    isOverdue: true,
    status: 'not-started',
    isPriority: true,
  },
  {
    id: 't3',
    assignee: 'Johanna Josefsson',
    assigneeInitials: 'JJ',
    title: 'Redress window display',
    dueDate: 'Jul 30',
    isOverdue: true,
    status: 'not-started',
    isPriority: false,
  },
  {
    id: 't4',
    assignee: '1/3 people completed',
    assigneeInitials: '',
    title: 'Redress window display',
    startDate: 'Sep 10',
    dueDate: 'Sep 20',
    status: 'in-progress',
    progress: { done: 1, total: 3 },
    isPriority: false,
  },
  {
    id: 't5',
    assignee: 'Johanna Josefsson',
    assigneeInitials: 'JJ',
    title: 'Redress window display',
    startDate: 'Jul 20',
    dueDate: 'Jul 30',
    isOverdue: true,
    status: 'in-progress',
    isPriority: false,
  },
  {
    id: 't6',
    assignee: 'Store 011 - Unassigned',
    assigneeInitials: '11',
    isUnassigned: true,
    title: 'Redress window display',
    startDate: 'Oct 10',
    dueDate: 'Nov 10',
    status: 'not-started',
    isPriority: true,
  },
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  'in-progress': 'In progress',
  'not-started': 'Not started',
  'completed': 'Completed',
};

function TaskCard({ task }: { task: TaskItem }) {
  return (
    <div className="sch-task-card">
      <div className="sch-task-card-top">
        <div className="sch-task-assignee-row">
          {task.progress ? (
            <div className="sch-task-group-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <circle cx="17" cy="7" r="3" /><path d="M21 21v-2a3 3 0 0 0-3-3" />
              </svg>
            </div>
          ) : task.isUnassigned ? (
            <div className="sch-task-avatar sch-task-avatar-unassigned">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          ) : (
            <div className="sch-task-avatar">{task.assigneeInitials}</div>
          )}
          <span className={`sch-task-assignee-name${task.isUnassigned ? ' unassigned' : ''}`}>
            {task.progress ? task.assignee : task.assignee}
          </span>
        </div>
        {task.isPriority && (
          <span className="sch-task-priority-flag">
            <svg width="12" height="14" viewBox="0 0 12 16" fill="#c0392b">
              <path d="M1 1h10v9L6 7.5 1 10V1z" />
            </svg>
          </span>
        )}
      </div>

      <div className="sch-task-title">{task.title}</div>

      <div className="sch-task-dates">
        {task.startDate && (
          <>
            <span className={task.isOverdue ? 'sch-task-date-overdue' : ''}>Start {task.startDate}</span>
            <span className="sch-task-date-arrow"> → </span>
          </>
        )}
        <span className={task.isOverdue ? 'sch-task-date-overdue' : ''}>
          {task.isOverdue && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#e62600" style={{ marginRight: 3, verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" /><circle cx="12" cy="16" r="1" fill="white" />
            </svg>
          )}
          Due {task.dueDate}
        </span>
      </div>

      {task.progress ? (
        <div className="sch-task-progress-bar-wrap">
          <div className="sch-task-progress-bar">
            <div
              className="sch-task-progress-fill"
              style={{ width: `${(task.progress.done / task.progress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <div className={`sch-task-status-badge sch-task-status-${task.status}`}>
          {task.status === 'in-progress' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4 }}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          {task.status === 'not-started' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4 }}>
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          {STATUS_LABEL[task.status]}
        </div>
      )}
    </div>
  );
}

// ── Unified side panel (accordion) ───────────────────────────────────────────

function ShiftChecklistContent({
  selected,
  onChecklistUpdate,
}: {
  selected: SelectedShift;
  onChecklistUpdate: (shiftId: string, checklist: ChecklistItem[]) => void;
}) {
  const { shift, employeeName, employeeInitials } = selected;
  const colors = SHIFT_COLORS[shift.type];
  const [checklist, setChecklist] = useState<ChecklistItem[]>(shift.checklist ?? []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ChecklistItemType>('yes-no');
  const [newRequired, setNewRequired] = useState(false);

  // Re-sync when selected shift changes
  React.useEffect(() => {
    setChecklist(shift.checklist ?? []);
    setShowAddForm(false);
  }, [shift.id]);

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const item: ChecklistItem = {
      id: `ci-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      required: newRequired,
      completed: false,
    };
    const updated = [...checklist, item];
    setChecklist(updated);
    onChecklistUpdate(shift.id, updated);
    setNewTitle('');
    setNewType('yes-no');
    setNewRequired(false);
    setShowAddForm(false);
  };

  const handleToggle = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined }
        : item
    );
    setChecklist(updated);
    onChecklistUpdate(shift.id, updated);
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const startLabel = `${String(shift.startHour).padStart(2, '0')}:00`;
  const endLabel = `${String(shift.endHour).padStart(2, '0')}:00`;

  return (
    <div className="sch-accordion-content">
      {/* Shift badge + employee */}
      <div className="sch-accordion-shift-info">
        <div className="sch-detail-shift-badge" style={{ borderLeft: `4px solid ${colors.border}`, background: colors.bg, color: colors.text }}>
          <span className="sch-detail-shift-time">{startLabel} – {endLabel}</span>
          <span className="sch-detail-shift-label">{shift.label}</span>
        </div>
        <div className="sch-detail-employee" style={{ paddingLeft: 0, paddingBottom: 0, borderBottom: 'none' }}>
          <div className="sch-task-avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{employeeInitials}</div>
          <span className="sch-detail-employee-name">{employeeName}</span>
        </div>
      </div>

      {/* Checklist header */}
      <div className="sch-detail-section-header" style={{ paddingTop: 10 }}>
        <span className="sch-detail-section-title">Checklist</span>
        {checklist.length > 0 && (
          <span className="sch-detail-progress-pill">{completedCount}/{checklist.length} done</span>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="sch-detail-checklist">
          {checklist.map(item => (
            <div key={item.id} className={`sch-detail-item${item.completed ? ' completed' : ''}`}>
              <button
                className={`sch-detail-check-btn${item.completed ? ' checked' : ''}`}
                onClick={() => handleToggle(item.id)}
              >
                {item.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <div className="sch-detail-item-body">
                <div className="sch-detail-item-title">{item.title}</div>
                <div className="sch-detail-item-meta">
                  <span className={`sch-detail-type-badge sch-detail-type-${item.type}`}>
                    {item.type === 'yes-no' ? 'Yes / No' : '1–5 Rating'}
                  </span>
                  {item.required && <span className="sch-detail-required-badge">Required</span>}
                  {item.completedAt && <span className="sch-detail-timestamp">✓ {item.completedAt}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {checklist.length === 0 && !showAddForm && (
        <div className="sch-detail-empty">No checklist items yet</div>
      )}

      {showAddForm ? (
        <div className="sch-detail-add-form">
          <input
            className="sch-detail-input"
            placeholder="Checklist item title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            autoFocus
          />
          <div className="sch-detail-form-row">
            <div className="sch-detail-type-toggle">
              <button className={`sch-detail-type-btn${newType === 'yes-no' ? ' active' : ''}`} onClick={() => setNewType('yes-no')}>Yes / No</button>
              <button className={`sch-detail-type-btn${newType === 'rating' ? ' active' : ''}`} onClick={() => setNewType('rating')}>1–5 Rating</button>
            </div>
            <label className="sch-detail-required-toggle">
              <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} />
              Required
            </label>
          </div>
          <div className="sch-detail-form-actions">
            <button className="sch-detail-cancel-btn" onClick={() => { setShowAddForm(false); setNewTitle(''); }}>Cancel</button>
            <button className="sch-detail-save-btn" onClick={handleAddItem} disabled={!newTitle.trim()}>Add item</button>
          </div>
        </div>
      ) : (
        <button className="sch-detail-add-btn" onClick={() => setShowAddForm(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add checklist item
        </button>
      )}
    </div>
  );
}

function UnifiedSidePanel({
  employees,
  selectedShift,
  onClose,
  onChecklistUpdate,
}: {
  employees: Employee[];
  selectedShift: SelectedShift | null;
  onClose: () => void;
  onChecklistUpdate: (shiftId: string, checklist: ChecklistItem[]) => void;
}) {
  const [shiftOpen, setShiftOpen] = useState(true);
  const [hqOpen, setHqOpen] = useState(true);
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const overdue = MOCK_TASKS.filter(t => t.isOverdue).length;
  const unassigned = MOCK_TASKS.filter(t => t.isUnassigned).length;

  // Auto-expand the shift row when clicked in the timeline
  React.useEffect(() => {
    if (selectedShift) {
      setShiftOpen(true);
      setExpandedShiftId(selectedShift.shift.id);
    }
  }, [selectedShift?.shift.id]);

  // Flatten all non-fullDay shifts into a list with employee info
  const allShiftRows = employees.flatMap(emp =>
    emp.shifts
      .filter(s => !s.isFullDay)
      .map(s => ({ shift: s, employeeName: emp.name, employeeInitials: emp.initials }))
  );

  return (
    <div className="sch-unified-panel">
      <div className="sch-unified-header">
        <span className="sch-tasks-title">Tasks</span>
        <button className="sch-tasks-close-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Shift tasks card */}
      <div className="sch-accordion-card sch-accordion-card--shift">
        <button className="sch-accordion-header" onClick={() => setShiftOpen(v => !v)}>
          <div className="sch-accordion-header-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="sch-accordion-header-label-group">
              <span>Shift tasks</span>
              <span className="sch-accordion-header-sub">Today's schedule</span>
            </div>
            <span className="sch-accordion-count">{allShiftRows.length}</span>
          </div>
          <svg className={`sch-accordion-chevron${shiftOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {shiftOpen && (
          <div className="sch-accordion-body">
            <div className="sch-shift-list">
              {allShiftRows.map(({ shift, employeeName, employeeInitials }) => {
                const colors = SHIFT_COLORS[shift.type];
                const isExpanded = expandedShiftId === shift.id;
                const startLabel = `${String(shift.startHour).padStart(2, '0')}:00`;
                const endLabel = `${String(shift.endHour).padStart(2, '0')}:00`;
                const checklistCount = shift.checklist?.length ?? 0;
                const completedCount = shift.checklist?.filter(i => i.completed).length ?? 0;

                return (
                  <div key={shift.id} className={`sch-shift-row${isExpanded ? ' expanded' : ''}`}>
                    <button
                      className="sch-shift-row-header"
                      onClick={() => setExpandedShiftId(isExpanded ? null : shift.id)}
                    >
                      <div className="sch-shift-row-indicator" style={{ background: colors.border }} />
                      <div className="sch-shift-row-info">
                        <span className="sch-shift-row-label">{shift.label}</span>
                        <span className="sch-shift-row-employee">{employeeName}</span>
                        <span className="sch-shift-row-time">{startLabel}–{endLabel}</span>
                      </div>
                      {checklistCount > 0 && (
                        <span className="sch-shift-row-progress">
                          {completedCount}/{checklistCount}
                        </span>
                      )}
                      <svg className={`sch-shift-row-chevron${isExpanded ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <ShiftChecklistContent
                        selected={{ shift, employeeName, employeeInitials }}
                        onChecklistUpdate={onChecklistUpdate}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* HQ tasks card */}
      <div className="sch-accordion-card sch-accordion-card--hq">
        <button className="sch-accordion-header" onClick={() => setHqOpen(v => !v)}>
          <div className="sch-accordion-header-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <div className="sch-accordion-header-label-group">
              <span>HQ tasks</span>
              <span className="sch-accordion-header-sub">Assigned from HQ</span>
            </div>
            <span className="sch-accordion-count">{MOCK_TASKS.length}</span>
          </div>
          <svg className={`sch-accordion-chevron${hqOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {hqOpen && (
          <div className="sch-accordion-body">
            <div className="sch-tasks-summary" style={{ paddingTop: 10 }}>
              <span className="sch-tasks-pill sch-tasks-pill-overdue">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#e62600">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" /><circle cx="12" cy="16" r="1" fill="white" />
                </svg>
                {overdue} overdue
              </span>
              <span className="sch-tasks-pill sch-tasks-pill-unassigned">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                {unassigned} unassigned
              </span>
            </div>
            <div className="sch-tasks-list" style={{ maxHeight: 340, padding: '4px 12px 12px' }}>
              {MOCK_TASKS.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

type ShiftType = 'office' | 'sales' | 'hr' | 'vacation' | 'undisclosed';
type ChecklistItemType = 'yes-no' | 'rating';

interface ChecklistItem {
  id: string;
  title: string;
  type: ChecklistItemType;
  required: boolean;
  completed?: boolean;
  rating?: number; // 1–5
  completedAt?: string;
}

interface Shift {
  id: string;
  startHour: number; // 0–23
  endHour: number;   // 0–24
  type: ShiftType;
  hours?: number;
  label?: string;
  isFullDay?: boolean;
  checklist?: ChecklistItem[];
}

interface SelectedShift {
  shift: Shift;
  employeeName: string;
  employeeInitials: string;
}

interface Employee {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  scheduledHours: number;
  totalHours: number;
  overtimeHours: number;
  shifts: Shift[];
}

const SHIFT_COLORS: Record<ShiftType, { bg: string; border: string; text: string }> = {
  office:      { bg: '#e6f0ef', border: '#1a7a7c', text: '#1a7a7c' },
  sales:       { bg: '#f5f0d6', border: '#8a7200', text: '#6b5800' },
  hr:          { bg: '#ede8f5', border: '#7b5ea7', text: '#5c3f8a' },
  vacation:    { bg: '#b23d59', border: '#8a1c36', text: '#ffffff' },
  undisclosed: { bg: '#dce6ec', border: '#7a9bae', text: '#465d6d' },
};

const MOCK_DATE = new Date(2022, 11, 24); // Fri 24 Dec 2022

const EMPLOYEES: Employee[] = [
  {
    id: 'charles',
    name: 'Charles-Haden Savage',
    initials: 'CS',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'charles-office', startHour: 8, endHour: 17, type: 'office', hours: 4.0, label: 'Office', checklist: [
        { id: 'co-1', title: 'Check window display', type: 'yes-no', required: true, completed: false },
        { id: 'co-2', title: 'Restock entrance shelf', type: 'yes-no', required: false, completed: false },
        { id: 'co-3', title: 'Rate store cleanliness', type: 'rating', required: false, completed: false },
      ]},
      { id: 'charles-und', startHour: 13, endHour: 17, type: 'undisclosed', hours: 4.0, label: 'Und...' },
    ],
  },
  {
    id: 'mabel',
    name: 'Mabel Mora',
    initials: 'MM',
    scheduledHours: 4,
    totalHours: 4,
    overtimeHours: 0,
    shifts: [
      { id: 'mabel-office', startHour: 8, endHour: 12, type: 'office', hours: 4.0, label: 'Office' },
    ],
  },
  {
    id: 'howard',
    name: 'Howard Morris',
    initials: 'HM',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'howard-sales', startHour: 8, endHour: 17, type: 'sales', hours: 8.0, label: 'Sales', checklist: [
        { id: 'hs-1', title: 'Open cash register', type: 'yes-no', required: true, completed: true, completedAt: '08:12' },
        { id: 'hs-2', title: 'Check promotional signage', type: 'yes-no', required: false, completed: true, completedAt: '08:20' },
        { id: 'hs-3', title: 'Rate floor layout', type: 'rating', required: false, completed: false },
      ]},
    ],
  },
  {
    id: 'borivoje',
    name: 'Borivoje Ristic',
    initials: 'BR',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'borivoje-vac', startHour: 0, endHour: 24, type: 'vacation', hours: undefined, label: 'Vacation - half day', isFullDay: true },
    ],
  },
  {
    id: 'oliver',
    name: 'Oliver Putnam',
    initials: 'OP',
    scheduledHours: 4,
    totalHours: 4,
    overtimeHours: 0,
    shifts: [
      { id: 'oliver-office', startHour: 8, endHour: 17, type: 'office', hours: 8.0, label: 'Office' },
      { id: 'oliver-sales', startHour: 8, endHour: 12, type: 'sales', hours: 4.0, label: 'Sales' },
    ],
  },
  {
    id: 'ursula',
    name: 'Ursula Heller',
    initials: 'UH',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'ursula-office', startHour: 8, endHour: 17, type: 'office', hours: 8.0, label: 'Office' },
    ],
  },
  {
    id: 'ndidi',
    name: 'Ndidi Idoko',
    initials: 'NI',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'ndidi-hr', startHour: 8, endHour: 17, type: 'hr', hours: 8.0, label: 'HR', checklist: [
        { id: 'ni-1', title: 'Review shift handover notes', type: 'yes-no', required: true, completed: true, completedAt: '08:05' },
        { id: 'ni-2', title: 'Confirm team attendance', type: 'yes-no', required: true, completed: true, completedAt: '08:10' },
        { id: 'ni-3', title: 'Rate team readiness', type: 'rating', required: false, completed: true, completedAt: '08:15' },
      ]},
    ],
  },
  {
    id: 'henrik',
    name: 'Henrik Köhl',
    initials: 'HK',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'henrik-hr', startHour: 8, endHour: 17, type: 'hr', hours: 8.0, label: 'HR' },
    ],
  },
  {
    id: 'axel',
    name: 'Axel Larsson',
    initials: 'AL',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'axel-hr', startHour: 8, endHour: 17, type: 'hr', hours: 8.0, label: 'HR' },
    ],
  },
  {
    id: 'nikola',
    name: 'Nikola Spasic',
    initials: 'NS',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'nikola-hr', startHour: 8, endHour: 17, type: 'hr', hours: 8.0, label: 'HR' },
    ],
  },
  {
    id: 'nikolina',
    name: 'Nikolina Poposka',
    initials: 'NP',
    scheduledHours: 8,
    totalHours: 8,
    overtimeHours: 0,
    shifts: [
      { id: 'nikolina-hr', startHour: 8, endHour: 17, type: 'hr', hours: 8.0, label: 'HR' },
    ],
  },
];

const UNASSIGNED_SHIFTS: Shift[] = [
  { id: 'unassigned-office', startHour: 13, endHour: 17, type: 'office', hours: 4.0, label: 'Office' },
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ShiftBlock({ shift, onClick, isSelected }: { shift: Shift; onClick?: () => void; isSelected?: boolean }) {
  const colors = SHIFT_COLORS[shift.type];
  const leftPct = (shift.startHour / 24) * 100;
  const widthPct = ((shift.endHour - shift.startHour) / 24) * 100;
  const checklistCount = shift.checklist?.length ?? 0;
  const completedCount = shift.checklist?.filter(i => i.completed).length ?? 0;

  if (shift.isFullDay) {
    return (
      <div
        className={`schedule-shift schedule-shift-fullday${isSelected ? ' selected' : ''}`}
        style={{ left: 0, right: 0, backgroundColor: colors.bg, borderLeft: `3px solid ${colors.border}`, color: colors.text }}
        onClick={onClick}
      >
        <span className="schedule-shift-icon">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M5 2v4M11 2v4M1 8h14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <span className="schedule-shift-time">00:00–00:00</span>
        <span className="schedule-shift-label">{shift.label}</span>
      </div>
    );
  }

  const startLabel = `${String(shift.startHour).padStart(2, '0')}:00`;
  const endLabel = `${String(shift.endHour).padStart(2, '0')}:00`;

  return (
    <div
      className={`schedule-shift${isSelected ? ' selected' : ''}`}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: colors.bg,
        borderTop: `3px solid ${colors.border}`,
        color: colors.text,
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <div className="schedule-shift-time">{startLabel} - {endLabel} {shift.hours}</div>
      <div className="schedule-shift-label-row">
        <span className="schedule-shift-label">{shift.label}</span>
        {checklistCount > 0 && (() => {
          const allDone = completedCount === checklistCount;
          const noDone = completedCount === 0;
          const badgeClass = allDone
            ? 'schedule-shift-checklist-badge done'
            : noDone
            ? 'schedule-shift-checklist-badge pending'
            : 'schedule-shift-checklist-badge partial';
          return (
            <span className={badgeClass}>
              {allDone ? (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              )}
              {allDone ? 'Done' : `${completedCount}/${checklistCount}`}
            </span>
          );
        })()}
      </div>
    </div>
  );
}

const ScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(MOCK_DATE);
  const [activeView, setActiveView] = useState<'day' | 'week'>('day');
  const [showTasksPanel, setShowTasksPanel] = useState(true);
  const [selectedShift, setSelectedShift] = useState<SelectedShift | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);

  const handleShiftClick = (shift: Shift, employeeName: string, employeeInitials: string) => {
    if (shift.isFullDay) return;
    setSelectedShift(prev =>
      prev?.shift.id === shift.id ? null : { shift, employeeName, employeeInitials }
    );
  };

  const handleChecklistUpdate = (shiftId: string, checklist: ChecklistItem[]) => {
    setEmployees(prev => prev.map(emp => ({
      ...emp,
      shifts: emp.shifts.map(s => s.id === shiftId ? { ...s, checklist } : s),
    })));
    setSelectedShift(prev => prev && prev.shift.id === shiftId
      ? { ...prev, shift: { ...prev.shift, checklist } }
      : prev
    );
  };

  const weekNum = getWeekNumber(currentDate);
  const displayDate = formatDisplayDate(currentDate);

  const goToPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="schedule-view">
      {/* Toolbar */}
      <div className="schedule-toolbar">
        <div className="schedule-toolbar-left">
          <div className="schedule-employee-chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span>7</span>
          </div>
          <button className="schedule-toolbar-icon-btn" title="Messages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 8l10 7 10-7" />
            </svg>
          </button>
          <button className="schedule-toolbar-icon-btn" title="Filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2" fill="white" /><circle cx="16" cy="12" r="2" fill="white" /><circle cx="10" cy="18" r="2" fill="white" />
            </svg>
          </button>
        </div>

        <div className="schedule-toolbar-center">
          <span className="schedule-week-label">W {weekNum}</span>
          <button className="schedule-nav-arrow" onClick={goToPrev} title="Previous day">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="schedule-today-btn" onClick={goToToday}>Today</button>
          <button className="schedule-nav-arrow" onClick={goToNext} title="Next day">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <span className="schedule-date-label">{displayDate}</span>
        </div>

        <div className="schedule-toolbar-right">
          <div className="schedule-view-toggle">
            <button
              className={`schedule-view-toggle-btn${activeView === 'day' ? ' active' : ''}`}
              onClick={() => setActiveView('day')}
              title="Single day"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="12" y1="4" x2="12" y2="22" />
              </svg>
            </button>
            <button
              className={`schedule-view-toggle-btn${activeView === 'week' ? ' active' : ''}`}
              onClick={() => setActiveView('week')}
              title="Week"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
                <line x1="8" y1="4" x2="8" y2="22" /><line x1="16" y1="4" x2="16" y2="22" />
              </svg>
            </button>
            <button className="schedule-view-toggle-btn" title="Month">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
                <line x1="7" y1="4" x2="7" y2="22" /><line x1="12" y1="4" x2="12" y2="22" /><line x1="17" y1="4" x2="17" y2="22" />
              </svg>
            </button>
            <button className="schedule-view-toggle-btn" title="Table view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            </button>
            <button className="schedule-view-toggle-btn" title="Gantt">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="14" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="17" y2="18" />
              </svg>
            </button>
          </div>
          <button className="schedule-toolbar-icon-btn" title="Statistics">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          <button className="schedule-toolbar-add-btn" title="Add shift">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="schedule-toolbar-icon-btn" title="Filter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          <button
            className={`schedule-toolbar-icon-btn${showTasksPanel ? ' active' : ''}`}
            title="Employee hub tasks"
            onClick={() => setShowTasksPanel(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
          <button className="schedule-toolbar-icon-btn" title="More options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid + Tasks Panel */}
      <div className="schedule-grid-wrapper">

        {/* Left sidebar */}
        <div className="schedule-sidebar">
          {/* Corner cell above sidebar */}
          <div className="schedule-sidebar-header" />

          {/* Unassigned shifts row */}
          <div className="schedule-sidebar-row schedule-sidebar-row-unassigned">
            <button className="schedule-expand-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <span className="schedule-unassigned-label">Unassigned shifts</span>
          </div>

          {/* Employee rows */}
          {employees.map((emp) => (
            <div key={emp.id} className="schedule-sidebar-row schedule-sidebar-row-employee">
              <div className="schedule-avatar">{emp.initials}</div>
              <div className="schedule-employee-info">
                <div className="schedule-employee-name">{emp.name}</div>
                <div className="schedule-employee-hours">
                  {emp.scheduledHours}/{emp.totalHours}{' '}
                  <span className="schedule-hours-parens">({emp.overtimeHours})</span>{' '}
                  <span className="schedule-hours-pct">(100%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="schedule-timeline-scroll">
          <div className="schedule-timeline">
            {/* Hour header */}
            <div className="schedule-hour-header">
              {HOURS.map((h) => (
                <div key={h} className="schedule-hour-cell">{h}</div>
              ))}
            </div>

            {/* Unassigned row */}
            <div className="schedule-timeline-row">
              {HOURS.map((h) => <div key={h} className="schedule-timeline-cell" />)}
              {UNASSIGNED_SHIFTS.map((shift) => (
                <ShiftBlock key={shift.id} shift={shift} />
              ))}
            </div>

            {/* Employee rows */}
            {employees.map((emp) => (
              <div key={emp.id} className="schedule-timeline-row">
                {HOURS.map((h) => <div key={h} className="schedule-timeline-cell" />)}
                {emp.shifts.map((shift) => (
                  <ShiftBlock
                    key={shift.id}
                    shift={shift}
                    isSelected={selectedShift?.shift.id === shift.id}
                    onClick={() => handleShiftClick(shift, emp.name, emp.initials)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Unified tasks panel */}
        {showTasksPanel && (
          <UnifiedSidePanel
            employees={employees}
            selectedShift={selectedShift}
            onClose={() => setShowTasksPanel(false)}
            onChecklistUpdate={handleChecklistUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
