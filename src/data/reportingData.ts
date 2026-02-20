// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditStatus = 'done' | 'in-progress' | 'not-started';

export interface ReportTemplate {
  id: string;
  name: string;
  category: string;
}

export interface ReportAudit {
  id: string;
  templateId: string;
  name: string;
  date: string;
  status: AuditStatus;
}

export interface ReportArea {
  id: string;
  name: string;
  regionName: string;
}

export interface ReportStore {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  regionName: string;
}

export interface QuestionResult {
  id: string;
  text: string;
  answer: string;
  scoreValue: number;
  maxScore: number;
  isNA: boolean;
  followUpTask?: string;
}

export interface SectionResult {
  name: string;
  score: number; // 0–100
  questions: QuestionResult[];
}

export interface StoreAuditResult {
  storeId: string;
  auditId: string;
  auditor: string;
  date: string;
  status: AuditStatus;
  overallScore: number;
  sections: SectionResult[];
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'tpl-1', name: 'Fire Safety Standard', category: 'Safety' },
  { id: 'tpl-2', name: 'Monthly Operations Review', category: 'Operations' },
  { id: 'tpl-3', name: 'Visual Merchandising Audit', category: 'Branding' },
];

// ─── Audit Instances ─────────────────────────────────────────────────────────

export const REPORT_AUDITS: ReportAudit[] = [
  // Fire Safety Standard
  { id: 'a1', templateId: 'tpl-1', name: 'Safety Audit Q1 2024', date: '2024-03-31', status: 'done' },
  { id: 'a2', templateId: 'tpl-1', name: 'Safety Audit Q2 2024', date: '2024-06-30', status: 'done' },
  { id: 'a3', templateId: 'tpl-1', name: 'Safety Audit Q3 2024', date: '2024-09-30', status: 'done' },
  { id: 'a4', templateId: 'tpl-1', name: 'Safety Audit Q4 2024', date: '2024-12-31', status: 'done' },
  { id: 'a5', templateId: 'tpl-1', name: 'Safety Audit Q1 2025', date: '2025-03-31', status: 'in-progress' },
  // Monthly Operations Review
  { id: 'a6', templateId: 'tpl-2', name: 'Ops Review Jan 2025', date: '2025-01-31', status: 'done' },
  { id: 'a7', templateId: 'tpl-2', name: 'Ops Review Feb 2025', date: '2025-02-28', status: 'done' },
  { id: 'a8', templateId: 'tpl-2', name: 'Ops Review Mar 2025', date: '2025-03-31', status: 'in-progress' },
  // Visual Merchandising Audit
  { id: 'a9',  templateId: 'tpl-3', name: 'VM Audit H1 2024', date: '2024-06-30', status: 'done' },
  { id: 'a10', templateId: 'tpl-3', name: 'VM Audit H2 2024', date: '2024-12-31', status: 'done' },
];

// ─── Org Hierarchy ───────────────────────────────────────────────────────────

export const REPORT_AREAS: ReportArea[] = [
  { id: 'area-wc', name: 'West Coast',  regionName: 'North America' },
  { id: 'area-ec', name: 'East Coast',  regionName: 'North America' },
  { id: 'area-mw', name: 'Midwest',     regionName: 'North America' },
];

