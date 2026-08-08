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

const PROPER_NOUNS = new Set([
  'adama',
  'ethiopia',
  'bole',
  'kebele',
  'addis',
  'ababa',
  'oromia',
]);

const TITLE_SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

function normalizeSpaces(text) {
  return String(text || '').trim().replace(/\s+/g, ' ');
}

/** Capitalize first letter of each sentence; keep known place names capitalized. */
function toSentenceCase(text) {
  let s = normalizeSpaces(text);
  if (!s) return s;

  // If mostly ALL CAPS, lowercase first so we can rebuild casing
  const letters = s.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3) {
    const upperRatio = letters.replace(/[^A-Z]/g, '').length / letters.length;
    if (upperRatio > 0.7) s = s.toLowerCase();
  }

  s = s.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());

  // Capitalize known proper nouns when they appear as whole words
  s = s.replace(/\b([A-Za-z]+)\b/g, (word) => {
    const lower = word.toLowerCase();
    if (PROPER_NOUNS.has(lower)) {
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return word;
  });

  return s;
}

/** Title Case for complaint titles (small words stay lowercase unless first/last). */
function toTitleCase(text) {
  const s = normalizeSpaces(text);
  if (!s) return s;

  let base = s;
  const letters = base.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 3) {
    const upperRatio = letters.replace(/[^A-Z]/g, '').length / letters.length;
    if (upperRatio > 0.7) base = base.toLowerCase();
  }

  const words = base.split(' ');
  return words
    .map((word, i) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      const isEdge = i === 0 || i === words.length - 1;
      if (!isEdge && TITLE_SMALL.has(lower)) return lower;
      if (PROPER_NOUNS.has(lower)) return lower.charAt(0).toUpperCase() + lower.slice(1);
      // Keep existing internal capitals lightly: first letter upper, rest as-is if mixed
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function heuristicImprove({ title = '', description = '', type = 'complaint' }) {
  const cleanTitle = normalizeSpaces(title);
  let cleanDesc = normalizeSpaces(description);
  if (cleanDesc && !/[.!?]$/.test(cleanDesc)) cleanDesc += '.';

  const improvedTitle =
    cleanTitle.length > 0
      ? toTitleCase(cleanTitle)
      : type === 'complaint'
        ? 'Municipal Issue Report'
        : 'Service Request';

  const improvedDescription =
    cleanDesc.length > 0
      ? toSentenceCase(cleanDesc)
      : 'Please describe the issue, exact location in Adama, and when it started so officers can respond quickly.';

  const changes = ['Normalized spacing', 'Fixed capitalization (title case + sentence case)'];
  if (description.trim() && !/[.!?]$/.test(description.trim())) {
    changes.push('Ensured description ends with punctuation');
  }
  changes.push(cleanDesc ? 'Kept original meaning' : 'Added a clearer placeholder description');

  return {
    title: improvedTitle,
    description: improvedDescription,
    changes,
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
