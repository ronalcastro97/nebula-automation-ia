import { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  nombre: string;
  email: string;
  empresa: string;
  servicio: string;
  mensaje: string;
}

const INITIAL: FormData = {
  nombre: '',
  email: '',
  empresa: '',
  servicio: '',
  mensaje: '',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'oklch(0.10 0.03 275 / 0.8)',
  border: '1px solid oklch(0.55 0.28 295 / 0.2)',
  borderRadius: '10px',
  color: 'oklch(0.93 0.01 264)',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 200ms ease',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'oklch(0.72 0.015 264)',
  marginBottom: '0.4rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const webhookUrl = import.meta.env.PUBLIC_N8N_WEBHOOK_URL;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('webhook error');
      setStatus('success');
      setForm(INITIAL);
    } catch {
      setStatus('error');
    }
  };

  const focusBorder = (name: string): React.CSSProperties => ({
    ...INPUT_STYLE,
    borderColor:
      focusedField === name
        ? 'oklch(0.55 0.28 295 / 0.7)'
        : 'oklch(0.55 0.28 295 / 0.2)',
  });

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'oklch(0.55 0.28 295 / 0.15)',
            border: '2px solid oklch(0.68 0.22 295)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="oklch(0.68 0.22 295)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'oklch(0.93 0.01 264)' }}>
          ¡Mensaje enviado!
        </h3>
        <p style={{ color: 'oklch(0.72 0.015 264)', fontSize: '0.95rem' }}>
          Te contactamos en menos de 24 horas. ¡Prepárate para automatizar!
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            marginTop: '1.5rem',
            padding: '0.6em 1.5em',
            border: '1px solid oklch(0.55 0.28 295 / 0.4)',
            borderRadius: '9999px',
            background: 'transparent',
            color: 'oklch(0.68 0.22 295)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Nombre + Email row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="nombre" style={LABEL_STYLE}>Nombre *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={handleChange}
            onFocus={() => setFocusedField('nombre')}
            onBlur={() => setFocusedField(null)}
            style={focusBorder('nombre')}
            disabled={status === 'loading'}
          />
        </div>
        <div>
          <label htmlFor="email" style={LABEL_STYLE}>Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="tu@empresa.com"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            style={focusBorder('email')}
            disabled={status === 'loading'}
          />
        </div>
      </div>

      {/* Empresa */}
      <div>
        <label htmlFor="empresa" style={LABEL_STYLE}>Empresa / Negocio</label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          placeholder="Nombre de tu empresa (opcional)"
          value={form.empresa}
          onChange={handleChange}
          onFocus={() => setFocusedField('empresa')}
          onBlur={() => setFocusedField(null)}
          style={focusBorder('empresa')}
          disabled={status === 'loading'}
        />
      </div>

      {/* Servicio */}
      <div>
        <label htmlFor="servicio" style={LABEL_STYLE}>Servicio de interés *</label>
        <select
          id="servicio"
          name="servicio"
          required
          value={form.servicio}
          onChange={handleChange}
          onFocus={() => setFocusedField('servicio')}
          onBlur={() => setFocusedField(null)}
          style={{
            ...focusBorder('servicio'),
            cursor: 'pointer',
          }}
          disabled={status === 'loading'}
        >
          <option value="" disabled>Selecciona un servicio...</option>
          <option value="automatizacion-datos">Automatización de Datos</option>
          <option value="chatbot">Chatbot Empresarial</option>
          <option value="google-sheets">Integración Google Sheets / Excel</option>
          <option value="pagina-web">Página Web con Chatbot</option>
          <option value="otro">Otro / No sé por dónde empezar</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="mensaje" style={LABEL_STYLE}>Cuéntanos tu caso *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={4}
          placeholder="Describe brevemente tu negocio y qué procesos quieres automatizar..."
          value={form.mensaje}
          onChange={handleChange}
          onFocus={() => setFocusedField('mensaje')}
          onBlur={() => setFocusedField(null)}
          style={{
            ...focusBorder('mensaje'),
            resize: 'vertical',
            minHeight: '100px',
          }}
          disabled={status === 'loading'}
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'oklch(0.40 0.20 25 / 0.15)',
            border: '1px solid oklch(0.55 0.22 25 / 0.4)',
            color: 'oklch(0.75 0.15 25)',
            fontSize: '0.875rem',
          }}
        >
          Algo salió mal. Intenta de nuevo o escríbenos a{' '}
          <a
            href="mailto:hola@nebulaautomation.ia"
            style={{ color: 'oklch(0.80 0.12 25)', textDecoration: 'underline' }}
          >
            hola@nebulaautomation.ia
          </a>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.85em 2em',
          borderRadius: '9999px',
          border: 'none',
          background:
            status === 'loading'
              ? 'oklch(0.35 0.15 295)'
              : 'linear-gradient(135deg, oklch(0.55 0.28 295), oklch(0.65 0.22 345))',
          color: 'white',
          fontFamily: 'inherit',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          boxShadow: '0 0 40px oklch(0.55 0.28 295 / 0.4)',
          width: '100%',
          marginTop: '0.4rem',
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading') {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 60px oklch(0.55 0.28 295 / 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 40px oklch(0.55 0.28 295 / 0.4)';
        }}
      >
        {status === 'loading' ? (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Enviar Mensaje
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
