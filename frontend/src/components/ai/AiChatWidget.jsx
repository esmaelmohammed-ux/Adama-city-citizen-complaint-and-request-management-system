import { useEffect, useRef, useState } from 'react';
import { aiChat } from '../../services/aiApi';
import VoiceButton from './VoiceButton';
import './Ai.css';

const STARTERS = [
  'How do I track my complaint?',
  'Difference between complaint and service request?',
  'Which department handles water leaks?',
];

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi — I can help with tracking cases, categories, departments, and how this system works.',
    },
  ]);
  const endRef = useRef(null);

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
        { role: 'assistant', content: err.message || 'Chat unavailable right now.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ai-chat-root">
      {open && (
        <div className="ai-chat-panel" role="dialog" aria-label="AI FAQ chatbot">
          <div className="ai-chat-head">
            <div>
              <strong>Adama AI FAQ</strong>
              <span>Suggestions only · not official case actions</span>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Close
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
          <div className="ai-chat-chips">
            {STARTERS.map((s) => (
              <button key={s} type="button" className="ai-chip-btn" onClick={() => send(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="ai-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <VoiceButton
              onTranscript={(t) => setInput((prev) => (prev ? `${prev.trim()} ${t}` : t))}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about complaints, tracking, departments…"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !input.trim()}>
              Send
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
        {open ? '×' : 'AI Help'}
      </button>
    </div>
  );
}
