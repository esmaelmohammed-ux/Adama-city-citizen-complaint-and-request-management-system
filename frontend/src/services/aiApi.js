const AI_URL = (
  import.meta.env.DEV
    ? import.meta.env.VITE_AI_URL || 'http://localhost:5100'
    : import.meta.env.VITE_AI_URL || ''
).replace(/\/$/, '');

export class AiApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function aiRequest(path, body) {
  let res;
  try {
    res = await fetch(`${AI_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiApiError('Cannot reach AI service. Is ai-service running on port 5100?', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AiApiError(data.error || 'AI request failed', res.status);
  }
  return data;
}

export function getAiBaseUrl() {
  return AI_URL;
}

export function aiAssist(payload) {
  return aiRequest('/api/ai/assist', payload);
}

export function aiTriage(payload) {
  return aiRequest('/api/ai/triage', payload);
}

export function aiResolution(payload) {
  return aiRequest('/api/ai/resolution', payload);
}

export function aiChat(message, history = []) {
  return aiRequest('/api/ai/chat', { message, history });
}
