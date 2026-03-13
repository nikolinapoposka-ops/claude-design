import React, { useState } from 'react';
import type { AuditInstance } from '../App';

interface Props {
  instance: AuditInstance;
  onBack: () => void;
  onSubmit: () => void;
  onComplete: () => void;
  storeName?: string;
  completedBy?: { name: string; initials: string };
}

function shortSummary(question: string): string {
  // Strip trailing question mark and truncate
  const q = question.replace(/\?$/, '');
  const words = q.split(' ');
  return words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '');
}

const MobileAuditView: React.FC<Props> = ({ instance, onBack, onSubmit, onComplete, storeName, completedBy }) => {
  const sections = instance.sectionData ?? [];
  const [sectionIdx, setSectionIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>({});
  const [tasks, setTasks] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  if (sections.length === 0) return null;

  const currentSection = sections[sectionIdx];
  const currentQuestion = currentSection.questions[questionIdx];
  const key = `s${sectionIdx}q${questionIdx}`;
  const currentAnswer = answers[key] ?? null;
  const currentTask = tasks[key] ?? null;
  const hasPhoto = photos[key] ?? false;
  const currentComment = comments[key] ?? null;

  const handleAnswer = (val: 'yes' | 'no') => {
    setAnswers(a => ({ ...a, [key]: val }));
  };

  const handleContinue = () => {
    if (questionIdx < currentSection.questions.length - 1) {
      setQuestionIdx(q => q + 1);
    } else if (sectionIdx < sections.length - 1) {
      setSectionIdx(s => s + 1);
      setQuestionIdx(0);
    } else {
      setSubmitted(true);
    }
  };

  const handleAddPhoto = () => {
    setPhotos(p => ({ ...p, [key]: true }));
  };

  const handleDeleteTask = () => {
    setTasks(t => { const next = { ...t }; delete next[key]; return next; });
    setPhotos(p => { const next = { ...p }; delete next[key]; return next; });
  };

  const handleOpenComment = () => {
    setCommentDraft(comments[key] ?? '');
    setShowCommentInput(true);
  };

  const handleSaveComment = () => {
    if (commentDraft.trim()) {
      setComments(c => ({ ...c, [key]: commentDraft.trim() }));
    } else {
      setComments(c => { const next = { ...c }; delete next[key]; return next; });
    }
    setShowCommentInput(false);
    setCommentDraft('');
  };

  const handleDeleteComment = () => {
    setComments(c => { const next = { ...c }; delete next[key]; return next; });
  };

  /* ── Results screen (Figma 17:4916) ── */
  if (showResults) {
    // Score calculations
    const totalQ = sections.reduce((sum, s) => sum + s.questions.length, 0);
    const yesCount = Object.values(answers).filter(a => a === 'yes').length;
    const overallScore = totalQ > 0 ? Math.round((yesCount / totalQ) * 100) : 0;
    const sectionScores = sections.map((sec, si) => {
      const total = sec.questions.length;
      const yes = sec.questions.filter((_, qi) => answers[`s${si}q${qi}`] === 'yes').length;
      return { title: sec.title, score: total > 0 ? Math.round((yes / total) * 100) : 0 };
    });
    const taskCount = Object.keys(tasks).length;

    // Gauge math (same as StoreSubmissionView ScoreGauge)
    const R = 68, CX = 100, CY = 98;
    const scoreRatio = overallScore / 100;
    const tickOuter = R + 11, tickInner = R + 4;
    const ticks = Array.from({ length: 29 }, (_, i) => {
      const angleDeg = 180 - (i / 28) * 180;
      const angleRad = (angleDeg * Math.PI) / 180;
      return {
        x1: CX + tickInner * Math.cos(angleRad),
        y1: CY - tickInner * Math.sin(angleRad),
        x2: CX + tickOuter * Math.cos(angleRad),
        y2: CY - tickOuter * Math.sin(angleRad),
      };
    });
    const bgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`;
    const endAngleDeg = 180 - scoreRatio * 180;
    const endAngleRad = (endAngleDeg * Math.PI) / 180;
    const eX = (CX + R * Math.cos(endAngleRad)).toFixed(2);
    const eY = (CY - R * Math.sin(endAngleRad)).toFixed(2);
    const largeArc = scoreRatio > 0.5 ? 1 : 0;
    const fillPath = scoreRatio > 0 ? `M ${CX - R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${eX} ${eY}` : '';

    // Completed on timestamp
    const now = new Date();
    const completedOn =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(',', '') +
      ' - ' +
      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    const displayStoreName = storeName ?? instance.stores[0] ?? '—';
    const displayCompletedBy = completedBy ?? { name: 'Store Manager', initials: 'SM' };

    return (
      <div className="ma-shell">
        {/* Header */}
        <div className="ma-header">
          <button className="ma-header-icon" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="ma-header-logo">
            <svg viewBox="0 0 88 24" fill="white" height="18">
              <text x="0" y="19" fontFamily="sans-serif" fontWeight="700" fontSize="18">Quinyx</text>
            </svg>
          </div>
          <button className="ma-header-icon" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="ma-subheader">
          <button className="ma-back-btn" onClick={onComplete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="ma-subheader-actions">
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="ma-results-body">
          {/* Tag pills */}
          <div className="ma-results-tags">
            {instance.isPriority && (
              <span className="ma-results-tag ma-results-tag--priority">🚩 Priority</span>
            )}
            {instance.category && (
              <span className="ma-results-tag ma-results-tag--category">{instance.category}</span>
            )}
          </div>

          {/* Audit title */}
          <h2 className="ma-results-audit-title">{instance.title}</h2>

          {/* Score card */}
          <div className="ma-results-card">
            {/* Gauge */}
            <svg viewBox="0 0 200 115" className="ma-results-gauge-svg">
              {ticks.map((t, i) => (
                <line key={i}
                  x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)}
                  x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)}
                  stroke="#dde3e8" strokeWidth="1.5" strokeLinecap="round" />
              ))}
              <path d={bgPath} fill="none" stroke="#e8ecef" strokeWidth="10" strokeLinecap="round" />
              {fillPath && (
                <path d={fillPath} fill="none" stroke="#2d5f6b" strokeWidth="10" strokeLinecap="round" />
              )}
              {scoreRatio > 0 && (
                <circle cx={eX} cy={eY} r="5.5" fill="white" stroke="#2d5f6b" strokeWidth="2.5" />
              )}
              <text x={CX} y={CY - 24} textAnchor="middle" fontSize="26" fontWeight="700" fill="#1a2936" fontFamily="Poppins, sans-serif">
                {overallScore}%
              </text>
              <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill="#8fa5b2" fontFamily="Nunito, sans-serif">
                Overall Score
              </text>
            </svg>

            {/* Section scores */}
            <div className="ma-results-sections">
              {sectionScores.map((sec, i) => (
                <div key={i} className="ma-results-section-row">
                  <span className="ma-results-section-name">{sec.title}</span>
                  <span className="ma-results-section-pct">{sec.score}%</span>
                </div>
              ))}
            </div>

            <div className="ma-divider" />

            {/* Follow-up tasks */}
            <div className="ma-results-followup">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="ma-results-followup-label">{taskCount} Follow up task{taskCount !== 1 ? 's' : ''}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Status / details card */}
          <div className="ma-results-card">
            <div className="ma-results-detail-label">Status</div>
            <div className="ma-results-status-pill">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
              </svg>
              Completed
            </div>

            <div className="ma-results-detail-label" style={{ marginTop: 16 }}>Location</div>
            <div className="ma-results-detail-value">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {displayStoreName}
            </div>

            <div className="ma-results-detail-label">Completed by</div>
            <div className="ma-results-detail-value">
              <span className="ma-results-avatar">{displayCompletedBy.initials}</span>
              {displayCompletedBy.name}
            </div>

            <div className="ma-results-detail-label">Completed on</div>
            <div className="ma-results-detail-value ma-results-detail-bold">{completedOn}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Submitted / Review screen ── */
  if (submitted) {
    return (
      <div className="ma-shell">
        {/* Header */}
        <div className="ma-header">
          <button className="ma-header-icon" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="ma-header-logo">
            <svg viewBox="0 0 88 24" fill="white" height="18">
              <text x="0" y="19" fontFamily="sans-serif" fontWeight="700" fontSize="18">Quinyx</text>
            </svg>
          </div>
          <button className="ma-header-icon" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </button>
        </div>

        {/* Sub-header */}
        <div className="ma-subheader">
          <button className="ma-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="ma-subheader-actions">
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button className="ma-icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* Completion message */}
        <div className="ma-review-message">
          <div className="ma-review-title">You're all set! 🎉</div>
          <div className="ma-review-sub">
            All questions have been completed.<br />
            Take one final look to make sure everything is correct before confirming.
          </div>
        </div>

        {/* Preview section */}
        <div className="ma-preview-section">
          {sections.map((section, si) => (
            <div key={si} className="ma-preview-section-group">
              <div className="ma-preview-section-title">{section.title}</div>
              {section.questions.map((question, qi) => {
                const qKey = `s${si}q${qi}`;
                const answer = answers[qKey] ?? null;
                const task = tasks[qKey] ?? null;
                const comment = comments[qKey] ?? null;
                const hasPhotoItem = photos[qKey] ?? false;
                return (
                  <div key={qi} className="ma-preview-item">
                    <div className="ma-preview-item-header">
                      <span className="ma-preview-q-num">{qi + 1}.</span>
                      <span className="ma-preview-q-text">{question}</span>
                    </div>
                    <div className="ma-preview-item-meta">
                      {answer !== null && (
                        <span className={`ma-preview-answer ma-preview-answer--${answer}`}>
                          {answer === 'yes' ? '✓ Yes' : '✗ No'}
                        </span>
                      )}
                      {!answer && <span className="ma-preview-answer ma-preview-answer--unanswered">—</span>}
                      {task && <span className="ma-preview-tag ma-preview-tag--task">Task</span>}
                      {comment && <span className="ma-preview-tag ma-preview-tag--comment">Comment</span>}
                      {hasPhotoItem && <span className="ma-preview-tag ma-preview-tag--photo">Photo</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="ma-footer ma-footer--review">
          <button className="ma-complete-btn" onClick={() => setShowResults(true)}>Complete</button>
          <button className="ma-more-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── Question screen ── */
  return (
    <div className="ma-shell">

      {/* Header */}
      <div className="ma-header">
        <button className="ma-header-icon" onClick={() => {}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="ma-header-logo">
          <svg viewBox="0 0 88 24" fill="white" height="18">
            <text x="0" y="19" fontFamily="sans-serif" fontWeight="700" fontSize="18">Quinyx</text>
          </svg>
        </div>
        <button className="ma-header-icon" onClick={() => {}}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </button>
      </div>

      {/* Sub-header */}
      <div className="ma-subheader">
        <button className="ma-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="ma-subheader-actions">
          <button className="ma-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className="ma-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="ma-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="ma-body">
        <div className="ma-progress">
          Section {sectionIdx + 1} of {sections.length} · {currentSection.title} · Question {questionIdx + 1}
        </div>
        <div className="ma-divider" />

        {/* Question */}
        <div className="ma-question-label">{questionIdx + 1}. Yes/No question</div>
        <div className="ma-question-text">{currentQuestion}</div>

        {/* Radio options */}
        <div className="ma-radio-group">
          <button
            className={`ma-radio-option${currentAnswer === 'yes' ? ' ma-radio-option--selected' : ''}`}
            onClick={() => handleAnswer('yes')}
          >
            <span className="ma-radio-circle">
              {currentAnswer === 'yes' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="ma-radio-label">Yes</span>
          </button>
          <button
            className={`ma-radio-option${currentAnswer === 'no' ? ' ma-radio-option--selected' : ''}`}
            onClick={() => handleAnswer('no')}
          >
            <span className="ma-radio-circle">
              {currentAnswer === 'no' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="ma-radio-label">No</span>
          </button>
        </div>

        {/* Action row */}
        <div className="ma-action-row">
          <button className="ma-action-icon" onClick={handleAddPhoto} title="Add photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <button className={`ma-action-icon${currentComment ? ' ma-action-icon--active' : ''}`} onClick={handleOpenComment} title="Add comment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          {!currentTask && (
            <button
              className="ma-add-task-btn"
              onClick={() => setTasks(t => ({ ...t, [key]: `Rectify: ${shortSummary(currentQuestion)}` }))}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add task
            </button>
          )}
        </div>

        {/* Comment input (shown when comment icon clicked) */}
        {showCommentInput && (
          <div className="ma-comment-input-wrap">
            <textarea
              className="ma-comment-textarea"
              placeholder="Add a comment…"
              value={commentDraft}
              onChange={e => setCommentDraft(e.target.value)}
              autoFocus
              rows={3}
            />
            <div className="ma-comment-input-actions">
              <button className="ma-comment-cancel" onClick={() => { setShowCommentInput(false); setCommentDraft(''); }}>Cancel</button>
              <button className="ma-comment-save" onClick={handleSaveComment}>Save</button>
            </div>
          </div>
        )}

        {/* Comment card (shown when comment saved) */}
        {currentComment && !showCommentInput && (
          <div className="ma-comment-card">
            <div className="ma-comment-card-body">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="ma-comment-text">{currentComment}</span>
            </div>
            <div className="ma-comment-card-actions">
              <button className="ma-task-icon-btn" onClick={handleOpenComment} title="Edit comment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button className="ma-task-icon-btn ma-task-icon-btn--delete" onClick={handleDeleteComment} title="Delete comment">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Photo (shown when camera icon clicked) */}
        {hasPhoto && (
          <div className="ma-photo-thumb" style={{ marginBottom: 12 }}>
            <div className="ma-photo-placeholder" />
          </div>
        )}

        {/* Task card (shown when + Add task clicked) */}
        {currentTask && (
          <div className="ma-task-card">
            <div className="ma-task-row">
              <div className="ma-task-info">
                <span className="ma-task-badge">Task</span>
                <span className="ma-task-text">{currentTask}</span>
              </div>
              <div className="ma-task-actions">
                <button className="ma-task-icon-btn" title="Edit task">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button className="ma-task-icon-btn ma-task-icon-btn--delete" onClick={handleDeleteTask} title="Delete task">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      <div className="ma-footer">
        <button
          className="ma-continue-btn"
          onClick={handleContinue}
          disabled={currentAnswer === null}
        >
          {sectionIdx === sections.length - 1 && questionIdx === currentSection.questions.length - 1
            ? 'Submit audit'
            : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default MobileAuditView;
