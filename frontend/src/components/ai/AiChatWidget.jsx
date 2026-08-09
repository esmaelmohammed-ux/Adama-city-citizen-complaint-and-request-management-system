import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { aiChat } from '../../services/aiApi';
import VoiceButton from './VoiceButton';
import './Ai.css';

export default function AiChatWidget() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('ai.chatGreeting') }]);
  }, [language, t]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    const next = [...messages, { role: 'user', content: message }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const history = next.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
      const data = await aiChat(message, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message || t('ai.chatUnavailable') },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ai-chat-root">
      {open && (
        <div className="ai-chat-panel" role="dialog" aria-label={t('ai.chatTitle')}>
          <div className="ai-chat-head">
            <div>
              <strong>{t('ai.chatTitle')}</strong>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              {t('ai.chatClose')}
            </button>
          </div>
          <div className="ai-chat-log">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`ai-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="ai-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <VoiceButton
              onTranscript={(text) => setInput((prev) => (prev ? `${prev.trim()} ${text}` : text))}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.chatPlaceholder')}
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !input.trim()}>
              {t('ai.chatSend')}
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? '×' : t('ai.chatOpen')}
      </button>
    </div>
  );
}
