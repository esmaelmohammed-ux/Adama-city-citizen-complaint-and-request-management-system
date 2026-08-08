import { useState } from 'react';
import { isVoiceSupported, startVoiceInput } from '../../utils/voiceInput';
import './Ai.css';

export default function VoiceButton({ onTranscript, className = '' }) {
  const [listening, setListening] = useState(false);
  const supported = isVoiceSupported();

  const handleClick = () => {
    if (!supported || listening) return;
    setListening(true);
    startVoiceInput({
      onResult: (text) => onTranscript?.(text),
      onError: () => setListening(false),
      onEnd: () => setListening(false),
    });
  };

  return (
    <button
      type="button"
      className={`btn btn-outline btn-sm ai-voice-btn ${listening ? 'listening' : ''} ${className}`}
      onClick={handleClick}
      disabled={!supported || listening}
      title={supported ? 'Dictate with microphone' : 'Voice not supported in this browser'}
      aria-label="Voice input"
    >
      {listening ? 'Listening…' : 'Mic'}
    </button>
  );
}
