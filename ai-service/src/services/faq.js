/** Offline FAQ knowledge for Adama Citizen chatbot (heuristic + LLM grounding). */

export const FAQ_ENTRIES = [
  {
    id: 'track',
    q: ['track', 'status', 'reference', 'where is my', 'follow'],
    a: 'After you submit, you get a reference ID (e.g. CMP-2026-0001). Sign in as a citizen and open My Submissions / Notifications to see Pending → In Progress → Resolved / Closed.',
  },
  {
    id: 'complaint-vs-service',
    q: ['difference', 'complaint', 'service request', 'vs', 'what is'],
    a: 'A Complaint reports a problem (pothole, leak, dark streetlight). A Service Request asks for a service (waste pickup, cleaning, water connection inquiry).',
  },
  {
    id: 'categories',
    q: ['category', 'categories', 'types of complaint'],
    a: 'Complaint categories: Road Maintenance, Waste Management, Water Supply, Street Lighting, Drainage, Public Safety, Noise Pollution, Other.',
  },
  {
    id: 'departments',
    q: ['department', 'which office', 'who handles', 'routing'],
    a: 'Departments include Roads & Infrastructure, Water Supply, Sanitation, and Public Utilities. Admins assign cases to a department or officer; officers work items in their department queue.',
  },
  {
    id: 'photo',
    q: ['photo', 'picture', 'image', 'upload', 'attach'],
    a: 'Citizens can attach an optional photo when submitting a complaint. Use a clear photo of the issue and mention the exact location.',
  },
  {
    id: 'login',
    q: ['login', 'register', 'account', 'password', 'sign in'],
    a: 'Open the Citizen app, Register for a citizen account, then Login. Demo accounts are listed in the project README (citizen/admin/officer).',
  },
  {
    id: 'languages',
    q: ['language', 'amharic', 'oromo', 'afaan', 'english', 'translate'],
    a: 'The portal supports English, Amharic, and Afaan Oromo on the public site and after login (sidebar language switcher).',
  },
  {
    id: 'reject',
    q: ['reject', 'rejected', 'why rejected'],
    a: 'Only administrators can reject pending (or in-progress) items. Officers cannot reject; they start work and resolve/close with notes.',
  },
  {
    id: 'ai-helper',
    q: ['ai', 'helper', 'assistant', 'this tool'],
    a: 'This AI Intake Helper is a sidecar. It suggests clearer text, categories, departments, priority, and similar cases. Always paste results into the main Citizen app — AI does not submit or close cases.',
  },
  {
    id: 'contact',
    q: ['contact', 'phone', 'emergency', 'urgent'],
    a: 'For life-threatening emergencies, contact local emergency services first. For municipal issues, submit a high-priority complaint in the Citizen app with location and details.',
  },
];

export function heuristicChat(message = '') {
  const lower = String(message).toLowerCase();
  if (!lower.trim()) {
    return {
      reply:
        'Ask me anything — general questions, or Adama City portal help (tracking cases, complaint vs service request, categories, departments, photos, login).',
      matchedFaqId: null,
      provider: 'heuristic',
    };
  }

  let best = null;
  let bestScore = 0;
  for (const entry of FAQ_ENTRIES) {
    const score = entry.q.reduce((s, kw) => (lower.includes(kw) ? s + 1 : s), 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (!best || bestScore === 0) {
    return {
      reply:
        'I could not match that to the offline FAQ. With Gemini connected I can answer general questions too — try again in a moment, or ask about tracking cases, categories, departments, photos, or login.',
      matchedFaqId: null,
      suggestions: FAQ_ENTRIES.slice(0, 5).map((e) => e.id),
      provider: 'heuristic',
    };
  }

  return {
    reply: best.a,
    matchedFaqId: best.id,
    provider: 'heuristic',
  };
}