export const REPORT_STORES: ReportStore[] = [
  // West Coast (Emily Davis manages this area)
  { id: 'sf',  name: 'San Francisco - Downtown',   areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'la',  name: 'Los Angeles - Westside',      areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'sea', name: 'Seattle - Capitol Hill',      areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'por', name: 'Portland - Pearl District',   areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  // East Coast
  { id: 'ny',  name: 'New York - Manhattan',         areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  { id: 'bos', name: 'Boston - Back Bay',            areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  { id: 'dc',  name: 'Washington DC - Georgetown',  areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  // Midwest
  { id: 'chi', name: 'Chicago - River North',        areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
  { id: 'den', name: 'Denver - LoDo',                areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
  { id: 'min', name: 'Minneapolis - Downtown',       areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
];

// ─── Question Definitions ────────────────────────────────────────────────────

const QUESTION_DEFS: Record<string, Record<string, { text: string; maxScore: number }[]>> = {
  'tpl-1': {
    'Fire Equipment': [
      { text: 'Are all fire extinguishers present and in-date?', maxScore: 4 },
      { text: 'Are hose reels accessible and unobstructed?', maxScore: 4 },
      { text: 'Is the sprinkler system free from visible damage?', maxScore: 4 },
    ],
    'Emergency Exits': [
      { text: 'Are all emergency exit signs illuminated?', maxScore: 4 },
      { text: 'Are emergency exit routes clear of obstructions?', maxScore: 4 },
      { text: 'Are all emergency exit doors fully operational?', maxScore: 4 },
    ],
    'Alarm Systems': [
      { text: 'Have smoke detectors been tested in the last 30 days?', maxScore: 4 },
      { text: 'Is the fire alarm panel free of fault indicators?', maxScore: 4 },
      { text: 'Are all staff aware of evacuation procedures?', maxScore: 4 },
    ],
  },
  'tpl-2': {
    'Stock Management': [
      { text: 'Is stock replenished to correct levels?', maxScore: 4 },
      { text: 'Are out-of-date items removed from shelves?', maxScore: 4 },
      { text: 'Is stock room organised and labelled correctly?', maxScore: 4 },
    ],
    'Customer Service': [
      { text: 'Are staff greeting customers within 30 seconds of entry?', maxScore: 4 },
      { text: 'Is the fitting room wait time under 5 minutes?', maxScore: 4 },
      { text: 'Are staff knowledgeable about current promotions?', maxScore: 4 },
    ],
    'Back Office': [
      { text: 'Is the till reconciliation completed daily?', maxScore: 4 },
      { text: 'Are staff schedules posted and up to date?', maxScore: 4 },
      { text: 'Is the manager\'s log completed for each shift?', maxScore: 4 },
    ],
  },
  'tpl-3': {
    'Window Display': [
      { text: 'Does the window display reflect current campaign?', maxScore: 4 },
      { text: 'Are mannequins dressed per the planogram?', maxScore: 4 },
      { text: 'Is the window clean and free from damage?', maxScore: 4 },
    ],
    'In-Store Display': [
      { text: 'Are all in-store displays correctly positioned?', maxScore: 4 },
      { text: 'Is promotional signage correctly printed and mounted?', maxScore: 4 },
      { text: 'Are display lighting units fully functional?', maxScore: 4 },
    ],
    'Digital Signage': [
      { text: 'Are all digital screens displaying correct content?', maxScore: 4 },
      { text: 'Are screen brightness levels consistent across all units?', maxScore: 4 },
      { text: 'Is digital content scheduled for the correct time slots?', maxScore: 4 },
    ],
  },
};

const SECTION_NAMES: Record<string, string[]> = {
  'tpl-1': ['Fire Equipment', 'Emergency Exits', 'Alarm Systems'],
  'tpl-2': ['Stock Management', 'Customer Service', 'Back Office'],
  'tpl-3': ['Window Display', 'In-Store Display', 'Digital Signage'],
};

// ─── Score Tables ─────────────────────────────────────────────────────────────
// storeId → auditId → [section1Score, section2Score, section3Score]

const SCORES_TPL1: Record<string, Record<string, number[]>> = {
  // West Coast — improving trend overall
  sf:  { a1: [83,87,85], a2: [85,89,87], a3: [88,91,89], a4: [91,93,91], a5: [92,94,92] },
  la:  { a1: [72,74,76], a2: [74,76,78], a3: [78,80,82], a4: [81,83,84], a5: [83,86,87] },
  sea: { a1: [68,71,75], a2: [71,75,77], a3: [76,80,82], a4: [81,84,83], a5: [83,86,83] },
  por: { a1: [88,85,87], a2: [84,82,85], a3: [80,78,82], a4: [76,74,77], a5: [73,71,76] }, // declining
  // East Coast — consistently high
  ny:  { a1: [90,92,91], a2: [91,93,92], a3: [93,94,93], a4: [93,95,93], a5: [94,95,94] },
  bos: { a1: [79,81,80], a2: [80,83,82], a3: [82,84,83], a4: [84,85,84], a5: [85,87,85] },
  dc:  { a1: [75,77,76], a2: [77,79,78], a3: [79,81,80], a4: [81,82,81], a5: [82,84,82] },
  // Midwest — lower baseline, recovering
  chi: { a1: [70,72,74], a2: [72,74,76], a3: [74,76,77], a4: [75,78,78], a5: [77,79,80] },
  den: { a1: [62,65,67], a2: [65,68,69], a3: [68,71,72], a4: [70,73,72], a5: [72,75,74] },
  min: { a1: [65,68,70], a2: [68,72,73], a3: [71,75,76], a4: [75,78,77], a5: [78,81,80] }, // recovering
};

const SCORES_TPL2: Record<string, Record<string, number[]>> = {
  sf:  { a6: [88,84,90], a7: [89,85,91], a8: [90,86,92] },
  la:  { a6: [78,80,76], a7: [79,81,77], a8: [80,82,78] },
  sea: { a6: [82,79,84], a7: [83,80,85], a8: [84,81,86] },
  por: { a6: [74,76,72], a7: [73,75,71], a8: [72,74,70] },
  ny:  { a6: [91,89,93], a7: [92,90,94], a8: [93,91,95] },
  bos: { a6: [83,85,81], a7: [84,86,82], a8: [85,87,83] },
  dc:  { a6: [79,77,81], a7: [80,78,82], a8: [81,79,83] },
  chi: { a6: [75,73,77], a7: [76,74,78], a8: [77,75,79] },
  den: { a6: [68,70,66], a7: [69,71,67], a8: [70,72,68] },
  min: { a6: [72,74,70], a7: [73,75,71], a8: [74,76,72] },
};

const SCORES_TPL3: Record<string, Record<string, number[]>> = {
  sf:  { a9: [85,88,82], a10: [87,90,84] },
  la:  { a9: [79,81,77], a10: [81,83,79] },
  sea: { a9: [76,78,74], a10: [78,80,76] },
  por: { a9: [82,84,80], a10: [80,82,78] },
  ny:  { a9: [92,90,88], a10: [93,91,89] },
  bos: { a9: [80,82,78], a10: [82,84,80] },
  dc:  { a9: [77,79,75], a10: [79,81,77] },
  chi: { a9: [73,75,71], a10: [75,77,73] },
  den: { a9: [65,67,63], a10: [67,69,65] },
  min: { a9: [70,72,68], a10: [72,74,70] },
};

const ALL_SCORES: Record<string, Record<string, Record<string, number[]>>> = {
  'tpl-1': SCORES_TPL1,
  'tpl-2': SCORES_TPL2,
  'tpl-3': SCORES_TPL3,
};

// ─── Auditors ────────────────────────────────────────────────────────────────

const AUDITORS: Record<string, string> = {
  sf: 'Emily Davis', la: 'Emily Davis', sea: 'Emily Davis', por: 'Emily Davis',
  ny: 'John Smith',  bos: 'John Smith', dc: 'John Smith',
  chi: 'Maria Garcia', den: 'Maria Garcia', min: 'Maria Garcia',
};

// a5 is in-progress — only 6 stores completed it
const COMPLETED_STORES_A5 = new Set(['sf', 'la', 'sea', 'por', 'ny', 'bos']);

// ─── Build Results ────────────────────────────────────────────────────────────

function buildQuestions(
  defs: { text: string; maxScore: number }[],
  sectionScore: number,
): QuestionResult[] {
  const offsets = [0.05, -0.08, 0.03];
  return defs.map((def, i) => {
    const val = Math.min(1, Math.max(0, sectionScore / 100 + offsets[i % 3]));
    const scoreValue = Math.round(val * def.maxScore);
    const answer =
      scoreValue >= def.maxScore * 0.75 ? 'Yes' :
      scoreValue >= def.maxScore * 0.5  ? 'Partially' : 'No';
    const followUpTask =
      answer === 'No' ? `Rectify: ${def.text}` :
      answer === 'Partially' ? `Review: ${def.text}` : undefined;
    return { id: `q-${i}`, text: def.text, answer, scoreValue, maxScore: def.maxScore, isNA: false, followUpTask };
  });
}

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function buildResult(
  storeId: string,
  auditId: string,
  templateId: string,
  scores: number[],
  completedDate: string,
  auditStatus: AuditStatus,
): StoreAuditResult {
  const sNames = SECTION_NAMES[templateId];
  const qDefs  = QUESTION_DEFS[templateId];

  const sections: SectionResult[] = sNames.map((name, i) => ({
    name,
    score: scores[i],
    questions: buildQuestions(qDefs[name], scores[i]),
  }));

  const isCompleted = !!completedDate;
  const status: AuditStatus =
    isCompleted ? 'done' :
    auditStatus === 'in-progress' ? 'in-progress' : 'not-started';

  return {
    storeId,
    auditId,
    auditor: AUDITORS[storeId] || 'Unknown',
    date: completedDate,
    status,
    overallScore: avg(scores),
    sections,
  };
}

// Generate completion dates for all store/audit combos
function completionDate(storeId: string, auditId: string): string {
  if (auditId === 'a5') return COMPLETED_STORES_A5.has(storeId) ? '2025-02-28' : '';
  if (auditId === 'a8') return ''; // in-progress
  return '2024-12-01'; // simplified — all others done
}

export const STORE_AUDIT_RESULTS: StoreAuditResult[] = Object.entries(ALL_SCORES).flatMap(
  ([templateId, storeMap]) =>
    Object.entries(storeMap).flatMap(([storeId, auditMap]) =>
      Object.entries(auditMap).map(([auditId, scores]) => {
        const audit = REPORT_AUDITS.find((a) => a.id === auditId)!;
        return buildResult(storeId, auditId, templateId, scores, completionDate(storeId, auditId), audit.status);
      })
    )
);
