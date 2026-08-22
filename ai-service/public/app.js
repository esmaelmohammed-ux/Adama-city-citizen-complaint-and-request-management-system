const providerLabel = document.getElementById('providerLabel');
const chatHistory = [];
window.__last = {};

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderKv(el, rows) {
  el.innerHTML = rows
    .map(([k, v]) => {
      const cls = k === 'Priority' && v === 'high' ? 'priority-high' : '';
      return `<dt>${escapeHtml(k)}</dt><dd class="${cls}">${escapeHtml(String(v ?? '—'))}</dd>`;
    })
    .join('');
}

function renderSimilar(metaEl, listEl, similar) {
  listEl.innerHTML = '';
  if (!similar?.enabled) {
    metaEl.textContent = similar?.message || 'Similar-case search disabled (set MongoDB in .env)';
    return;
  }
  metaEl.textContent = similar.message || `${similar.items.length} possible match(es)`;
  similar.items.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(item.referenceId || '—')}</strong> · ${escapeHtml(
      item.title || ''
    )} <em>(${Math.round((item.score || 0) * 100)}%)</em><br />${escapeHtml(
      String(item.description || '').slice(0, 140)
    )}`;
    listEl.appendChild(li);
  });
}

async function loadMeta() {
  try {
    const res = await fetch('/api/ai/meta');
    const data = await res.json();
    providerLabel.textContent = data.provider;
  } catch {
    providerLabel.textContent = 'unavailable';
  }
}

/* Tabs */
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.mode').forEach((m) => m.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`mode-${tab.dataset.tab}`).classList.add('active');
  });
});

/* Voice (browser Web Speech API — audio stays local) */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const voiceHint = document.getElementById('voiceHint');

if (!SpeechRecognition && voiceHint) {
  voiceHint.textContent = 'Voice input not supported in this browser. Use Chrome or Edge for 🎤.';
}

document.querySelectorAll('[data-voice]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not available in this browser.');
      return;
    }
    const target = document.getElementById(btn.dataset.voice);
    if (!target) return;

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    btn.classList.add('listening');

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        target.value = target.value ? `${target.value.trim()} ${transcript}` : transcript;
      }
    };
    rec.onerror = () => btn.classList.remove('listening');
    rec.onend = () => btn.classList.remove('listening');
    rec.start();
  });
});

/* Citizen */
document.getElementById('citizenForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('citizenStatus');
  const results = document.getElementById('citizenResults');
  const body = {
    type: document.getElementById('cType').value,
    title: document.getElementById('cTitle').value.trim(),
    description: document.getElementById('cDesc').value.trim(),
    location: document.getElementById('cLoc').value.trim(),
  };
  status.textContent = 'Working…';
  results.hidden = false;
  try {
    const res = await fetch('/api/ai/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Assist failed');
    window.__last.citizen = data;
    document.getElementById('cOutTitle').value = data.improved.title || '';
    document.getElementById('cOutDesc').value = data.improved.description || '';
    const c = data.classification;
    renderKv(document.getElementById('citizenKv'), [
      ['Category', c.categoryLabel],
      ['Category ID', c.category || '—'],
      ['Department', c.department],
      ['Priority', c.priority],
      ['Confidence', `${Math.round((c.confidence || 0) * 100)}%`],
      ['Rationale', c.rationale],
    ]);
    renderSimilar(
      document.getElementById('citizenSimilarMeta'),
      document.getElementById('citizenSimilar'),
      data.similar
    );
    status.textContent = 'Ready — copy into Citizen app';
  } catch (err) {
    status.textContent = err.message;
  }
});

/* Admin triage */
document.getElementById('adminForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('adminStatus');
  const results = document.getElementById('adminResults');
  const body = {
    type: document.getElementById('aType').value,
    title: document.getElementById('aTitle').value.trim(),
    description: document.getElementById('aDesc').value.trim(),
    location: document.getElementById('aLoc').value.trim(),
  };
  status.textContent = 'Working…';
  results.hidden = false;
  try {
    const res = await fetch('/api/ai/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Triage failed');
    window.__last.admin = data;
    const a = data.advice;
    renderKv(document.getElementById('adminAdviceKv'), [
      ['Department', a.recommendedDepartment],
      ['Priority', a.recommendedPriority],
      ['Duplicate risk', a.duplicateRisk],
      ['Assign hint', a.assignHint],
      ['Provider', a.provider],
    ]);
    const actions = document.getElementById('adminActions');
    actions.innerHTML = '';
    (a.actions || []).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      actions.appendChild(li);
    });
    const c = data.classification;
    renderKv(document.getElementById('adminClassKv'), [
      ['Category', c.categoryLabel],
      ['Confidence', `${Math.round((c.confidence || 0) * 100)}%`],
      ['Rationale', c.rationale],
    ]);
    renderSimilar(
      document.getElementById('adminSimilarMeta'),
      document.getElementById('adminSimilar'),
      data.similar
    );
    status.textContent = 'Triage ready — apply in admin app';
  } catch (err) {
    status.textContent = err.message;
  }
});

/* Officer */
document.getElementById('officerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('officerStatus');
  const results = document.getElementById('officerResults');
  const body = {
    title: document.getElementById('oTitle').value.trim(),
    description: document.getElementById('oDesc').value.trim(),
    location: document.getElementById('oLoc').value.trim(),
    category: document.getElementById('oCat').value.trim(),
    actionTaken: document.getElementById('oAction').value.trim(),
    outcome: document.getElementById('oOutcome').value,
  };
  status.textContent = 'Working…';
  results.hidden = false;
  try {
    const res = await fetch('/api/ai/resolution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Draft failed');
    window.__last.officer = data;
    document.getElementById('oOutNote').value = data.resolutionNote || '';
    document.getElementById('oOutCitizen').textContent = data.citizenUpdate || '';
    const list = document.getElementById('oChecklist');
    list.innerHTML = '';
    (data.internalChecklist || []).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });
    status.textContent = 'Draft ready — paste into resolution note';
  } catch (err) {
    status.textContent = err.message;
  }
});

/* Chatbot */
const chatLog = document.getElementById('chatLog');

function appendBubble(role, text) {
  const div = document.createElement('div');
  div.className = `bubble ${role === 'user' ? 'user' : 'bot'}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendChat(message) {
  const text = message.trim();
  if (!text) return;
  appendBubble('user', text);
  chatHistory.push({ role: 'user', content: text });
  document.getElementById('chatInput').value = '';
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: chatHistory }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Chat failed');
    appendBubble('bot', data.reply);
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    appendBubble('bot', err.message);
  }
}

