import {
  CATEGORY_LABELS,
  CATEGORY_TO_DEPARTMENT,
  COMPLAINT_CATEGORIES,
  DEPARTMENTS,
  SERVICE_TO_DEPARTMENT,
  SERVICE_TYPES,
} from '../constants.js';
import { config, resolveEffectiveProvider } from '../config.js';
import {
  heuristicCategorize,
  heuristicImprove,
  heuristicResolutionNote,
  heuristicTriageAdvice,
} from './heuristics.js';
import { FAQ_ENTRIES, heuristicChat } from './faq.js';

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(stripCodeFences(text));
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a municipal intake assistant for Adama City. Reply with JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty response');
  return JSON.parse(stripCodeFences(text));
}

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

async function llmJson(prompt) {
  const provider = resolveEffectiveProvider();
  if (provider === 'openai') return { data: await callOpenAI(prompt), provider };
  if (provider === 'gemini') return { data: await callGemini(prompt), provider };
  return null;
}

function normalizeCategorizeResult(raw, type, provider) {
  if (type === 'service') {
    const serviceType = SERVICE_TYPES.includes(raw.serviceType) ? raw.serviceType : 'Other';
    return {
      type: 'service',
      category: null,
      categoryLabel: null,
      serviceType,
      department: DEPARTMENTS.includes(raw.department)
        ? raw.department
        : SERVICE_TO_DEPARTMENT[serviceType],
      priority: ['high', 'medium', 'low'].includes(raw.priority) ? raw.priority : 'medium',
      confidence: clampConfidence(raw.confidence),
      rationale: String(raw.rationale || 'AI classification'),
      provider,
    };
  }

  const category = COMPLAINT_CATEGORIES.includes(raw.category) ? raw.category : 'other';
  return {
    type: 'complaint',
    category,
    categoryLabel: CATEGORY_LABELS[category],
    serviceType: null,
    department: DEPARTMENTS.includes(raw.department)
      ? raw.department
      : CATEGORY_TO_DEPARTMENT[category],
    priority: ['high', 'medium', 'low'].includes(raw.priority) ? raw.priority : 'medium',
    confidence: clampConfidence(raw.confidence),
    rationale: String(raw.rationale || 'AI classification'),
    provider,
  };
}

function clampConfidence(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0.7;
  return Math.max(0.1, Math.min(0.99, Number(n.toFixed(2))));
}

export async function categorizeSubmission(input) {
  const type = input.type === 'service' ? 'service' : 'complaint';
  const fallback = heuristicCategorize({ ...input, type });

  const prompt =
    type === 'complaint'
      ? `Classify this Adama City citizen complaint.
Return JSON with keys: category, department, priority, confidence (0-1), rationale.
category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}
department must be one of: ${DEPARTMENTS.join(', ')}
priority must be one of: high, medium, low

Title: ${input.title || ''}
Description: ${input.description || ''}
Location: ${input.location || ''}`
      : `Classify this Adama City service request.
Return JSON with keys: serviceType, department, priority, confidence (0-1), rationale.
serviceType must be one of: ${SERVICE_TYPES.map((s) => `"${s}"`).join(', ')}
department must be one of: ${DEPARTMENTS.join(', ')}
priority must be one of: high, medium, low

Title: ${input.title || ''}
Description: ${input.description || ''}
Location: ${input.location || ''}`;

  try {
    const llm = await llmJson(prompt);
    if (!llm) return fallback;
    return normalizeCategorizeResult(llm.data, type, llm.provider);
  } catch (err) {
    console.warn('[ai] categorize LLM failed, using heuristic:', err.message);
    return { ...fallback, rationale: `${fallback.rationale} (LLM unavailable: ${err.message})` };
  }
}

export async function improveSubmission(input) {
  const type = input.type === 'service' ? 'service' : 'complaint';
  const fallback = heuristicImprove({ ...input, type });

  const prompt = `Improve this Adama City ${type} submission for clarity.
Keep the original meaning. Do not invent facts. Prefer simple English.
Return JSON with keys: title, description, changes (array of short strings).

Original title: ${input.title || ''}
Original description: ${input.description || ''}
Location (context only, do not invent): ${input.location || ''}`;

  try {
    const llm = await llmJson(prompt);
    if (!llm) return fallback;
    return {
      title: String(llm.data.title || fallback.title).trim(),
      description: String(llm.data.description || fallback.description).trim(),
      changes: Array.isArray(llm.data.changes) ? llm.data.changes.map(String) : fallback.changes,
      provider: llm.provider,
    };
  } catch (err) {
    console.warn('[ai] improve LLM failed, using heuristic:', err.message);
    return { ...fallback, changes: [...fallback.changes, `LLM unavailable: ${err.message}`] };
  }
}

