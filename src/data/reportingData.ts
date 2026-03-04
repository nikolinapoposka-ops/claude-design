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
  followUpTaskStatus?: 'open' | 'resolved';
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
  dueDate: string;
  status: AuditStatus;
  overallScore: number;
  isOverdue: boolean;
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
  // Fire Safety Standard — quarterly
  { id: 'a1',  templateId: 'tpl-1', name: 'Safety Audit Q1 2024', date: '2024-03-31', status: 'done' },
  { id: 'a2',  templateId: 'tpl-1', name: 'Safety Audit Q2 2024', date: '2024-06-30', status: 'done' },
  { id: 'a3',  templateId: 'tpl-1', name: 'Safety Audit Q3 2024', date: '2024-09-30', status: 'done' },
  { id: 'a4',  templateId: 'tpl-1', name: 'Safety Audit Q4 2024', date: '2024-12-31', status: 'done' },
  { id: 'a5',  templateId: 'tpl-1', name: 'Safety Audit Q1 2025', date: '2025-03-31', status: 'in-progress' },
  // Monthly Operations Review — Q1 2024 through Feb 2025
  { id: 'a6',  templateId: 'tpl-2', name: 'Ops Review Q1 2024',  date: '2024-03-31', status: 'done' },
  { id: 'a7',  templateId: 'tpl-2', name: 'Ops Review Q2 2024',  date: '2024-06-30', status: 'done' },
  { id: 'a8',  templateId: 'tpl-2', name: 'Ops Review Q3 2024',  date: '2024-09-30', status: 'done' },
  { id: 'a9',  templateId: 'tpl-2', name: 'Ops Review Q4 2024',  date: '2024-12-31', status: 'done' },
  { id: 'a10', templateId: 'tpl-2', name: 'Ops Review Jan 2025', date: '2025-01-31', status: 'done' },
  { id: 'a11', templateId: 'tpl-2', name: 'Ops Review Feb 2025', date: '2025-02-28', status: 'done' },
  { id: 'a12', templateId: 'tpl-2', name: 'Ops Review Mar 2025', date: '2025-03-31', status: 'in-progress' },
  // Visual Merchandising Audit — Q1 2024 through Feb 2025
  { id: 'a13', templateId: 'tpl-3', name: 'VM Audit Q1 2024',  date: '2024-03-31', status: 'done' },
  { id: 'a14', templateId: 'tpl-3', name: 'VM Audit Q2 2024',  date: '2024-06-30', status: 'done' },
  { id: 'a15', templateId: 'tpl-3', name: 'VM Audit Q3 2024',  date: '2024-09-30', status: 'done' },
  { id: 'a16', templateId: 'tpl-3', name: 'VM Audit Q4 2024',  date: '2024-12-31', status: 'done' },
  { id: 'a17', templateId: 'tpl-3', name: 'VM Audit Jan 2025', date: '2025-01-31', status: 'done' },
  { id: 'a18', templateId: 'tpl-3', name: 'VM Audit Feb 2025', date: '2025-02-28', status: 'done' },
];

// ─── Org Hierarchy ───────────────────────────────────────────────────────────

export const REPORT_AREAS: ReportArea[] = [
  { id: 'area-wc', name: 'West Coast',  regionName: 'North America' },
  { id: 'area-ec', name: 'East Coast',  regionName: 'North America' },
  { id: 'area-mw', name: 'Midwest',     regionName: 'North America' },
  { id: 'area-se', name: 'Southeast',   regionName: 'North America' },
  { id: 'area-tx', name: 'Texas',       regionName: 'North America' },
  { id: 'area-sw', name: 'Southwest',   regionName: 'North America' },
];

