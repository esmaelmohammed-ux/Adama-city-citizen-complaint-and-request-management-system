const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

/** Append recognized speech to a text field via onChange(nextValue). */
export function startVoiceInput({ onResult, onError, onEnd, lang = 'en-US' } = {}) {
  if (!SpeechRecognition) {
    onError?.(new Error('Voice input is not supported in this browser. Try Chrome or Edge.'));
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (transcript) onResult?.(transcript);
  };
  rec.onerror = () => onError?.(new Error('Voice recognition failed. Check microphone permission.'));
  rec.onend = () => onEnd?.();
  rec.start();
  return rec;
}