document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  sendChat(document.getElementById('chatInput').value);
});

document.querySelectorAll('[data-ask]').forEach((chip) => {
  chip.addEventListener('click', () => sendChat(chip.dataset.ask));
});

appendBubble('bot', 'Hi — ask me how to track cases, pick categories, or use departments in the Adama Citizen system.');

/* Clear buttons */
document.querySelectorAll('[data-clear]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const which = btn.dataset.clear;
    if (which === 'citizen') {
      document.getElementById('citizenForm').reset();
      document.getElementById('citizenResults').hidden = true;
    }
    if (which === 'admin') {
      document.getElementById('adminForm').reset();
      document.getElementById('adminResults').hidden = true;
    }
    if (which === 'officer') {
      document.getElementById('officerForm').reset();
      document.getElementById('officerResults').hidden = true;
    }
  });
});

/* Copy */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const key = btn.dataset.copy;
    let text = '';
    if (key === 'citizen-improved' && window.__last.citizen) {
      const i = window.__last.citizen.improved;
      text = `Title: ${i.title}\n\nDescription: ${i.description}`;
    } else if (key === 'citizen-class' && window.__last.citizen) {
      const c = window.__last.citizen.classification;
      text = `Category: ${c.categoryLabel}\nCategory ID: ${c.category || 'n/a'}\nDepartment: ${c.department}\nPriority: ${c.priority}`;
    } else if (key === 'admin-advice' && window.__last.admin) {
      const a = window.__last.admin.advice;
      text = [`Department: ${a.recommendedDepartment}`, `Priority: ${a.recommendedPriority}`, `Duplicate risk: ${a.duplicateRisk}`, '', ...(a.actions || [])].join('\n');
    } else if (key === 'officer-note' && window.__last.officer) {
      text = window.__last.officer.resolutionNote;
    }
    if (!text) return;
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied';
    setTimeout(() => {
      btn.textContent = 'Copy';
    }, 1200);
  });
});

loadMeta();