export const REPORT_STORES: ReportStore[] = [
  // West Coast (Emily Davis manages this area)
  { id: 'sf',  name: 'San Francisco - Downtown',   areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'la',  name: 'Los Angeles - Westside',      areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'sea', name: 'Seattle - Capitol Hill',      areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  { id: 'por', name: 'Portland - Pearl District',   areaId: 'area-wc', areaName: 'West Coast', regionName: 'North America' },
  // East Coast (John Smith)
  { id: 'ny',  name: 'New York - Manhattan',         areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  { id: 'bos', name: 'Boston - Back Bay',            areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  { id: 'dc',  name: 'Washington DC - Georgetown',  areaId: 'area-ec', areaName: 'East Coast', regionName: 'North America' },
  // Midwest (Maria Garcia)
  { id: 'chi', name: 'Chicago - River North',        areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
  { id: 'den', name: 'Denver - LoDo',                areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
  { id: 'min', name: 'Minneapolis - Downtown',       areaId: 'area-mw', areaName: 'Midwest', regionName: 'North America' },
  // Southeast (Sarah Johnson)
  { id: 'atl', name: 'Atlanta - Midtown',            areaId: 'area-se', areaName: 'Southeast', regionName: 'North America' },
  { id: 'mia', name: 'Miami - Brickell',             areaId: 'area-se', areaName: 'Southeast', regionName: 'North America' },
  { id: 'cha', name: 'Charlotte - Uptown',           areaId: 'area-se', areaName: 'Southeast', regionName: 'North America' },
  // Texas (James Wilson)
  { id: 'dal', name: 'Dallas - Uptown',              areaId: 'area-tx', areaName: 'Texas', regionName: 'North America' },
  { id: 'hou', name: 'Houston - Galleria',           areaId: 'area-tx', areaName: 'Texas', regionName: 'North America' },
  { id: 'aus', name: 'Austin - South Congress',      areaId: 'area-tx', areaName: 'Texas', regionName: 'North America' },
  // Southwest (Lisa Chen) — lower baseline, improving
  { id: 'phx', name: 'Phoenix - Downtown',           areaId: 'area-sw', areaName: 'Southwest', regionName: 'North America' },
  { id: 'lv',  name: 'Las Vegas - Strip',            areaId: 'area-sw', areaName: 'Southwest', regionName: 'North America' },
  { id: 'sd',  name: 'San Diego - Gaslamp',          areaId: 'area-sw', areaName: 'Southwest', regionName: 'North America' },
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
  // Fire Safety: clearly the laggard — weak Q1, steady recovery but stays below VM/Ops bands
  // West Coast
  sf:  { a1: [49,53,51], a2: [59,63,61], a3: [67,71,69], a4: [74,78,76], a5: [76,80,78] },
  la:  { a1: [43,47,45], a2: [53,57,55], a3: [61,65,63], a4: [68,72,70], a5: [70,74,72] },
  sea: { a1: [41,45,43], a2: [51,55,53], a3: [59,63,61], a4: [66,70,68], a5: [68,72,70] },
  por: { a1: [45,49,47], a2: [55,59,57], a3: [63,67,65], a4: [70,74,72], a5: [72,76,74] },
  // East Coast
  ny:  { a1: [58,62,60], a2: [68,72,70], a3: [77,81,79], a4: [81,84,82], a5: [82,84,83] },
  bos: { a1: [48,52,50], a2: [58,62,60], a3: [67,71,69], a4: [74,78,76], a5: [76,80,78] },
  dc:  { a1: [44,48,46], a2: [54,58,56], a3: [63,67,65], a4: [70,74,72], a5: [72,76,74] },
  // Midwest
  chi: { a1: [39,43,41], a2: [49,53,51], a3: [57,61,59], a4: [64,68,66], a5: [66,70,68] },
  den: { a1: [31,35,33], a2: [41,45,43], a3: [49,53,51], a4: [56,60,58], a5: [58,62,60] },
  min: { a1: [37,41,39], a2: [47,51,49], a3: [55,59,57], a4: [62,66,64], a5: [64,68,66] },
  // Southeast
  atl: { a1: [46,50,48], a2: [56,60,58], a3: [65,69,67], a4: [72,76,74], a5: [74,78,76] },
  mia: { a1: [43,47,45], a2: [53,57,55], a3: [61,65,63], a4: [68,72,70], a5: [70,74,72] },
  cha: { a1: [56,60,58], a2: [66,70,68], a3: [75,79,77], a4: [80,83,81], a5: [81,84,82] },
  // Texas
  dal: { a1: [57,61,59], a2: [67,71,69], a3: [76,80,78], a4: [81,84,82], a5: [82,84,83] },
  hou: { a1: [54,58,56], a2: [64,68,66], a3: [73,77,75], a4: [79,82,80], a5: [80,83,81] },
  aus: { a1: [44,48,46], a2: [54,58,56], a3: [63,67,65], a4: [70,74,72], a5: [72,76,74] },
  // Southwest — lower baseline throughout
  phx: { a1: [32,36,34], a2: [42,46,44], a3: [50,54,52], a4: [57,61,59], a5: [59,63,61] },
  lv:  { a1: [29,33,31], a2: [39,43,41], a3: [47,51,49], a4: [54,58,56], a5: [56,60,58] },
  sd:  { a1: [47,51,49], a2: [57,61,59], a3: [66,70,68], a4: [73,77,75], a5: [75,79,77] },
};

const SCORES_TPL2: Record<string, Record<string, number[]>> = {
  // Monthly Ops: strong throughout 2024 (Q1–Q4), good Jan 2025, sharp drop Feb 2025
  // a6=Q1 2024  a7=Q2 2024  a8=Q3 2024  a9=Q4 2024  a10=Jan 2025  a11=Feb 2025  a12=Mar 2025 (in-progress)
  sf:  { a6: [90,86,92], a7: [89,85,91], a8: [88,84,90], a9: [89,85,91], a10: [87,83,89], a11: [70,66,72], a12: [90,86,92] },
  la:  { a6: [85,83,87], a7: [84,82,86], a8: [83,81,85], a9: [84,82,86], a10: [82,80,84], a11: [64,62,66], a12: [80,82,78] },
  sea: { a6: [88,85,90], a7: [87,84,89], a8: [86,83,88], a9: [87,84,89], a10: [85,82,87], a11: [67,64,69], a12: [84,81,86] },
  por: { a6: [82,80,84], a7: [81,79,83], a8: [80,78,82], a9: [81,79,83], a10: [79,77,81], a11: [61,59,63], a12: [72,74,70] },
  ny:  { a6: [97,95,99], a7: [96,94,98], a8: [95,93,97], a9: [96,94,98], a10: [94,92,96], a11: [77,75,79], a12: [93,91,95] },
  bos: { a6: [90,88,92], a7: [89,87,91], a8: [88,86,90], a9: [89,87,91], a10: [87,85,89], a11: [70,68,72], a12: [85,87,83] },
  dc:  { a6: [86,84,88], a7: [85,83,87], a8: [84,82,86], a9: [85,83,87], a10: [83,81,85], a11: [65,63,67], a12: [81,79,83] },
  chi: { a6: [82,80,84], a7: [81,79,83], a8: [80,78,82], a9: [81,79,83], a10: [79,77,81], a11: [61,59,63], a12: [77,75,79] },
  den: { a6: [75,73,77], a7: [74,72,76], a8: [73,71,75], a9: [74,72,76], a10: [72,70,74], a11: [54,52,56], a12: [70,72,68] },
  min: { a6: [79,77,81], a7: [78,76,80], a8: [77,75,79], a9: [78,76,80], a10: [76,74,78], a11: [58,56,60], a12: [74,76,72] },
  atl: { a6: [87,85,89], a7: [86,84,88], a8: [85,83,87], a9: [86,84,88], a10: [84,82,86], a11: [66,64,68], a12: [82,80,84] },
  mia: { a6: [83,81,85], a7: [82,80,84], a8: [81,79,83], a9: [82,80,84], a10: [80,78,82], a11: [62,60,64], a12: [78,76,80] },
  cha: { a6: [92,90,94], a7: [91,89,93], a8: [90,88,92], a9: [91,89,93], a10: [89,87,91], a11: [72,70,74], a12: [86,84,88] },
  dal: { a6: [96,94,98], a7: [95,93,97], a8: [94,92,96], a9: [95,93,97], a10: [93,91,95], a11: [76,74,78], a12: [90,88,92] },
  hou: { a6: [93,91,95], a7: [92,90,94], a8: [91,89,93], a9: [92,90,94], a10: [90,88,92], a11: [73,71,75], a12: [87,85,89] },
  aus: { a6: [86,84,88], a7: [85,83,87], a8: [84,82,86], a9: [85,83,87], a10: [83,81,85], a11: [65,63,67], a12: [81,79,83] },
  phx: { a6: [75,73,77], a7: [74,72,76], a8: [73,71,75], a9: [74,72,76], a10: [72,70,74], a11: [54,52,56], a12: [72,74,70] },
  lv:  { a6: [72,70,74], a7: [71,69,73], a8: [70,68,72], a9: [71,69,73], a10: [69,67,71], a11: [51,49,53], a12: [69,71,67] },
  sd:  { a6: [89,87,91], a7: [88,86,90], a8: [87,85,89], a9: [88,86,90], a10: [86,84,88], a11: [69,67,71], a12: [83,81,85] },
};

const SCORES_TPL3: Record<string, Record<string, number[]>> = {
  // Visual Merchandising: gradual improvement Q1 2024 → Feb 2025
  // a13=Q1 2024  a14=Q2 2024  a15=Q3 2024  a16=Q4 2024  a17=Jan 2025  a18=Feb 2025
  sf:  { a13: [72,75,70], a14: [77,80,75], a15: [83,86,81], a16: [89,92,87], a17: [93,96,91], a18: [95,98,93] },
  la:  { a13: [66,68,64], a14: [71,73,69], a15: [77,79,75], a16: [83,85,81], a17: [87,89,85], a18: [89,91,87] },
  sea: { a13: [63,65,61], a14: [68,70,66], a15: [74,76,72], a16: [80,82,78], a17: [84,86,82], a18: [86,88,84] },
  por: { a13: [68,70,66], a14: [73,75,71], a15: [79,81,77], a16: [85,87,83], a17: [89,91,87], a18: [91,93,89] },
  ny:  { a13: [81,83,79], a14: [86,88,84], a15: [91,93,89], a16: [96,98,94], a17: [99,99,98], a18: [99,99,99] },
  bos: { a13: [70,72,68], a14: [75,77,73], a15: [81,83,79], a16: [87,89,85], a17: [91,93,89], a18: [93,95,91] },
  dc:  { a13: [66,68,64], a14: [71,73,69], a15: [77,79,75], a16: [83,85,81], a17: [87,89,85], a18: [89,91,87] },
  chi: { a13: [62,64,60], a14: [67,69,65], a15: [73,75,71], a16: [79,81,77], a17: [83,85,81], a18: [85,87,83] },
  den: { a13: [54,56,52], a14: [59,61,57], a15: [65,67,63], a16: [71,73,69], a17: [75,77,73], a18: [77,79,75] },
  min: { a13: [59,61,57], a14: [64,66,62], a15: [70,72,68], a16: [76,78,74], a17: [80,82,78], a18: [82,84,80] },
  atl: { a13: [68,70,66], a14: [73,75,71], a15: [79,81,77], a16: [85,87,83], a17: [89,91,87], a18: [91,93,89] },
  mia: { a13: [64,66,62], a14: [69,71,67], a15: [75,77,73], a16: [81,83,79], a17: [85,87,83], a18: [87,89,85] },
  cha: { a13: [76,78,74], a14: [81,83,79], a15: [87,89,85], a16: [93,95,91], a17: [97,99,95], a18: [99,99,97] },
  dal: { a13: [80,82,78], a14: [85,87,83], a15: [90,92,88], a16: [95,97,93], a17: [99,99,97], a18: [99,99,99] },
  hou: { a13: [77,79,75], a14: [82,84,80], a15: [88,90,86], a16: [94,96,92], a17: [98,99,96], a18: [99,99,98] },
  aus: { a13: [66,68,64], a14: [71,73,69], a15: [77,79,75], a16: [83,85,81], a17: [87,89,85], a18: [89,91,87] },
  phx: { a13: [55,57,53], a14: [60,62,58], a15: [66,68,64], a16: [72,74,70], a17: [76,78,74], a18: [78,80,76] },
  lv:  { a13: [52,54,50], a14: [57,59,55], a15: [63,65,61], a16: [69,71,67], a17: [73,75,71], a18: [75,77,73] },
  sd:  { a13: [71,73,69], a14: [76,78,74], a15: [82,84,80], a16: [88,90,86], a17: [92,94,90], a18: [94,96,92] },
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
  atl: 'Sarah Johnson', mia: 'Sarah Johnson', cha: 'Sarah Johnson',
  dal: 'James Wilson',  hou: 'James Wilson',  aus: 'James Wilson',
  phx: 'Lisa Chen',     lv: 'Lisa Chen',      sd: 'Lisa Chen',
};

// a5 is in-progress — only some stores completed it
const COMPLETED_STORES_A5 = new Set(['sf', 'la', 'sea', 'por', 'ny', 'bos', 'cha', 'dal', 'hou']);

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
    // 'Partially' answers are treated as resolved (corrective action taken),
    // 'No' answers alternate open/resolved based on index
    const followUpTaskStatus: 'open' | 'resolved' | undefined =
      answer === 'Partially' ? 'resolved' :
      answer === 'No' ? (i % 2 === 0 ? 'open' : 'resolved') : undefined;
    return { id: `q-${i}`, text: def.text, answer, scoreValue, maxScore: def.maxScore, isNA: false, followUpTask, followUpTaskStatus };
  });
}

function avg(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

const TODAY = new Date().toISOString().slice(0, 10);

function buildResult(
  storeId: string,
  auditId: string,
  templateId: string,
  scores: number[],
  completedDate: string,
  auditStatus: AuditStatus,
  auditDueDate: string,
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

  const isOverdue = status !== 'done' && !!auditDueDate && auditDueDate < TODAY;

  return {
    storeId,
    auditId,
    auditor: AUDITORS[storeId] || 'Unknown',
    date: completedDate,
    dueDate: auditDueDate,
    status,
    overallScore: avg(scores),
    isOverdue,
    sections,
  };
}

// Generate completion dates for all store/audit combos
function completionDate(storeId: string, auditId: string): string {
  if (auditId === 'a5') return COMPLETED_STORES_A5.has(storeId) ? '2025-02-28' : '';
  if (auditId === 'a12') return ''; // in-progress
  const audit = REPORT_AUDITS.find(a => a.id === auditId);
  return audit?.date ?? '';
}

export const STORE_AUDIT_RESULTS: StoreAuditResult[] = Object.entries(ALL_SCORES).flatMap(
  ([templateId, storeMap]) =>
    Object.entries(storeMap).flatMap(([storeId, auditMap]) =>
      Object.entries(auditMap).map(([auditId, scores]) => {
        const audit = REPORT_AUDITS.find((a) => a.id === auditId)!;
        return buildResult(storeId, auditId, templateId, scores, completionDate(storeId, auditId), audit.status, audit.date);
      })
    )
);
