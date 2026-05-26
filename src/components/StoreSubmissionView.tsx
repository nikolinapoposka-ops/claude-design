import React from 'react';
import { Avatar, Badge, Button, Chip, Icon, Stack, Text } from '@quinyx/ui';
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

type BadgeVariant = 'notice' | 'info' | 'positive' | 'negative' | 'warning' | 'brand';

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant; icon: string }> = {
  'not-started':       { label: 'Not started',      variant: 'info',     icon: 'statusNotStarted' },
  'in-progress':       { label: 'In progress',       variant: 'warning',  icon: 'statusInProgress' },
  'awaiting-approval': { label: 'Awaiting approval', variant: 'notice',   icon: 'statusAwaitingApproval' },
  'changes-needed':    { label: 'Changes needed',    variant: 'negative', icon: 'actionRequired' },
  'completed':         { label: 'Completed',         variant: 'positive', icon: 'statusCompleted' },
  'cancelled':         { label: 'Cancelled',         variant: 'negative', icon: 'statusCancelled' },
};

/* ── Score gauge SVG ───────────────────────────────────────────────────────── */
const ScoreGauge: React.FC<{ overallScore: number }> = ({ overallScore }) => {
  const R = 68;
  const CX = 100;
  const CY = 98;
  const score = overallScore / 100;

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

  const bgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`;
  const endAngleDeg = 180 - score * 180;
  const endAngleRad = (endAngleDeg * Math.PI) / 180;
  const endX = (CX + R * Math.cos(endAngleRad)).toFixed(2);
  const endY = (CY - R * Math.sin(endAngleRad)).toFixed(2);
  const largeArc = score > 0.5 ? 1 : 0;
  const fillPath = `M ${CX - R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${endX} ${endY}`;

  return (
    <svg viewBox="0 0 200 115" className="store-submission-gauge-svg">
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1.toFixed(1)} y1={t.y1.toFixed(1)} x2={t.x2.toFixed(1)} y2={t.y2.toFixed(1)}
          stroke="#dde3e8" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <path d={bgPath} fill="none" stroke="#e8ecef" strokeWidth="10" strokeLinecap="round" />
      <path d={fillPath} fill="none" stroke="#2d5f6b" strokeWidth="10" strokeLinecap="round" />
      <circle cx={endX} cy={endY} r="5.5" fill="white" stroke="#2d5f6b" strokeWidth="2.5" />
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
  onStartAudit: () => void;
}

const StoreSubmissionView: React.FC<Props> = ({ instance, storeName, storeStatus, onStartAudit }) => {
  const { role } = useRole();
  const statusConfig = STATUS_CONFIG[storeStatus] ?? STATUS_CONFIG['not-started'];
  const isCompleted = storeStatus === 'completed';

  const assignedAuditor = instance.audience === 'auditors' && instance.auditorAssignments
    ? (instance.auditorAssignments.find((a) => a.stores.includes(storeName))?.auditor ?? null)
    : null;

  const isAuditorFlow = instance.audience === 'auditors';
  const assignedAuditorId = assignedAuditor?.id;
  const viewerIsExecutor = role === 'areaManager' && assignedAuditorId === AREA_MANAGER_AUDITOR_ID;
  const isSelfCreated = !!instance.createdBy && instance.createdBy === assignedAuditorId;
  const showChat = !(viewerIsExecutor && isSelfCreated);
  const chatVariant: 'store' | 'auditor' = isAuditorFlow ? 'auditor' : 'store';

  const displaySections = instance.sectionData
    ? instance.sectionData.map((s, idx) => ({ id: idx + 1, title: s.title }))
    : MOCK_SECTIONS;

  const description = instance.description ||
    'Comprehensive fire safety compliance check including extinguishers, exits, and alarm systems. This audit ensures all stores meet regulatory requirements and maintain a safe environment for staff and customers.';

  return (
    <div className="store-submission-page">
      <div className="store-submission-columns">

        {/* ── Left panel ── */}
        <div className="store-submission-left">

          {/* Title + priority */}
          <Stack direction="column" spacing={2} alignItems="flex-start" style={{ marginBottom: '20px' }}>
            {instance.isPriority && (
              <Badge
                label="Priority"
                variant="notice"
                icon="bannerPriority"
                size="small"
              />
            )}
            <h1 className="store-submission-title">{instance.title}</h1>
          </Stack>

          {/* Score card — completed only */}
          {isCompleted && (
            <div className="store-submission-score-card">
              <div className="store-submission-score-body">
                <ScoreGauge overallScore={78} />
                <div className="store-submission-score-sections">
                  {MOCK_SECTION_SCORES.map((s) => (
                    <div key={s.title} className="store-submission-score-row">
                      <span className="store-submission-score-section-title">{s.title}</span>
                      <span className="store-submission-score-pct">{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="store-submission-followup-row">
                <Icon icon="info" size={16} />
                <span className="store-submission-followup-label">3 Follow up tasks</span>
                <Icon icon="arrowDown" size={16} style={{ marginLeft: 'auto' }} />
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
                    <Icon icon="file" size={24} />
                  </div>
                )}
              </div>
              <div className="store-submission-attachment-body">
                <span className="store-submission-attachment-name">QR codes</span>
                <div className="store-submission-attachment-chips">
                  <Chip data-test-id="tag-product" text="Product" />
                  <Chip data-test-id="tag-tag" text="Tag" />
                </div>
              </div>
              <div className="store-submission-attachment-footer">
                <Button
                  variant="text"
                  intent="utility"
                  size="s"
                  icon="moreHorizontal"
                  aria-label="More options"
                />
                <span className="store-submission-attachment-count">
                  <Icon icon="star" size={14} />
                  274
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="store-submission-meta-block">
            <span className="store-submission-meta-label">Tags</span>
            <Stack direction="row" spacing={1}>
              <Chip data-test-id="tag-badge-1" text="Badge" />
              <Chip data-test-id="tag-badge-2" text="Badge" />
            </Stack>
          </div>

          {/* Size */}
          <div className="store-submission-meta-block">
            <span className="store-submission-meta-label">Size</span>
            {isCompleted && <Text>Small</Text>}
          </div>

          <AuditChat visible={showChat} variant={chatVariant} />
        </div>

        {/* ── Right sidebar ── */}
        <div className="store-submission-sidebar">

          {/* Status */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Status</span>
            <Badge
              label={statusConfig.label}
              variant={statusConfig.variant}
              icon={statusConfig.icon as Parameters<typeof Badge>[0]['icon']}
            />
          </div>

          {/* Location */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Location</span>
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="location" size={15} />
              <Text>{storeName}</Text>
            </Stack>
          </div>

          {/* Auditor */}
          {assignedAuditor && (
            <div className="store-submission-sidebar-field">
              <span className="store-submission-sidebar-label">Auditor</span>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar name={assignedAuditor.name} size="xs" />
                <Text>{assignedAuditor.name}</Text>
              </Stack>
            </div>
          )}

          {/* Completed by / on — completed only */}
          {isCompleted && (
            <>
              <div className="store-submission-sidebar-field">
                <span className="store-submission-sidebar-label">Completed by</span>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar name="Roger Harris" size="xs" />
                  <Text>Roger Harris</Text>
                </Stack>
              </div>
              <div className="store-submission-sidebar-field">
                <span className="store-submission-sidebar-label">Completed on</span>
                <span className="store-submission-sidebar-value store-submission-sidebar-value--bold">14 Nov 2024 - 09:04</span>
              </div>
            </>
          )}

          {/* Due date */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Due date/time</span>
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="clock" size={15} />
              <Text>{instance.dueDate || '03 Oct 2025 - 19:30'}</Text>
            </Stack>
          </div>

          {/* Send out date */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Send out date/time</span>
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon icon="calendar" size={15} />
              <Text>{instance.sendOutDate || '03 Oct 2025 - 19:30'}</Text>
            </Stack>
          </div>

          {/* Sender */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Sender</span>
            <span className="store-submission-sidebar-value store-submission-sidebar-value--bold">Selma Cameron</span>
          </div>

          {/* Approvers */}
          <div className="store-submission-sidebar-field">
            <span className="store-submission-sidebar-label">Approvers</span>
            <Badge label="1 person" variant="info" />
          </div>

        </div>
      </div>

      {/* Bottom CTA bar */}
      {(role === 'store' || viewerIsExecutor) && (storeStatus === 'not-started' || storeStatus === 'in-progress') && (
        <div className="audit-detail-bottom-bar">
          <Button
            text={storeStatus === 'in-progress' ? 'Continue audit' : 'Start audit'}
            variant="filled"
            size="l"
            onClick={onStartAudit}
          />
        </div>
      )}
    </div>
  );
};

export default StoreSubmissionView;
