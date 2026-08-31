import {
  CATEGORY_LABELS,
  CATEGORY_TO_DEPARTMENT,
  COMPLAINT_CATEGORIES,
  DEPARTMENTS,
} from '../constants.js';
import { config, resolveEffectiveProvider } from '../config.js';
import {
  heuristicCategorize,
  heuristicImprove,
  heuristicResolutionNote,
  heuristicTriageAdvice,
} from './heuristics.js';
import { FAQ_ENTRIES, heuristicChat } from './faq.js';

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text).filter(Boolean).join('\n').trim();
}

async function callGemini(prompt) {
  // Auth keys (AQ.*) need x-goog-api-key header; query ?key= is for older AIza keys.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.geminiApiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: 'MINIMAL' },
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = extractGeminiText(data);
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

function normalizeCategorizeResult(raw, provider) {
  const category = COMPLAINT_CATEGORIES.includes(raw.category) ? raw.category : 'other';
  return {
    type: 'complaint',
    category,
    categoryLabel: CATEGORY_LABELS[category],
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
  const fallback = heuristicCategorize(input);

  const prompt = `Classify this Adama City citizen complaint.
Return JSON with keys: category, department, priority, confidence (0-1), rationale.
category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}
department must be one of: ${DEPARTMENTS.join(', ')}
priority must be one of: high, medium, low

Title: ${input.title || ''}
Description: ${input.description || ''}
Location: ${input.location || ''}`;

  try {
    const llm = await llmJson(prompt);
    if (!llm) return fallback;
    return normalizeCategorizeResult(llm.data, llm.provider);
  } catch (err) {
    console.warn('[ai] categorize LLM failed, using heuristic:', err.message);
    return { ...fallback, rationale: `${fallback.rationale} (LLM unavailable: ${err.message})` };
  }
}

export async function improveSubmission(input) {
  const fallback = heuristicImprove(input);

  const prompt = `Improve this Adama City complaint submission for clarity.
Keep the original meaning. Do not invent facts. Prefer simple English.
Fix capitalization carefully:
- Title: use Title Case (e.g. "Broken Streetlight Near Adama Stadium")
- Description: use proper sentence case (capitalize start of each sentence; fix ALL CAPS)
- Capitalize place names like Adama, Bole, Kebele when appropriate
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

  const prompt = `You are a helpful AI assistant for the Adama City Citizen Portal.
You can answer general questions on everyday topics (explanations, how-tos, ideas, etc.).
When the user asks about this municipal system, prefer the FAQ facts below (submit/track complaints, roles, departments, statuses).
Be concise, clear, and polite. Do not claim to submit, assign, or close cases in the portal.
Return JSON with keys: reply (string), matchedFaqId (string|null). Use matchedFaqId only when a FAQ fact clearly matches; otherwise null.

Known FAQ facts (for portal questions):
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
