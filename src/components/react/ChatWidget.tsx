import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const WHATSAPP_NUMBER = '573000000000'; // Cambia por tu número real
const CHATBOT_WEBHOOK = 'https://berformett97.app.n8n.cloud/webhook/nebula-chat';

const WELCOME: Message = {
  role: 'bot',
  text: '¡Hola! Soy el asistente de **Nebula Automation IA**. ¿En qué puedo ayudarte hoy? Puedo resolver dudas sobre nuestros servicios o conectarte con un asesor.',
};

function BotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="url(#cg1)" strokeWidth="1.5"/>
      <ellipse cx="16" cy="16" rx="11" ry="5" stroke="url(#cg2)" strokeWidth="1.5"/>
      <ellipse cx="16" cy="16" rx="5" ry="11" stroke="url(#cg3)" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="3" fill="url(#cg4)"/>
      <defs>
        <linearGradient id="cg1" x1="1" y1="1" x2="31" y2="31"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#ec4899"/></linearGradient>
        <linearGradient id="cg2" x1="5" y1="16" x2="27" y2="16"><stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#ec4899"/></linearGradient>
        <linearGradient id="cg3" x1="16" y1="5" x2="16" y2="27"><stop stopColor="#22d3ee"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient>
        <radialGradient id="cg4"><stop stopColor="#ec4899"/><stop offset="1" stopColor="#8b5cf6"/></radialGradient>
      </defs>
    </svg>
  );
}

function renderText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const r = await fetch(CHATBOT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await r.json();
      const reply = data.reply || data.respuesta || data.text || 'No pude procesar tu consulta.';
      setMessages(m => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Hubo un error. Por favor escríbenos directamente a hola@nebulaautomation.ia' }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          boxShadow: '0 4px 24px rgba(139,92,246,.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms, box-shadow 200ms',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(139,92,246,.7)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(139,92,246,.5)';
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Ventana de chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 998,
          width: 'min(380px, calc(100vw - 2rem))',
          height: 'min(520px, calc(100vh - 8rem))',
          background: '#0d0c1f',
          border: '1px solid rgba(139,92,246,.25)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(139,92,246,.1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatIn 200ms ease',
        }}>

          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(236,72,153,.1))',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            display: 'flex', alignItems: 'center', gap: '.75rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BotIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '.95rem', color: '#f8fafc' }}>
                Nebula AI
              </div>
              <div style={{ fontSize: '.72rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }}/>
                En línea
              </div>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20quiero%20información%20sobre%20Nebula%20Automation%20IA`}
              target="_blank"
              rel="noopener noreferrer"
              title="Hablar por WhatsApp"
              style={{
                marginLeft: 'auto', width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(37,211,102,.15)', border: '1px solid rgba(37,211,102,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '.75rem',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,.3) transparent',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '.6rem .9rem',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                    : 'rgba(255,255,255,.06)',
                  border: m.role === 'bot' ? '1px solid rgba(255,255,255,.08)' : 'none',
                  fontSize: '.85rem', lineHeight: 1.55, color: '#f1f5f9',
                  fontFamily: 'Inter, sans-serif',
                }}
                  dangerouslySetInnerHTML={{ __html: renderText(m.text) }}
                />
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '.6rem .9rem', borderRadius: '18px 18px 18px 4px',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#a78bfa',
                      animation: `bounce 1.2s ease infinite`,
                      animationDelay: `${i * 0.2}s`,
                      display: 'inline-block',
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '.75rem 1rem',
            borderTop: '1px solid rgba(255,255,255,.07)',
            display: 'flex', gap: '.5rem', alignItems: 'flex-end',
            background: 'rgba(255,255,255,.02)',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu mensaje..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 12, padding: '.6rem .85rem',
                color: '#f1f5f9', fontSize: '.85rem',
                fontFamily: 'Inter, sans-serif',
                resize: 'none', outline: 'none', lineHeight: 1.5,
                maxHeight: 100, overflowY: 'auto',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                  : 'rgba(255,255,255,.08)',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatIn {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