export async function draftResolution(input) {
  const fallback = heuristicResolutionNote(input);
  const prompt = `Draft a professional municipal resolution note for Adama City.
Return JSON with keys: resolutionNote, citizenUpdate, internalChecklist (array of short strings).
Do not invent work that was not described. Keep tone respectful and clear.

Title: ${input.title || ''}
Description: ${input.description || ''}
Location: ${input.location || ''}
Category: ${input.category || ''}
Action taken: ${input.actionTaken || ''}
Outcome: ${input.outcome || 'resolved'}`;

  try {
    const llm = await llmJson(prompt);
    if (!llm) return fallback;
    return {
      resolutionNote: String(llm.data.resolutionNote || fallback.resolutionNote).trim(),
      citizenUpdate: String(llm.data.citizenUpdate || fallback.citizenUpdate).trim(),
      internalChecklist: Array.isArray(llm.data.internalChecklist)
        ? llm.data.internalChecklist.map(String)
        : fallback.internalChecklist,
      provider: llm.provider,
    };
  } catch (err) {
    console.warn('[ai] resolution LLM failed, using heuristic:', err.message);
    return fallback;
  }
}

export async function chatAssistant(message, history = []) {
  const fallback = heuristicChat(message);
  const faqBlock = FAQ_ENTRIES.map((e) => `- (${e.id}) ${e.a}`).join('\n');
  const historyBlock = (history || [])
    .slice(-6)
    .map((h) => `${h.role || 'user'}: ${h.content || ''}`)
    .join('\n');

  const prompt = `You are the Adama City Citizen Complaint & Service Request FAQ assistant.
Answer only about this municipal web system (submit/track complaints & service requests, roles, departments, statuses).
If asked unrelated questions, politely redirect.
Return JSON with keys: reply (string), matchedFaqId (string|null).

Known FAQ facts:
${faqBlock}

Recent chat:
${historyBlock}

User message: ${message}`;

  try {
    const llm = await llmJson(prompt);
    if (!llm) return fallback;
    return {
      reply: String(llm.data.reply || fallback.reply).trim(),
      matchedFaqId: llm.data.matchedFaqId || fallback.matchedFaqId || null,
      provider: llm.provider,
    };
  } catch (err) {
    console.warn('[ai] chat LLM failed, using heuristic:', err.message);
    return fallback;
  }
}

export async function buildTriagePack(input) {
  const { findSimilarCases } = await import('./similar.js');
  const classification = await categorizeSubmission(input);
  const similar = await findSimilarCases({
    title: input.title,
    description: input.description,
    location: input.location,
    type: input.type,
    limit: 5,
  });
  const fallbackAdvice = heuristicTriageAdvice(classification, similar);

  const prompt = `You are an Adama City admin triage assistant. Suggest routing only — humans decide.
Return JSON with keys: recommendedDepartment, recommendedPriority, assignHint, duplicateRisk (low|medium|high), actions (array of strings).
Departments: ${DEPARTMENTS.join(', ')}
Priority: high, medium, low

Case classification: ${JSON.stringify(classification)}
Similar cases: ${JSON.stringify(similar.items || [])}

Title: ${input.title || ''}
Description: ${input.description || ''}
Location: ${input.location || ''}`;

  let advice = fallbackAdvice;
  try {
    const llm = await llmJson(prompt);
    if (llm) {
      advice = {
        recommendedDepartment: DEPARTMENTS.includes(llm.data.recommendedDepartment)
          ? llm.data.recommendedDepartment
          : fallbackAdvice.recommendedDepartment,
        recommendedPriority: ['high', 'medium', 'low'].includes(llm.data.recommendedPriority)
          ? llm.data.recommendedPriority
          : fallbackAdvice.recommendedPriority,
        assignHint: String(llm.data.assignHint || fallbackAdvice.assignHint),
        duplicateRisk: ['low', 'medium', 'high'].includes(llm.data.duplicateRisk)
          ? llm.data.duplicateRisk
          : fallbackAdvice.duplicateRisk,
        actions: Array.isArray(llm.data.actions) ? llm.data.actions.map(String) : fallbackAdvice.actions,
        provider: llm.provider,
      };
    }
  } catch (err) {
    console.warn('[ai] triage LLM failed, using heuristic:', err.message);
  }

  return { classification, similar, advice };
}
