import React from 'react';
import type { AuditInstance } from '../App';
import { useRole, AREA_MANAGER_AUDITOR_ID } from '../context/RoleContext';
import AuditChat from './AuditChat';


const MOCK_SECTIONS = [
  { id: 1, title: 'Maintenance & Safety' },
  { id: 2, title: 'Customer service' },
  { id: 3, title: 'Branding' },
];

const MOCK_SECTION_SCORES = [
  { title: 'Maintenance & Safety', score: 74 },
  { title: 'Customer service', score: 70 },
  { title: 'Branding', score: 80 },
];

const STATUS_CONFIG: Record<string, { label: string; mod: string }> = {
  'not-started':       { label: 'Not started',       mod: 'not-started' },
  'in-progress':       { label: 'In progress',        mod: 'in-progress' },
  'awaiting-approval': { label: 'Awaiting approval',  mod: 'awaiting-approval' },
  'changes-needed':    { label: 'Changes needed',     mod: 'changes-needed' },
  'completed':         { label: 'Completed',          mod: 'completed' },
  'cancelled':         { label: 'Cancelled',          mod: 'cancelled' },
};

/* ── Score gauge SVG ─────────────────────────────────────── */
const ScoreGauge: React.FC<{ overallScore: number }> = ({ overallScore }) => {
  const R = 68;
  const CX = 100;
  const CY = 98;
  const score = overallScore / 100;

  // Tick marks — 29 lines evenly spaced along the 180° arc
  const tickOuter = R + 11;
  const tickInner = R + 4;
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

  // Background arc: counterclockwise top-half semicircle (left → right)
  const bgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`;

  // Filled arc: sweep (score × 180°) counterclockwise from left
  const endAngleDeg = 180 - score * 180;
  const endAngleRad = (endAngleDeg * Math.PI) / 180;
  const endX = (CX + R * Math.cos(endAngleRad)).toFixed(2);
  const endY = (CY - R * Math.sin(endAngleRad)).toFixed(2);
  const largeArc = score > 0.5 ? 1 : 0;
  const fillPath = `M ${CX - R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${endX} ${endY}`;

  return (
    <svg viewBox="0 0 200 115" className="store-submission-gauge-svg">
      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)} x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)}
          stroke="#dde3e8" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Arcs */}
      <path d={bgPath} fill="none" stroke="#e8ecef" strokeWidth="10" strokeLinecap="round" />
      <path d={fillPath} fill="none" stroke="#2d5f6b" strokeWidth="10" strokeLinecap="round" />
      {/* Dot at tip */}
      <circle cx={endX} cy={endY} r="5.5" fill="white" stroke="#2d5f6b" strokeWidth="2.5" />
      {/* Labels */}
      <text x={CX} y={CY - 24} textAnchor="middle" fontSize="26" fontWeight="700" fill="#1a2936" fontFamily="Poppins, sans-serif">
        {overallScore}%
      </text>
      <text x={CX} y={CY - 8} textAnchor="middle" fontSize="11" fill="#8fa5b2" fontFamily="Nunito, sans-serif">
        Overall Score
      </text>
    </svg>
  );
};

interface Props {
  instance: AuditInstance;
  storeName: string;
  storeStatus: string;
}

const StoreSubmissionView: React.FC<Props> = ({ instance, storeName, storeStatus }) => {
  const { role } = useRole();
  const statusConfig = STATUS_CONFIG[storeStatus] ?? STATUS_CONFIG['not-started'];
  const isCompleted = storeStatus === 'completed';

  // Find the auditor assigned to this specific store (only when audience === 'auditors')
  const assignedAuditor = instance.audience === 'auditors' && instance.auditorAssignments
    ? (instance.auditorAssignments.find((a) => a.stores.includes(storeName))?.auditor ?? null)
    : null;

  // Chat visibility: hide when viewer = audit executor (self-created auditor audit)
  const isAuditorFlow = instance.audience === 'auditors';
  const assignedAuditorId = assignedAuditor?.id;
  const viewerIsExecutor = role === 'areaManager' && assignedAuditorId === AREA_MANAGER_AUDITOR_ID;
  const isSelfCreated = !!instance.createdBy && instance.createdBy === assignedAuditorId;
  const showChat = !(viewerIsExecutor && isSelfCreated);
  const chatVariant: 'store' | 'auditor' = isAuditorFlow ? 'auditor' : 'store';

  const displaySections = instance.sectionData
    ? instance.sectionData.map((s, idx) => ({ id: idx + 1, title: s.title }))
    : MOCK_SECTIONS;

  const sectionScores = MOCK_SECTION_SCORES;

  const description = instance.description ||
    'Comprehensive fire safety compliance check including extinguishers, exits, and alarm systems. This audit ensures all stores meet regulatory requirements and maintain a safe environment for staff and customers.';

  return (
    <div className="store-submission-page">
      <div className="store-submission-columns">

        {/* ── Left panel ── */}
        <div className="store-submission-left">

          {/* Badges + title */}
          <div className="store-submission-title-block">
            {instance.isPriority && (
              <span className="detail-badge detail-badge--priority">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                  <polyline points="4 4 4 20"></polyline>
                  <polygon points="4 4 20 9 4 14"></polygon>
                </svg>
                Priority
              </span>
            )}
            <h1 className="store-submission-title">{instance.title}</h1>
          </div>

          {/* Score gauge + follow-up tasks — completed only */}
          {isCompleted && (
            <div className="store-submission-score-card">
              {/* Gauge + section scores */}
              <div className="store-submission-score-body">
                <ScoreGauge overallScore={78} />
                <div className="store-submission-score-sections">
                  {sectionScores.map((s) => (
                    <div key={s.title} className="store-submission-score-row">
                      <span className="store-submission-score-section-title">{s.title}</span>
                      <span className="store-submission-score-pct">{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Follow-up tasks — inside same card, separated by divider */}
              <div className="store-submission-followup-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="store-submission-followup-label">3 Follow up tasks</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          )}

          {/* Sections card */}
          <div className="store-submission-sections-card">
            {displaySections.map((section, idx) => (
              <div
                key={section.id}
                className={`store-submission-section-row${idx < displaySections.length - 1 ? ' store-submission-section-row--bordered' : ''}`}
              >
                <span className="store-submission-section-label">Section {section.id}</span>
                <span className="store-submission-section-title">{section.title}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <p className="store-submission-description">{description}</p>

          {/* Attachments */}
          <div className="store-submission-meta-block">
            <span className="store-submission-meta-label">Attachments</span>
            <span className="store-submission-meta-link">1 file</span>
            <div className="store-submission-attachment-card">
              <div className="store-submission-attachment-img">
                {isCompleted ? (
                  <div className="store-submission-attachment-photo" />
                ) : (
                  <div className="store-submission-attachment-file-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#8fa5b2" strokeWidth="1.5" width="24" height="24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              <div className="store-submission-attachment-body">
                <span className="store-submission-attachment-name">QR codes</span>
                <div className="store-submission-attachment-chips">
                  <span className="store-submission-chip store-submission-chip--pink">Product</span>
                  <span className="store-submission-chip store-submission-chip--dark">Tag</span>
                </div>
              </div>
              <div className="store-submission-attachment-footer">
                <button className="store-submission-more-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>
                <span className="store-submission-attachment-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  274
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="store-submission-meta-block">
            <span className="store-submission-meta-label">Tags</span>
            <div className="store-submission-tags-row">
              <span className="detail-tag-pill">Badge</span>
              <span className="detail-tag-pill">Badge</span>
            </div>
          </div>

          {/* Size */}
          <div className="store-submission-meta-block">
            <span className="store-submission-meta-label">Size</span>
            {isCompleted && <span className="store-submission-size-value">Small</span>}
          </div>

          {/* Discussion */}
          <AuditChat visible={showChat} variant={chatVariant} />
        </div>

        {/* ── Right sidebar ── */}
        <div className="store-submission-sidebar">

          {/* Status */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Status</span>
            <span className={`store-submission-status-badge store-submission-status-badge--${statusConfig.mod}`}>
              {isCompleted && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="9 12 11 14 15 10"></polyline>
                </svg>
              )}
              {statusConfig.label}
            </span>
          </div>

          {/* Location */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Location</span>
            <span className="store-submission-sidebar-value">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
              {storeName}
            </span>
          </div>

          {/* Auditor — only when one is assigned to this store */}
          {assignedAuditor && (
            <div className="store-submission-sidebar-field">
              <span className="store-submission-sidebar-label">Auditor</span>
              <span className="store-submission-sidebar-value">
                <div className="avatar-sm">{assignedAuditor.initials}</div>
                {assignedAuditor.name}
              </span>
            </div>
          )}

          {/* Completed by + Completed on — completed only */}
          {isCompleted && (
            <>
              <div className="store-submission-sidebar-field">
                <span className="store-submission-sidebar-label">Completed by</span>
                <span className="store-submission-sidebar-value">
                  <div className="avatar-sm">AB</div>
                  Roger Harris
                </span>
              </div>
              <div className="store-submission-sidebar-field">
                <span className="store-submission-sidebar-label">Completed on</span>
                <span className="store-submission-sidebar-value store-submission-sidebar-value--bold">
                  14 Nov 2024 - 09:04
                </span>
              </div>
            </>
          )}

          {/* Due date/time */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Due date/time</span>
            <span className="store-submission-sidebar-value">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {instance.dueDate || '03 Oct 2025 - 19:30'}
            </span>
          </div>

          {/* Send out date/time */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Send out date/time</span>
            <span className="store-submission-sidebar-value">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {instance.sendOutDate || '03 Oct 2025 - 19:30'}
            </span>
          </div>

          {/* Sender */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Sender</span>
            <span className="store-submission-sidebar-value store-submission-sidebar-value--bold">
              Selma Cameron
            </span>
          </div>

          {/* Approvers */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Approvers</span>
            <div className="store-submission-approvers-pill">1 person</div>
          </div>

        </div>
      </div>

      {/* Bottom bar — store recipient OR assigned auditor can start/continue */}
      {(role === 'store' || viewerIsExecutor) && (storeStatus === 'not-started' || storeStatus === 'in-progress') && (
        <div className="audit-detail-bottom-bar">
          <button className="btn btn--filled btn--pill">
            {storeStatus === 'in-progress' ? 'Continue audit' : 'Start audit'}
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreSubmissionView;
