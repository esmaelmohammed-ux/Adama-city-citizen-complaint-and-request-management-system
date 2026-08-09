import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { isVoiceSupported, startVoiceInput } from '../../utils/voiceInput';
import './Ai.css';

export default function VoiceButton({ onTranscript, className = '' }) {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [listening, setListening] = useState(false);
  const supported = isVoiceSupported();

  const handleClick = () => {
    if (!supported) {
      showToast(t('ai.voiceUnsupported'), 'error');
      return;
    }
    if (listening) return;

    setListening(true);
    startVoiceInput({
      lang: language,
      onResult: (text) => {
        onTranscript?.(text);
        showToast(t('ai.voiceCaptured'), 'success');
      },
      onError: (err) => {
        setListening(false);
        showToast(err?.message || t('ai.voiceFailed'), 'error');
      },
      onEnd: () => setListening(false),
    });
  };

  return (
    <button
      type="button"
      className={`btn btn-outline btn-sm ai-voice-btn ${listening ? 'listening' : ''} ${className}`}
      onClick={handleClick}
      disabled={listening}
      title={supported ? t('ai.voiceTitle') : t('ai.voiceUnsupported')}
      aria-label={t('ai.voiceAria')}
    >
      {listening ? t('ai.listening') : t('ai.mic')}
    </button>
  );
}
