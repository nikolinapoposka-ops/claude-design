import React, { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  { label: 'Branding',    bg: '#b23d59', lightBg: 'rgba(178,61,89,0.15)' },
  { label: 'Merchandise', bg: '#1565c0', lightBg: 'rgba(21,101,192,0.15)' },
  { label: 'Security',    bg: '#004851', lightBg: 'rgba(0,72,81,0.15)' },
  { label: 'Safety',      bg: '#e65100', lightBg: 'rgba(230,81,0,0.15)' },
  { label: 'Operations',  bg: '#2e7d32', lightBg: 'rgba(46,125,50,0.15)' },
];

const SIZES = ['Size S', 'Size M', 'Size L'];

type ConditionalDestination =
  | { type: 'next' }
  | { type: 'question'; sectionId: string; questionId: string };

interface FollowUpTask {
  title: string;
  description: string;
  isPriority: boolean;
  category: string;
  size: string;
}

const EMPTY_FOLLOW_UP_TASK: FollowUpTask = { title: '', description: '', isPriority: false, category: '', size: '' };

interface QuestionOption {
  id: string;
  text: string;
  destination?: ConditionalDestination;
  followUpTask?: FollowUpTask;
  scoreValue?: number;
}

interface FollowUpTaskPanelProps {
  initialTask: FollowUpTask;
  mode: 'create' | 'edit';
  onConfirm: (task: FollowUpTask) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const FollowUpTaskPanel: React.FC<FollowUpTaskPanelProps> = ({ initialTask, mode, onConfirm, onClose, onDelete }) => {
  const [task, setTask] = useState<FollowUpTask>(initialTask);
  const [sizeOpen, setSizeOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setSizeOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <div className="followup-panel-backdrop" onClick={onClose} />
      <div className="followup-panel">
        <div className="followup-panel-header">
          <h2 className="followup-panel-title">Follow-up task</h2>
          <button className="followup-panel-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="followup-panel-body">
          <div className="followup-field">
            <label className="followup-field-label">Title</label>
            <input
              className="followup-field-input"
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
            />
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Description</label>
            <input
              className="followup-field-input"
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Attachment</label>
            <div className="followup-attachment-box">
              <button className="followup-circle-add-btn" aria-label="Add attachment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Priority</label>
            <label className="followup-priority-row">
              <span>Flag this as a priority</span>
              <input
                type="checkbox"
                className="followup-priority-checkbox"
                checked={task.isPriority}
                onChange={(e) => setTask({ ...task, isPriority: e.target.checked })}
              />
            </label>
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Category</label>
            <input
              className="followup-field-input"
              value={task.category}
              onChange={(e) => setTask({ ...task, category: e.target.value })}
            />
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Tags</label>
            <div className="followup-tags-row">
              <button className="followup-circle-add-btn" aria-label="Add tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span className="followup-tags-none">None</span>
            </div>
          </div>
          <div className="followup-field">
            <label className="followup-field-label">Size</label>
            <div className="followup-size-wrap" ref={sizeRef}>
              <button className="followup-size-btn" onClick={() => setSizeOpen((o) => !o)}>
                <span>{task.size || 'None'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {sizeOpen && (
                <div className="followup-size-dropdown">
                  {['None', ...SIZES].map((s) => (
                    <button
                      key={s}
                      className="followup-size-item"
                      onClick={() => { setTask({ ...task, size: s === 'None' ? '' : s }); setSizeOpen(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="followup-divider" />
          <button className="followup-action-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add uploads file
          </button>
          <button className="followup-action-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add question
          </button>
        </div>
        <div className="followup-panel-footer">
          {mode === 'edit' ? (
            <>
              <button className="followup-delete-btn" onClick={onDelete}>Delete</button>
              <button className="followup-confirm-btn" onClick={() => onConfirm(task)}>Done</button>
            </>
          ) : (
            <>
              <button className="followup-cancel-btn" onClick={onClose}>Cancel</button>
              <button className="followup-confirm-btn" onClick={() => onConfirm(task)}>Add task to question</button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
  required: boolean;
  hasConditionalLogic?: boolean;
  includeInScoring: boolean;
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

function getDestinationLabel(
  dest: ConditionalDestination | undefined,
  sections: Section[],
  sectionIndex: number,
): string {
  if (!dest || dest.type === 'next') return 'Continue to next';
  const secIdx = sections.findIndex((s) => s.id === dest.sectionId);
  if (secIdx === -1) return 'Continue to next';
  const sec = sections[secIdx];
  const qIdx = sec.questions.findIndex((q) => q.id === dest.questionId);
  if (qIdx === -1) return 'Continue to next';
  const qNum = qIdx + 1;
  const title = sec.questions[qIdx].title;
  if (secIdx === sectionIndex) return `Q${qNum}. ${title}`;
  return `S${secIdx + 1} → Q${qNum}. ${title}`;
}

const createQuestion = (): Question => ({
  id: `question-${Date.now()}`,
  title: 'Untitled question',
  options: [
    { id: `opt-${Date.now()}-1`, text: 'Option 1' },
    { id: `opt-${Date.now()}-2`, text: 'Option 2' },
  ],
  required: false,
  includeInScoring: false,
});

interface QuestionEditorProps {
  question: Question;
  index: number;
  sections: Section[];
  sectionIndex: number;
  onTitleChange: (t: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleRequired: () => void;
  onAddOption: () => void;
  onDeleteOption: (id: string) => void;
  onOptionTextChange: (id: string, text: string) => void;
  onDestinationChange: (optionId: string, dest: ConditionalDestination) => void;
  onToggleConditionalLogic: () => void;
  onSetFollowUpTask: (optionId: string, task: FollowUpTask) => void;
  onDeleteFollowUpTask: (optionId: string) => void;
  onToggleIncludeInScoring: () => void;
  onSetScoreValue: (optionId: string, value: number | undefined) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question, index, sections, sectionIndex,
  onTitleChange, onDelete, onDuplicate,
  onToggleRequired, onAddOption, onDeleteOption, onOptionTextChange,
  onDestinationChange, onToggleConditionalLogic,
  onSetFollowUpTask, onDeleteFollowUpTask,
  onToggleIncludeInScoring, onSetScoreValue,
}) => {
  const [openDropdownOptId, setOpenDropdownOptId] = useState<string | null>(null);
  const [followUpPanelOptId, setFollowUpPanelOptId] = useState<string | null>(null);
  const [followUpPanelMode, setFollowUpPanelMode] = useState<'create' | 'edit'>('create');
  const [draftTask, setDraftTask] = useState<FollowUpTask>(EMPTY_FOLLOW_UP_TASK);
  const [scoringExpanded, setScoringExpanded] = useState(false);

  const questionIndex = sections[sectionIndex]?.questions.findIndex((q) => q.id === question.id) ?? -1;
  const questionsInSection = sections[sectionIndex]?.questions.slice(questionIndex + 1) ?? [];
  const otherSections = sections
    .map((s, i) => ({ section: s, sIdx: i }))
    .filter(({ sIdx }) => sIdx !== sectionIndex);

  return (
    <div className="question-editor">
      <div className="section-drag-handle">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <circle cx="7" cy="5" r="1.3" /><circle cx="13" cy="5" r="1.3" />
          <circle cx="7" cy="10" r="1.3" /><circle cx="13" cy="10" r="1.3" />
          <circle cx="7" cy="15" r="1.3" /><circle cx="13" cy="15" r="1.3" />
        </svg>
      </div>
      <div className="question-editor-inner">
        {/* Number + actions */}
        <div className="question-top-row">
          <span className="question-number">{index + 1}.</span>
          <div className="question-top-actions">
            <button className="question-action-btn" aria-label="Duplicate question" onClick={onDuplicate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
            </button>
            <button className="question-action-btn question-action-btn--danger" aria-label="Delete question" onClick={onDelete}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Title + type */}
        <div className="question-fields-row">
          <div className="question-field-group question-field-group--title">
            <label className="question-field-label">Question title</label>
            <div className="question-title-input-wrap">
              <input
                className="question-title-input"
                value={question.title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <button className="question-img-btn" aria-label="Add image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div className="question-field-group question-field-group--type">
            <label className="question-field-label">Question type</label>
            <button className="question-type-btn">
              <span>Multiple choice</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="question-options">
          {question.options.map((opt) => {
            const isNext = !opt.destination || opt.destination.type === 'next';
            return (
              <React.Fragment key={opt.id}>
              <div className="question-option-row">
                <div className="option-radio-circle" />
                <div className="option-input-wrap">
                  <input
                    className="option-input"
                    value={opt.text}
                    onChange={(e) => onOptionTextChange(opt.id, e.target.value)}
                  />
                  <button className="option-action-btn" aria-label="Mark correct">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
                <button
                  className={`option-action-btn${opt.followUpTask ? ' option-action-btn--active' : ''}`}
                  aria-label="Add follow-up task"
                  onClick={() => { setDraftTask(opt.followUpTask ?? EMPTY_FOLLOW_UP_TASK); setFollowUpPanelMode(opt.followUpTask ? 'edit' : 'create'); setFollowUpPanelOptId(opt.id); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                  </svg>
                </button>
                <button className="option-action-btn" aria-label="Remove option" onClick={() => onDeleteOption(opt.id)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                {question.hasConditionalLogic && (
                  <div className="option-routing-wrap">
                    <button
                      className="option-routing-btn"
                      onClick={() => setOpenDropdownOptId(openDropdownOptId === opt.id ? null : opt.id)}
                    >
                      <span>{getDestinationLabel(opt.destination, sections, sectionIndex)}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                    {openDropdownOptId === opt.id && (
                      <>
                        <div className="option-routing-overlay" onClick={() => setOpenDropdownOptId(null)} />
                        <div className="option-routing-panel">
                          <div className="option-routing-panel-title">Choose where this answer should go</div>
                          <div
                            className={`option-routing-next-row${isNext ? ' option-routing-item--selected' : ''}`}
                            onClick={() => { onDestinationChange(opt.id, { type: 'next' }); setOpenDropdownOptId(null); }}
                          >
                            <span>Next</span>
                            {isNext && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          {questionsInSection.length > 0 && (
                            <>
                              <div className="option-routing-group-header">Question in this section</div>
                              {questionsInSection.map((q, i) => {
                                const qNum = questionIndex + 2 + i;
                                const isSelected = opt.destination?.type === 'question' && opt.destination.questionId === q.id;
                                return (
                                  <div
                                    key={q.id}
                                    className={`option-routing-item${isSelected ? ' option-routing-item--selected' : ''}`}
                                    onClick={() => {
                                      onDestinationChange(opt.id, { type: 'question', sectionId: sections[sectionIndex].id, questionId: q.id });
                                      setOpenDropdownOptId(null);
                                    }}
                                  >
                                    Q{qNum}. {q.title}
                                  </div>
                                );
                              })}
                            </>
                          )}
                          {otherSections.length > 0 && (
                            <>
                              <div className="option-routing-group-header">Other sections</div>
                              {otherSections.map(({ section, sIdx }) => (
                                <React.Fragment key={section.id}>
                                  <div className="option-routing-section-name">S{sIdx + 1}. {section.title}</div>
                                  {section.questions.map((q, qi) => {
                                    const isSelected = opt.destination?.type === 'question' && opt.destination.questionId === q.id;
                                    return (
                                      <div
                                        key={q.id}
                                        className={`option-routing-item${isSelected ? ' option-routing-item--selected' : ''}`}
                                        onClick={() => {
                                          onDestinationChange(opt.id, { type: 'question', sectionId: section.id, questionId: q.id });
                                          setOpenDropdownOptId(null);
                                        }}
                                      >
                                        Q{qi + 1}. {q.title}
                                      </div>
                                    );
                                  })}
                                </React.Fragment>
                              ))}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {opt.followUpTask && (
                <div className="option-followup-row">
                  <span className="option-followup-arrow">↳</span>
                  <div className="option-followup-content">
                    <span className="option-followup-label">Associated follow-up task</span>
                    <span className="option-followup-title">{opt.followUpTask.title}</span>
                  </div>
                  <div className="option-followup-actions">
                    <button
                      className="option-action-btn"
                      aria-label="Edit follow-up task"
                      onClick={() => { setDraftTask(opt.followUpTask!); setFollowUpPanelMode('edit'); setFollowUpPanelOptId(opt.id); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className="option-action-btn option-action-btn--danger"
                      aria-label="Delete follow-up task"
                      onClick={() => onDeleteFollowUpTask(opt.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer: add options + settings */}
        <div className="question-footer-row">
          <div className="question-footer-left">
            <button className="question-ghost-btn" onClick={onAddOption}>Add option</button>
            <span className="question-or-text">or</span>
            <button className="question-ghost-btn">Add other</button>
          </div>
          <div className="question-footer-right">
            <button className="question-rule-btn" onClick={onToggleConditionalLogic}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              {question.hasConditionalLogic ? 'Remove rule' : 'Add rule'}
            </button>
            <label className="question-required-label">
              <span className="toggle-switch">
                <input type="checkbox" checked={question.required} onChange={onToggleRequired} />
                <span className="toggle-slider"></span>
              </span>
              Required
            </label>
          </div>
        </div>

        {/* Scoring */}
        <div className="question-scoring-row" onClick={() => setScoringExpanded(v => !v)}>
          <span className="question-scoring-label">Scoring setting</span>
          {question.includeInScoring
            ? <span className="scoring-enabled-badge">Enabled</span>
            : <span className="scoring-disabled-badge">Disabled</span>}
          <svg style={{ marginLeft: 'auto', transform: scoringExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        {scoringExpanded && (
          <div className="scoring-expanded-body">
            <div className="scoring-include-row">
              <div className="scoring-include-text">
                <span className="scoring-include-label">Include in scoring</span>
                <span className="scoring-include-desc">When enabled, this question contributes to the final audit score</span>
              </div>
              <label className="toggle-switch toggle-switch--lg" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={question.includeInScoring}
                  onChange={onToggleIncludeInScoring}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {question.includeInScoring && (
              <div className="scoring-values-section">
                <span className="scoring-values-label">Scoring values</span>
                <div className="scoring-values-grid">
                  {question.options.map((opt, idx) => (
                    <div className="scoring-value-cell" key={opt.id}>
                      <span className="scoring-value-option-label">{opt.text || `Option ${idx + 1}`}</span>
                      <input
                        type="number"
                        className="scoring-value-input"
                        value={opt.scoreValue ?? ''}
                        placeholder="0"
                        onChange={(e) => onSetScoreValue(opt.id, e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {followUpPanelOptId && (
        <FollowUpTaskPanel
          initialTask={draftTask}
          mode={followUpPanelMode}
          onConfirm={(task) => { onSetFollowUpTask(followUpPanelOptId, task); setFollowUpPanelOptId(null); }}
          onClose={() => setFollowUpPanelOptId(null)}
          onDelete={() => { onDeleteFollowUpTask(followUpPanelOptId); setFollowUpPanelOptId(null); }}
        />
      )}
    </div>
  );
};

interface CreateTemplateContentProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSave: (data: { title: string; category: string; isPriority: boolean; description: string; sections: Array<{ title: string; questions: string[] }> }) => void;
  onDelete?: () => void;
}

const CreateTemplateContent: React.FC<CreateTemplateContentProps> = ({ title, onTitleChange, onSave, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [size, setSize] = useState('');
  const [category, setCategory] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  const handleAddSection = () => {
    setSections((prev) => [...prev, { id: `section-${Date.now()}`, title: 'Untitled section', questions: [] }]);
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateSection = (id: string) => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const orig = prev[idx];
      const copy: Section = {
        id: `section-${Date.now()}`,
        title: orig.title,
        questions: orig.questions.map((q) => ({
          ...q,
          id: `question-${Date.now()}-${Math.random()}`,
          options: q.options.map((o) => ({ ...o, id: `opt-${Date.now()}-${Math.random()}` })),
        })),
      };
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
    });
  };

  const handleSectionTitleChange = (id: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const handleAddQuestion = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => s.id === sectionId ? { ...s, questions: [...s.questions, createQuestion()] } : s)
    );
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) => s.id === sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) } : s)
    );
  };

  const handleDuplicateQuestion = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const idx = s.questions.findIndex((q) => q.id === questionId);
        if (idx === -1) return s;
        const orig = s.questions[idx];
        const copy: Question = {
          ...orig,
          id: `question-${Date.now()}`,
          options: orig.options.map((o) => ({ ...o, id: `opt-${Date.now()}-${Math.random()}` })),
        };
        return { ...s, questions: [...s.questions.slice(0, idx + 1), copy, ...s.questions.slice(idx + 1)] };
      })
    );
  };

  const handleQuestionTitleChange = (sectionId: string, questionId: string, newTitle: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map((q) => q.id === questionId ? { ...q, title: newTitle } : q) }
          : s
      )
    );
  };

  const handleToggleRequired = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map((q) => q.id === questionId ? { ...q, required: !q.required } : q) }
          : s
      )
    );
  };

  const handleAddOption = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: [...q.options, { id: `opt-${Date.now()}`, text: `Option ${q.options.length + 1}` }] }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleDeleteOption = (sectionId: string, questionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, questions: s.questions.map((q) => q.id === questionId ? { ...q, options: q.options.filter((o) => o.id !== optionId) } : q) }
          : s
      )
    );
  };

  const handleOptionTextChange = (sectionId: string, questionId: string, optionId: string, text: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: q.options.map((o) => o.id === optionId ? { ...o, text } : o) }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleToggleConditionalLogic = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      hasConditionalLogic: !q.hasConditionalLogic,
                      options: q.hasConditionalLogic
                        ? q.options.map((o) => ({ ...o, destination: undefined }))
                        : q.options,
                    }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleDestinationChange = (sectionId: string, questionId: string, optionId: string, dest: ConditionalDestination) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: q.options.map((o) => o.id === optionId ? { ...o, destination: dest } : o) }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleSetFollowUpTask = (sectionId: string, questionId: string, optionId: string, task: FollowUpTask) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: q.options.map((o) => o.id === optionId ? { ...o, followUpTask: task } : o) }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleDeleteFollowUpTask = (sectionId: string, questionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: q.options.map((o) => o.id === optionId ? { ...o, followUpTask: undefined } : o) }
                  : q
              ),
            }
          : s
      )
    );
  };

  const handleToggleIncludeInScoring = (sectionId: string, questionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, includeInScoring: !q.includeInScoring } : q
              ),
            }
          : s
      )
    );
  };

  const handleSetScoreValue = (sectionId: string, questionId: string, optionId: string, value: number | undefined) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, options: q.options.map((o) => o.id === optionId ? { ...o, scoreValue: value } : o) }
                  : q
              ),
            }
          : s
      )
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setSizeOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = CATEGORIES.find((c) => c.label === category);
  return (
    <>
      <div className="template-page">

        {/* Draft badge + Preview */}
        <div className="template-topbar">
          <span className="draft-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Draft
          </span>
          <button className="template-preview-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Preview
          </button>
        </div>

        <div className="template-layout">

          {/* Left column */}
          <div className="template-main">

            {/* Store audit details card */}
            <div className="template-card">
              <h2 className="template-card-title">Store audit details</h2>

              <div className="form-field">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="form-field">
                <label className="form-label">Attachments</label>
                <button className="attachment-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add attachment
                </button>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Size</label>
                <div style={{ position: 'relative' }} ref={sizeRef}>
                  <button className="form-select" onClick={() => setSizeOpen((o) => !o)}>
                    <span className={size ? undefined : 'form-select-placeholder'}>{size || 'Not selected'}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {sizeOpen && (
                    <div className="card-dropdown" style={{ width: '100%' }}>
                      {SIZES.map((s) => (
                        <button key={s} className="card-dropdown-item" onClick={() => { setSize(s); setSizeOpen(false); }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sections */}
            {sections.length === 0 ? (
              <div className="no-sections-card">
                <h3 className="no-sections-title">No sections yet</h3>
                <p className="no-sections-text">Sections help organize your audit into logical groups</p>
                <button className="btn btn--filled btn--pill" data-test-id="btn-add-section" onClick={handleAddSection}>
                  Add section
                </button>
              </div>
            ) : (
              <>
                {sections.map((section, sIdx) => (
                  <div key={section.id} className="section-editor">
                    <div className="section-drag-handle">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                        <circle cx="7" cy="5" r="1.5" /><circle cx="13" cy="5" r="1.5" />
                        <circle cx="7" cy="10" r="1.5" /><circle cx="13" cy="10" r="1.5" />
                        <circle cx="7" cy="15" r="1.5" /><circle cx="13" cy="15" r="1.5" />
                      </svg>
                    </div>
                    <div className="section-card">
                      <div className="section-header">
                        <input
                          className="section-title-input"
                          value={section.title}
                          onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                        />
                        <span className="section-question-count">{section.questions.length} question{section.questions.length !== 1 ? 's' : ''}</span>
                        <button className="section-icon-btn" aria-label="Duplicate section" onClick={() => handleDuplicateSection(section.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                          </svg>
                        </button>
                        <button className="section-icon-btn" aria-label="Delete section" onClick={() => handleDeleteSection(section.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="section-body">
                        {section.questions.map((question, qIdx) => (
                          <QuestionEditor
                            key={question.id}
                            question={question}
                            index={qIdx}
                            sections={sections}
                            sectionIndex={sIdx}
                            onTitleChange={(t) => handleQuestionTitleChange(section.id, question.id, t)}
                            onDelete={() => handleDeleteQuestion(section.id, question.id)}
                            onDuplicate={() => handleDuplicateQuestion(section.id, question.id)}
                            onToggleRequired={() => handleToggleRequired(section.id, question.id)}
                            onAddOption={() => handleAddOption(section.id, question.id)}
                            onDeleteOption={(optId) => handleDeleteOption(section.id, question.id, optId)}
                            onOptionTextChange={(optId, text) => handleOptionTextChange(section.id, question.id, optId, text)}
                            onToggleConditionalLogic={() => handleToggleConditionalLogic(section.id, question.id)}
                            onDestinationChange={(optId, dest) => handleDestinationChange(section.id, question.id, optId, dest)}
                            onSetFollowUpTask={(optId, task) => handleSetFollowUpTask(section.id, question.id, optId, task)}
                            onDeleteFollowUpTask={(optId) => handleDeleteFollowUpTask(section.id, question.id, optId)}
                            onToggleIncludeInScoring={() => handleToggleIncludeInScoring(section.id, question.id)}
                            onSetScoreValue={(optId, value) => handleSetScoreValue(section.id, question.id, optId, value)}
                          />
                        ))}
                        <button className="add-question-btn" onClick={() => handleAddQuestion(section.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add question
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn--outlined btn--pill" style={{ alignSelf: 'flex-start' }} onClick={handleAddSection}>
                  + Add section
                </button>
              </>
            )}

          </div>

          {/* Right sidebar */}
          <div className="template-sidebar">

            {/* Labels card */}
            <div className="template-card">
              <h2 className="template-card-title">Labels</h2>

              <label className="checkbox-row">
                <input type="checkbox" className="checkbox-input" checked={isPriority} onChange={(e) => setIsPriority(e.target.checked)} />
                <span className="checkbox-label">Mark as priority</span>
              </label>

              <div className="form-field" style={{ marginTop: 16 }}>
                <label className="form-label">Category</label>
                <div style={{ position: 'relative' }} ref={categoryRef}>
                  <button className="form-select" onClick={() => setCategoryOpen((o) => !o)}>
                    {selectedCategory ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: selectedCategory.lightBg, color: selectedCategory.bg, borderRadius: 999, padding: '2px 8px 2px 10px', fontWeight: 700, fontSize: 13 }}>
                        {category}
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); setCategory(''); setCategoryOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className="form-select-placeholder">Not selected</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                  {categoryOpen && (
                    <div className="card-dropdown" style={{ width: '100%' }}>
                      {CATEGORIES.map((c) => (
                        <button key={c.label} className="card-dropdown-item" onClick={() => { setCategory(c.label); setCategoryOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c.bg, flexShrink: 0 }} />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 0 }}>
                <label className="form-label">Tags</label>
                <button className="form-select">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="form-select-placeholder">Not selected</span>
                </button>
              </div>
            </div>

            {/* Automated translations card */}
            <div className="template-card">
              <h2 className="template-card-title">Automated translations</h2>

              <label className="checkbox-row">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-label">Enable automated translations</span>
              </label>

              <div className="ava-row">
                <div className="ava-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <div className="ava-text">
                  <p className="ava-title">Powered by Ava, your Quinyx AI Assistant</p>
                  <p className="ava-desc">
                    AI can make mistakes. We always strive to provide you with the best translations.{' '}
                    <a href="#" className="ava-link">Learn more</a>
                  </p>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: 16, marginBottom: 0 }}>
                <label className="form-label">Select languages</label>
                <button className="form-select">
                  <span style={{ flex: 1 }}></span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fixed bottom save bar */}
      <div className="template-bottom-bar">
        <button className="btn btn--filled btn--pill" data-test-id="btn-save-template" onClick={() => onSave({ title, category, isPriority, description, sections: sections.map((s) => ({ title: s.title, questions: s.questions.map((q) => q.title) })) })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          Save as reusable template
        </button>
        <div className="template-more-btn-wrapper" ref={menuRef}>
          {dropdownOpen && (
            <div className="card-dropdown card-dropdown--right">
              <button
                className="card-dropdown-item card-dropdown-item--danger"
                onClick={() => { setDropdownOpen(false); onDelete?.(); }}
              >
                Delete draft
              </button>
            </div>
          )}
          <button className="template-more-btn" onClick={() => setDropdownOpen((o) => !o)}>···</button>
        </div>
      </div>
    </>
  );
};

export default CreateTemplateContent;
