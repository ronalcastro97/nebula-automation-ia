import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  nombre: string; email: string; empresa: string;
  servicio: string; mensaje: string;
}

const INIT: FormData = { nombre:'', email:'', empresa:'', servicio:'', mensaje:'' };

const input: React.CSSProperties = {
  width:'100%', padding:'.7rem 1rem',
  background:'rgba(255,255,255,.04)',
  border:'1px solid rgba(255,255,255,.1)',
  borderRadius:'10px',
  color:'#f8fafc', fontSize:'.9rem',
  fontFamily:'inherit', outline:'none',
  transition:'border-color 200ms ease',
};
const inputFocus: React.CSSProperties = {
  ...input, borderColor:'rgba(139,92,246,.6)',
  boxShadow:'0 0 0 3px rgba(139,92,246,.1)',
};
const label: React.CSSProperties = {
  display:'block', fontSize:'.72rem', fontWeight:600,
  color:'#94a3b8', marginBottom:'.35rem',
  textTransform:'uppercase', letterSpacing:'.07em',
};

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INIT);
  const [status, setStatus] = useState<Status>('idle');
  const [focused, setFocused] = useState('');
  const url = import.meta.env.PUBLIC_N8N_WEBHOOK_URL || 'https://berformett97.app.n8n.cloud/webhook/nebula-contacto';

  const change = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(p => ({...p, [e.target.name]: e.target.value}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const body = new URLSearchParams({...form, timestamp: new Date().toISOString()});
      const r = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body: body.toString(),
      });
      if (!r.ok) throw new Error();
      setStatus('success'); setForm(INIT);
    } catch { setStatus('error'); }
  };

  const iStyle = (n: string) => focused === n ? inputFocus : input;

  if (status === 'success') return (
    <div style={{textAlign:'center', padding:'2.5rem 1rem'}}>
      <div style={{
        width:64, height:64, borderRadius:'50%', margin:'0 auto 1.25rem',
        background:'rgba(139,92,246,.12)',
        border:'2px solid rgba(139,92,246,.5)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{fontSize:'1.25rem', fontWeight:800, marginBottom:'.5rem', color:'#f8fafc', fontFamily:'Syne, sans-serif'}}>¡Mensaje enviado!</h3>
      <p style={{color:'#94a3b8', fontSize:'.9rem', lineHeight:1.65}}>Te contactamos en menos de 24 horas. ¡Prepárate para automatizar tu negocio!</p>
      <button onClick={() => setStatus('idle')} style={{
        marginTop:'1.5rem', padding:'.55em 1.5em',
        border:'1px solid rgba(139,92,246,.35)', borderRadius:'999px',
        background:'transparent', color:'#a78bfa',
        fontSize:'.85rem', cursor:'pointer', fontFamily:'inherit',
        transition:'all 200ms ease',
      }}>Enviar otro mensaje</button>
    </div>
  );

  return (
    <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
      <h3 style={{fontFamily:'Syne, sans-serif', fontSize:'1.15rem', fontWeight:800, marginBottom:'.25rem', color:'#f8fafc'}}>
        Cuéntanos tu caso
      </h3>

      {/* Row 1 */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem'}}>
        <div>
          <label style={label} htmlFor="nb">Nombre *</label>
          <input id="nb" name="nombre" type="text" required placeholder="Tu nombre"
            value={form.nombre} onChange={change}
            onFocus={()=>setFocused('nombre')} onBlur={()=>setFocused('')}
            style={iStyle('nombre')} disabled={status==='loading'}/>
        </div>
        <div>
          <label style={label} htmlFor="em">Email *</label>
          <input id="em" name="email" type="email" required placeholder="tu@empresa.com"
            value={form.email} onChange={change}
            onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
            style={iStyle('email')} disabled={status==='loading'}/>
        </div>
      </div>

      {/* Empresa */}
      <div>
        <label style={label} htmlFor="ep">Empresa</label>
        <input id="ep" name="empresa" type="text" placeholder="Nombre de tu empresa (opcional)"
          value={form.empresa} onChange={change}
          onFocus={()=>setFocused('empresa')} onBlur={()=>setFocused('')}
          style={iStyle('empresa')} disabled={status==='loading'}/>
      </div>

      {/* Servicio */}
      <div>
        <label style={label} htmlFor="sv">Servicio de interés *</label>
        <select id="sv" name="servicio" required value={form.servicio} onChange={change}
          onFocus={()=>setFocused('servicio')} onBlur={()=>setFocused('')}
          style={{...iStyle('servicio'), cursor:'pointer'}} disabled={status==='loading'}>
          <option value="" disabled>Selecciona un servicio...</option>
          <option value="automatizacion-datos">Automatización de Datos</option>
          <option value="chatbot">Chatbot Empresarial</option>
          <option value="google-sheets">Google Sheets / Excel</option>
          <option value="pagina-web">Página Web con Chatbot</option>
          <option value="otro">Otro / No sé por dónde empezar</option>
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label style={label} htmlFor="ms">Cuéntanos tu caso *</label>
        <textarea id="ms" name="mensaje" required rows={4}
          placeholder="¿Qué procesos quieres automatizar? ¿Qué herramientas usas actualmente?"
          value={form.mensaje} onChange={change}
          onFocus={()=>setFocused('mensaje')} onBlur={()=>setFocused('')}
          style={{...iStyle('mensaje'), resize:'vertical', minHeight:'100px'}}
          disabled={status==='loading'}/>
      </div>

      {/* Error */}
      {status==='error' && (
        <div style={{
          padding:'.75rem 1rem', borderRadius:'10px',
          background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)',
          color:'#fca5a5', fontSize:'.85rem',
        }}>
          Algo salió mal. Escríbenos a <a href="mailto:hola@nebulaautomation.ia"
            style={{color:'#f87171', textDecoration:'underline'}}>hola@nebulaautomation.ia</a>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={status==='loading'}
        style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem',
          padding:'.85em 2em', borderRadius:'999px', border:'none', width:'100%',
          background: status==='loading'
            ? 'rgba(139,92,246,.4)'
            : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          color:'white', fontFamily:'inherit', fontSize:'1rem', fontWeight:700,
          cursor: status==='loading' ? 'not-allowed' : 'pointer',
          boxShadow:'0 0 32px rgba(139,92,246,.4)',
          transition:'transform 200ms, box-shadow 200ms',
          marginTop:'.25rem',
        }}
        onMouseEnter={e => {
          if(status!=='loading'){
            (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 56px rgba(139,92,246,.6)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform='none';
          (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 32px rgba(139,92,246,.4)';
        }}
      >
        {status==='loading' ? (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{animation:'spin 1s linear infinite'}}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Enviando...
          </>
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Enviar Mensaje
          </>
        )}
      </button>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </form>
  );
}
