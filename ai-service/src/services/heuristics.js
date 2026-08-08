import {
  CATEGORY_LABELS,
  CATEGORY_TO_DEPARTMENT,
  COMPLAINT_CATEGORIES,
  SERVICE_TO_DEPARTMENT,
  SERVICE_TYPES,
} from '../constants.js';

const CATEGORY_KEYWORDS = {
  roadMaintenance: ['pothole', 'road', 'asphalt', 'street damaged', 'pavement', 'highway', 'gudda', 'daandii'],
  wasteManagement: ['garbage', 'waste', 'trash', 'rubbish', 'dump', 'uncollected', 'kosii', 'sanitation'],
  waterSupply: ['water', 'leak', 'pipe', 'buna', 'pressure', 'bishaani', 'burst'],
  streetLighting: ['streetlight', 'street light', 'lamp', 'dark', 'lighting', 'ibsaa'],
  drainage: ['drain', 'flood', 'sewer', 'ditch', 'overflow', 'stagnant'],
  publicSafety: ['accident', 'danger', 'hazard', 'unsafe', 'crime', 'fire', 'collapse'],
  noisePollution: ['noise', 'loud', 'music', 'disturbance', 'horn'],
  other: [],
};

const SERVICE_KEYWORDS = {
  'Waste Collection Request': ['waste bin', 'collection', 'pickup', 'garbage truck'],
  'Street Cleaning': ['street cleaning', 'sweep', 'clean street'],
  'Water Connection Inquiry': ['water connection', 'new connection', 'meter'],
  'Public Facility Access': ['facility', 'park', 'hall', 'public toilet'],
  'General Information': ['information', 'inquiry', 'how to', 'question'],
  Other: [],
};

function scoreText(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => (lower.includes(kw) ? score + 1 : score), 0);
}

function pickBest(entries) {
  entries.sort((a, b) => b.score - a.score);
  const best = entries[0];
  const total = entries.reduce((s, e) => s + e.score, 0) || 1;
  const confidence = Math.min(0.95, 0.35 + best.score / Math.max(total, 1) * 0.5);
  return { value: best.value, confidence: best.score === 0 ? 0.4 : Number(confidence.toFixed(2)) };
}

export function heuristicCategorize({ title = '', description = '', location = '', type = 'complaint' }) {
  const blob = `${title} ${description} ${location}`;

  if (type === 'service') {
    const scored = SERVICE_TYPES.map((st) => ({
      value: st,
      score: scoreText(blob, SERVICE_KEYWORDS[st] || []),
    }));
    const { value, confidence } = pickBest(scored);
    return {
      type: 'service',
      category: null,
      categoryLabel: null,
      serviceType: value,
      department: SERVICE_TO_DEPARTMENT[value] || 'Public Utilities',
      priority: inferPriority(blob),
      confidence,
      rationale: 'Matched keywords in title/description (offline heuristic).',
      provider: 'heuristic',
    };
  }

  const scored = COMPLAINT_CATEGORIES.map((cat) => ({
    value: cat,
    score: scoreText(blob, CATEGORY_KEYWORDS[cat] || []),
  }));
  const { value, confidence } = pickBest(scored);
  return {
    type: 'complaint',
    category: value,
    categoryLabel: CATEGORY_LABELS[value],
    serviceType: null,
    department: CATEGORY_TO_DEPARTMENT[value],
    priority: inferPriority(blob),
    confidence,
    rationale: 'Matched keywords in title/description (offline heuristic).',
    provider: 'heuristic',
  };
}

export function heuristicImprove({ title = '', description = '', type = 'complaint' }) {
  const cleanTitle = title.trim().replace(/\s+/g, ' ');
  let cleanDesc = description.trim().replace(/\s+/g, ' ');
  if (cleanDesc && !/[.!?]$/.test(cleanDesc)) cleanDesc += '.';

  const improvedTitle =
    cleanTitle.length > 0
      ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
      : type === 'complaint'
        ? 'Municipal issue report'
        : 'Service request';

  const improvedDescription =
    cleanDesc ||
    'Please describe the issue, exact location in Adama, and when it started so officers can respond quickly.';

  return {
    title: improvedTitle,
    description: improvedDescription,
    changes: [
      'Normalized spacing and capitalization',
      'Ensured description ends with punctuation',
      cleanDesc ? 'Kept original meaning' : 'Added a clearer placeholder description',
    ],
    provider: 'heuristic',
  };
}

function inferPriority(text) {
  const lower = text.toLowerCase();
  const high = ['leak', 'flood', 'collapse', 'fire', 'accident', 'danger', 'urgent', 'burst', 'electrocution'];
  const medium = ['broken', 'outage', 'blocked', 'overflow', 'dark', 'pothole'];
  if (high.some((w) => lower.includes(w))) return 'high';
  if (medium.some((w) => lower.includes(w))) return 'medium';
  return 'low';
}

export function heuristicResolutionNote({
  title = '',
  description = '',
  location = '',
  category = '',
  actionTaken = '',
  outcome = 'resolved',
}) {
  const place = location.trim() || 'the reported location';
  const topic = title.trim() || category || 'the reported issue';
  const action =
    actionTaken.trim() ||
    'Field inspection completed and corrective action was applied according to department procedure';
  const citizenLine =
    outcome === 'closed'
      ? 'This case is now closed. Thank you for reporting the issue to Adama City Administration.'
      : 'The issue has been addressed. Thank you for reporting it to Adama City Administration.';

  const note = [
    `Re: ${topic} at ${place}.`,
    action.endsWith('.') ? action : `${action}.`,
    citizenLine,
  ].join(' ');

  return {
    resolutionNote: note,
    citizenUpdate: citizenLine,
    internalChecklist: [
      'Confirm site visit / verification',
      'Record materials or team used',
      'Notify citizen via status update in the main app',
    ],
    provider: 'heuristic',
  };
}

export function heuristicTriageAdvice(classification, similar) {
  const dupCount = similar?.items?.length || 0;
  const actions = [];
  if (classification.priority === 'high') {
    actions.push('Prioritize in admin queue — safety or service disruption risk.');
  }
  actions.push(`Route to department: ${classification.department}.`);
  if (dupCount > 0) {
    actions.push(`Review ${dupCount} similar case(s) before creating duplicate work orders.`);
  } else {
    actions.push('No strong duplicates found — treat as a new intake item.');
  }
  actions.push('Assign an officer when ready (moves status to In Progress).');
  actions.push('Do not auto-reject or auto-close based on AI alone.');

  return {
    recommendedDepartment: classification.department,
    recommendedPriority: classification.priority,
    assignHint:
      classification.priority === 'high'
        ? 'Assign to an available officer in the recommended department as soon as possible.'
        : 'Can remain on department queue until an officer is free.',
    duplicateRisk: dupCount >= 2 ? 'high' : dupCount === 1 ? 'medium' : 'low',
    actions,
    provider: 'heuristic',
  };
}
