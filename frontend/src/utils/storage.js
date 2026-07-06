const STORAGE_KEY = 'adama_citizen_app';
const REMEMBER_ME_KEY = 'adama_citizen_remember_me';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadRememberMe() {
  try {
    const raw = localStorage.getItem(REMEMBER_ME_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRememberMe({ email, rememberMe }) {
  if (rememberMe && email) {
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ email, rememberMe: true }));
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

export function generateId(prefix) {
  const num = String(Date.now()).slice(-6);
  return `${prefix}-2025-${num}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
