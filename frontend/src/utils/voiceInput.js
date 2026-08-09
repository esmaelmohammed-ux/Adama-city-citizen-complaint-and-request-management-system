const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Map app language codes to Web Speech API locales. */
export const SPEECH_LANG_MAP = {
  en: 'en-US',
  am: 'am-ET',
  om: 'om-ET',
};

export function isVoiceSupported() {
  return Boolean(SpeechRecognition);
}

/**
 * Start browser speech-to-text.
 * onResult(transcript), onError(Error), onEnd()
 */
export function startVoiceInput({
  onResult,
  onError,
  onEnd,
  lang = 'en',
} = {}) {
  if (!SpeechRecognition) {
    onError?.(new Error('Voice input is not supported in this browser. Try Chrome or Edge.'));
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = SPEECH_LANG_MAP[lang] || SPEECH_LANG_MAP.en;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  rec.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (transcript) onResult?.(transcript);
  };

  rec.onerror = (event) => {
    const code = event?.error || 'unknown';
    let message = 'Voice recognition failed. Check microphone permission.';
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      message = 'Microphone permission denied. Allow mic access in the browser, then try again.';
    } else if (code === 'no-speech') {
      message = 'No speech detected. Click Mic and speak clearly.';
    } else if (code === 'audio-capture') {
      message = 'No microphone found. Plug in a mic and try again.';
    } else if (code === 'network') {
      message = 'Speech service network error. Check your internet connection.';
    } else if (code === 'language-not-supported') {
      message = 'This language is not supported for voice in your browser. Try English or Chrome.';
    }
    onError?.(new Error(message));
  };

  rec.onend = () => onEnd?.();

  try {
    rec.start();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error('Could not start microphone.'));
    return null;
  }

  return rec;
}
