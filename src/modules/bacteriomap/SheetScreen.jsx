// SheetScreen.jsx — Fiche bactérie
// Carrousel images · sommaire sticky · meta-bar sticky
import React from 'react';
import { T } from './data.js';
import { SYSTEMS, getSystemPalette, gramColor } from './shared.jsx';
import { supabase } from '../../lib/supabase.js';

const GRAM_MAP = { positif: '+', négatif: '−', aucun: 'F' }

// Parse JSONB fields that may arrive as a string (e.g. stored by admin as JSON text)
function parseJSONField(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return [] } }
  return []
}

// Striped placeholder for empty carrousel
function PlateauPlaceholder({ accent }) {
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'100%' }}>
      <defs>
        <pattern id="stripes-ph" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="var(--bgSoft)"/>
          <line x1="0" y1="0" x2="0" y2="14" stroke={accent} strokeWidth="0.7" strokeOpacity="0.18"/>
        </pattern>
      </defs>
      <rect width="400" height="260" fill="url(#stripes-ph)"/>
      <text x="200" y="124" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2" fill="var(--ink3)">AUCUNE IMAGE</text>
      <text x="200" y="144" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1.5" fill="var(--ink3)" opacity="0.55">[ aucune image ]</text>
    </svg>
  );
}

// Image carrousel — all images, ← → nav, CSS transform
function Carrousel({ images, accent, onOpen }) {
  const [idx, setIdx] = React.useState(0);
  const total = images.length;

  React.useEffect(() => { setIdx(0); }, [total]);

  if (total === 0) {
    return (
      <div style={{ aspectRatio:'16/7', border:`0.5px solid ${T.rule}`, overflow:'hidden' }}>
        <PlateauPlaceholder accent={accent}/>
      </div>
    );
  }

  const img = images[idx];
  const label = img.label || `Image ${idx + 1}`;

  return (
    <figure style={{ margin:0 }}>
      <div style={{ position:'relative', border:`0.5px solid ${T.rule}`, overflow:'hidden', aspectRatio:'16/7', cursor: total > 0 ? 'zoom-in' : 'default' }}
           onClick={() => onOpen(idx)}>
        {/* Slide strip */}
        <div style={{
          display:'flex',
          transform:`translateX(-${idx * 100}%)`,
          transition:'transform 0.3s ease',
          width:`${total * 100}%`,
          height:'100%',
        }}>
          {images.map((im, i) => (
            <div key={im.id || i} style={{ flex:`0 0 ${100/total}%`, height:'100%' }}>
              <img src={im.url} alt={im.label || `Image ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
            </div>
          ))}
        </div>

        {/* Position indicator */}
        {total > 1 && (
          <div style={{ position:'absolute', top:10, right:12, fontFamily:T.mono, fontSize:9, color:'rgba(248,243,229,.8)', letterSpacing:'0.1em', background:'rgba(15,12,8,0.45)', padding:'2px 7px' }}>
            {idx + 1} / {total}
          </div>
        )}

        {/* Nav buttons */}
        {total > 1 && (
          <>
            <button onClick={e=>{ e.stopPropagation(); setIdx(i=>(i-1+total)%total); }}
                    style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', background:'rgba(15,12,8,0.45)', border:'1px solid rgba(248,243,229,.3)', color:'rgba(248,243,229,.9)', width:36, height:36, fontFamily:T.serif, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
            <button onClick={e=>{ e.stopPropagation(); setIdx(i=>(i+1)%total); }}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'rgba(15,12,8,0.45)', border:'1px solid rgba(248,243,229,.3)', color:'rgba(248,243,229,.9)', width:36, height:36, fontFamily:T.serif, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
          </>
        )}
      </div>
      <figcaption style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink2, marginTop:8, lineHeight:1.35, display:'flex', alignItems:'baseline', gap:8 }}>
        <span style={{ fontFamily:T.mono, fontStyle:'normal', fontSize:9, color:T.ink3, letterSpacing:'0.14em' }}>PL. {idx + 1}</span>
        {label}
      </figcaption>
    </figure>
  );
}

// Lightbox overlay — works with images[] array
function Lightbox({ bact, openIdx, onClose, images }) {
  const total = images.length;
  const [idx, setIdx] = React.useState(openIdx ?? 0);
  React.useEffect(() => { if (openIdx != null) setIdx(openIdx); }, [openIdx]);

  React.useEffect(() => {
    if (openIdx == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setIdx(i => (i + 1) % Math.max(total, 1));
      else if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + Math.max(total, 1)) % Math.max(total, 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [openIdx, onClose, total]);

  if (openIdx == null) return null;

  const img = images[idx];
  const label = img?.label || `Image ${idx + 1}`;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(15,12,8,0.94)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'48px 64px', cursor:'zoom-out',
    }}>
      {/* Top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'18px 28px', display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:'rgba(248,243,229,.6)', letterSpacing:'0.16em' }}>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:13, color:'rgba(248,243,229,.85)' }}>{bact?.name}</span>
        <span style={{ flex:1 }}/>
        {total > 0 && <span>{(idx + 1).toString().padStart(2,'0')} / {total.toString().padStart(2,'0')}</span>}
        <span style={{ margin:'0 14px', opacity:0.4 }}>·</span>
        <span onClick={onClose} style={{ cursor:'pointer', padding:'4px 10px', border:'1px solid rgba(248,243,229,.3)' }}>ESC</span>
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button onClick={e=>{ e.stopPropagation(); setIdx(i=>(i-1+total)%total); }}
                  style={{ position:'absolute', left:24, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'1px solid rgba(248,243,229,.25)', color:'rgba(248,243,229,.85)', width:44, height:44, fontFamily:T.serif, fontSize:22, cursor:'pointer' }}>←</button>
          <button onClick={e=>{ e.stopPropagation(); setIdx(i=>(i+1)%total); }}
                  style={{ position:'absolute', right:24, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'1px solid rgba(248,243,229,.25)', color:'rgba(248,243,229,.85)', width:44, height:44, fontFamily:T.serif, fontSize:22, cursor:'pointer' }}>→</button>
        </>
      )}

      {/* Image */}
      <div onClick={e=>e.stopPropagation()} style={{ cursor:'default', maxWidth:'min(1100px, 86vw)', maxHeight:'78vh', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ background:'var(--qr-bg)', border:'1px solid rgba(248,243,229,.12)', padding:14 }}>
          <div style={{ width:'min(1000px, 80vw)', maxWidth:'100%', maxHeight:'66vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {img ? (
              <img src={img.url} alt={label} style={{ maxWidth:'100%', maxHeight:'66vh', display:'block' }}/>
            ) : (
              <div style={{ minHeight:300, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.mono, fontSize:11, color:'rgba(248,243,229,.45)', letterSpacing:'0.18em' }}>
                [ AUCUNE IMAGE ]
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop:18, textAlign:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:'rgba(248,243,229,.85)' }}>
          <span style={{ fontFamily:T.mono, fontStyle:'normal', fontSize:9, color:'rgba(248,243,229,.55)', letterSpacing:'0.18em', marginRight:8 }}>PL. {idx + 1}</span>
          {label}
        </div>
      </div>
    </div>
  );
}

// Section heading
function SectionTitle({ n, title, anchor, accent, right }) {
  return (
    <div id={anchor} style={{ display:'grid', gridTemplateColumns:'42px 1fr auto', alignItems:'baseline', padding:'18px 0 8px', borderBottom:`1px solid ${T.rule}`, marginBottom:12, scrollMarginTop:96 }}>
      <span style={{ fontFamily:T.mono, fontSize:10, color:accent, letterSpacing:'0.14em' }}>§ {n}</span>
      <span style={{ fontFamily:T.serif, fontSize:18, fontWeight:500, letterSpacing:'-0.005em' }}>{title}</span>
      {right ? <span style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.12em' }}>{right}</span> : null}
    </div>
  );
}

export default function SheetScreen({ navigate, bacteriaId, systemId = 'orl', vivid = false, showImages = true }) {
  const [b, setB] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [antiTab, setAntiTab] = React.useState('tableau');
  const [lightbox, setLightbox] = React.useState(null);
  const [activeAnchor, setActiveAnchor] = React.useState('s02');

  React.useEffect(() => {
    setLoading(true);
    if (!bacteriaId) { setLoading(false); return; }
    supabase
      .from('bacterio_bacteria')
      .select('*, bacterio_images(*)')
      .eq('name', bacteriaId)
      .single()
      .then(({ data }) => { if (data) setB(data); setLoading(false); });
  }, [bacteriaId]);

  // Scroll-spy (re-runs when b changes so IDs are in DOM)
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveAnchor(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ['s02','s03','s04','s05','s06','s07','s08'].forEach(id => {
      const el = document.getElementById(id); if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [b]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, color:T.ink3, fontStyle:'italic' }}>
      Chargement…
    </div>
  );

  if (!b) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, color:T.ink3, fontStyle:'italic' }}>
      Bactérie introuvable.
    </div>
  );

  // ── Derived data ──────────────────────────────────────────────────────────

  const gram = GRAM_MAP[b.gram] || b.gram || '?';
  const palette = getSystemPalette(systemId);
  const accent = palette.accent;
  const sys = SYSTEMS.find(s => s.id === systemId) || SYSTEMS[2];
  const sysIdx = SYSTEMS.indexOf(sys);
  const sysRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][sysIdx];
  const genus = b.name?.split(' ')[0] || '';

  const images = Array.isArray(b.bacterio_images) ? b.bacterio_images : [];
  const milieux = parseJSONField(b.milieux);
  const antibiogramme = parseJSONField(b.antibiogramme);
  const resistNat = Array.isArray(b.resist_nat) ? b.resist_nat : [];
  const resistAcq = Array.isArray(b.resist_acq) ? b.resist_acq : [];
  const virulence = Array.isArray(b.virulence) ? b.virulence : [];

  // Rapid tests — only include fields with values (not null)
  const rapidTests = [
    b.catalase    != null && { k: 'Catalase',    v: b.catalase    ? '+' : '−' },
    b.oxydase     != null && { k: 'Oxydase',     v: b.oxydase     ? '+' : '−' },
    b.coagulase   != null && { k: 'Coagulase',   v: b.coagulase   ? '+' : '−' },
    b.sporulation != null && { k: 'Sporulation', v: b.sporulation ? '+' : '−' },
    ...(Array.isArray(b.tests_rapides) ? b.tests_rapides : []),
  ].filter(Boolean);

  // Meta bar — skip null boolean fields
  const metaItems = [
    { k: 'GRAM', v: gram },
    b.catalase    != null && { k: 'CATALASE',    v: b.catalase    ? '+' : '−' },
    b.oxydase     != null && { k: 'OXYDASE',     v: b.oxydase     ? '+' : '−' },
    b.coagulase   != null && { k: 'COAGULASE',   v: b.coagulase   ? '+' : '−' },
    b.sporulation != null && { k: 'SPORULATION', v: b.sporulation ? '+' : '−' },
    b.atmosphere  && { k: 'O₂', v: b.atmosphere },
    { k: 'BSL', v: b.bsl3 ? '3' : '2' },
  ].filter(Boolean);

  const showAntiboPanel = !!b.antibio;
  const premierAb = b.antibio ? b.antibio.split(/[.;]/)[0].trim() : '';

  const badges = [
    b.urgence     && { l: 'URGENCE',      col: T.red   },
    b.bsl3        && { l: 'BSL-3',        col: T.ink2  },
    b.freq        && { l: b.freq.toUpperCase(), col: T.ink2 },
    b.declaration && { l: 'DÉCLARATION',  col: T.ink2  },
  ].filter(Boolean);

  // Visible sections (hide empty ones)
  const allSections = [
    { id:'s02', n:'02', label:'Microscopie & culture', show: true },
    { id:'s03', n:'03', label:'Identification',        show: !!b.identif },
    { id:'s04', n:'04', label:'Clinique',              show: !!(b.clinical_info || b.clinique) },
    { id:'s05', n:'05', label:'Antibiogramme',         show: antibiogramme.length > 0 },
    { id:'s06', n:'06', label:'Résistances',           show: resistNat.length > 0 || resistAcq.length > 0 },
    { id:'s07', n:'07', label:'Virulence',             show: virulence.length > 0 },
    { id:'s08', n:'08', label:'Remarques',             show: !!b.commentaire },
  ];
  const sections = allSections.filter(s => s.show);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, '--accent': accent, background:T.bg }}>

      {/* ── Running head ── */}
      <div style={{ padding:'10px 48px', borderBottom:`3px solid ${accent}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('zone',{systemId})}>← Chapitre {sysRoman} · {sys.short || sys.label}</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>{b.name}</span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <div style={{ marginLeft:18, display:'flex', gap:6 }}>
          <button style={{ height:24, padding:'0 10px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer', color:T.ink2 }}>↳ COMPARER</button>
          <button style={{ height:24, padding:'0 10px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer', color:T.ink2 }}>⎙ IMPRIMER</button>
        </div>
      </div>

      {/* ── Title block ── */}
      <div style={{ padding:'28px 48px 16px', background:T.paper, borderBottom:`1px solid ${T.rule}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:accent, letterSpacing:'0.2em', marginBottom:8 }}>GENRE {genus.toUpperCase()}</div>
          <h1 style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:62, fontWeight:500, letterSpacing:'-0.022em', lineHeight:0.95, margin:0 }}>
            {b.name}
          </h1>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:32, marginTop:14 }}>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, lineHeight:1.5, maxWidth:740 }}>
              {b.identif || b.clinical_info || ''}
            </div>
            {badges.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                {badges.map(p => (
                  <span key={p.l} style={{ fontFamily:T.mono, fontSize:9, padding:'3px 8px', border:`1px solid ${p.col === T.red ? T.red : T.rule}`, color:p.col, letterSpacing:'0.08em' }}>{p.l}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky meta bar ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:T.paper, borderBottom:`1px solid ${T.rule}`, boxShadow:'0 1px 0 rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:`repeat(${metaItems.length}, 1fr)${showAntiboPanel ? ' 220px' : ''}`, alignItems:'stretch' }}>
          {metaItems.map((m, i) => (
            <div key={m.k} style={{ padding:'10px 12px', borderLeft: i === 0 ? 'none' : `1px solid ${T.ruleSoft}`, display:'flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontFamily:T.mono, fontSize:8.5, color:T.ink3, letterSpacing:'0.14em' }}>{m.k}</span>
              <span style={{ fontFamily:T.serif, fontSize:20, lineHeight:1, fontWeight:500 }}>{m.v}</span>
            </div>
          ))}
          {showAntiboPanel && (
            <div style={{ borderLeft:`1px solid ${T.rule}`, background:T.qrBg, color:T.qrInk, padding:'10px 14px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <span style={{ fontFamily:T.mono, fontSize:8.5, color:T.qrMute, letterSpacing:'0.16em' }}>1ʳᵉ INTENTION</span>
              <span style={{ fontFamily:T.serif, fontSize:16, fontWeight:500, lineHeight:1.2, marginTop:2 }}>{premierAb}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Carrousel planches ── */}
      <div style={{ padding:'24px 48px 20px', background:T.paper, borderBottom:`1px solid ${T.rule}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.18em' }}>§ 01 · PLANCHES — MORPHOLOGIE</span>
            {images.length > 1 && (
              <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink3 }}>cliquer pour agrandir · ←/→ pour naviguer</span>
            )}
          </div>
          <Carrousel images={images} accent={accent} onOpen={setLightbox}/>
        </div>
      </div>

      {/* ── Body : sommaire + main column ── */}
      <div style={{ background:T.paper, flex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'160px 1fr', gap:32, padding:'28px 48px 64px' }}>

          {/* Sommaire sticky — only visible sections */}
          <nav style={{ position:'sticky', top:88, alignSelf:'start', borderTop:`1px solid ${T.rule}`, paddingTop:12 }}>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.18em', marginBottom:10 }}>SOMMAIRE</div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:2 }}>
              {sections.map((s) => {
                const active = activeAnchor === s.id;
                return (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                       onClick={(e)=>{ e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior:'smooth', block:'start' }); }}
                       style={{
                         display:'grid', gridTemplateColumns:'22px 1fr', alignItems:'baseline',
                         padding:'5px 0', textDecoration:'none',
                         fontFamily:T.serif, fontSize:13, color: active ? T.ink : T.ink3,
                         borderLeft: active ? `2px solid ${accent}` : '2px solid transparent',
                         paddingLeft:8,
                       }}>
                      <span style={{ fontFamily:T.mono, fontSize:9, color: active ? accent : T.ink3, letterSpacing:'0.1em' }}>{s.n}</span>
                      <span style={{ fontStyle: active ? 'normal' : 'italic' }}>{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main column */}
          <main style={{ minWidth:0 }}>

            {/* §02 Microscopie & culture — always shown */}
            <SectionTitle n="02" title="Microscopie & culture" anchor="s02" accent={accent} right="LECTURE 24H"/>
            {milieux.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                {milieux.map((m, i) => {
                  const mName = typeof m === 'string' ? m : (m.name || JSON.stringify(m));
                  const mNote = typeof m === 'object' ? m.note : null;
                  const mPrim = typeof m === 'object' ? m.primary : false;
                  return (
                    <div key={mName + i} style={{ background:T.bg, border:`0.5px solid ${T.rule}`, padding:'10px 12px', borderLeft:`3px solid ${mPrim ? accent : T.rule}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500 }}>{mName}</div>
                        {mPrim && <span style={{ fontFamily:T.mono, fontSize:9, color:accent, letterSpacing:'0.12em' }}>1ʳᵉ</span>}
                      </div>
                      {mNote && <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink2, marginTop:3, lineHeight:1.4 }}>{mNote}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ink3, marginBottom:14 }}>Données non renseignées.</p>
            )}
            {rapidTests.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(rapidTests.length, 4)}, 1fr)`, border:`1px solid ${T.rule}`, marginBottom:8 }}>
                {rapidTests.map((r, i) => (
                  <div key={r.k} style={{ padding:'8px 12px', borderRight: i < rapidTests.length - 1 ? `1px solid ${T.ruleSoft}` : 'none', background: i % 2 === 0 ? T.bg : T.paper }}>
                    <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em' }}>{r.k}</div>
                    <div style={{ fontFamily:T.serif, fontSize:26, lineHeight:1, marginTop:4, fontWeight:500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* §03 Identification — hidden if empty */}
            {!!b.identif && (
              <>
                <SectionTitle n="03" title="Identification" anchor="s03" accent={accent}/>
                <p style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink, margin:0 }}>{b.identif}</p>
              </>
            )}

            {/* §04 Clinique — hidden if empty */}
            {!!(b.clinical_info || b.clinique) && (
              <>
                <SectionTitle n="04" title="Signification clinique" anchor="s04" accent={accent}/>
                <p style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink, margin:0 }}>{b.clinical_info || b.clinique}</p>
              </>
            )}

            {/* §05 Antibiogramme — hidden if no data */}
            {antibiogramme.length > 0 && (
              <>
                <SectionTitle n="05" title="Antibiogramme" anchor="s05" accent={accent} right={
                  <div style={{ display:'flex', gap:4 }}>
                    {['tableau','résumé'].map(k=>(
                      <button key={k} onClick={()=>setAntiTab(k)} style={{ padding:'2px 8px', background: antiTab===k ? T.ink : 'transparent', color: antiTab===k ? T.paper : T.ink3, border:`1px solid ${antiTab===k ? T.ink : T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer' }}>{k.toUpperCase()}</button>
                    ))}
                  </div>
                }/>
                {antiTab === 'tableau' ? (
                  <div style={{ border:`1px solid ${T.rule}` }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', padding:'6px 12px', background:T.bgSoft, fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.12em', borderBottom:`1px solid ${T.rule}` }}>
                      <span>ANTIBIOTIQUE</span><span>S / I / R</span>
                    </div>
                    {antibiogramme.map((row, i) => {
                      const sens = row.sens || row.statut || '?';
                      const col = sens === 'S' ? T.green : sens === 'R' ? T.red : accent;
                      return (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px', padding:'7px 12px', borderBottom: i < antibiogramme.length-1 ? `1px solid ${T.ruleSoft}` : 'none', fontFamily:T.serif, fontSize:13, alignItems:'center', background: i%2===0 ? T.paper : T.bg }}>
                          <span style={{ fontStyle:'italic', fontWeight:500 }}>{row.ab}</span>
                          <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:col }}>{sens}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink }}>{b.antibio || '—'}</div>
                )}
              </>
            )}

            {/* §06 Résistances — hidden if both arrays empty */}
            {(resistNat.length > 0 || resistAcq.length > 0) && (
              <>
                <SectionTitle n="06" title="Résistances" anchor="s06" accent={accent}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, fontFamily:T.serif }}>
                  <div>
                    <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.14em', marginBottom:6 }}>NATURELLES</div>
                    {resistNat.length > 0 ? (
                      <ul style={{ paddingLeft:16, margin:0, fontSize:13.5, lineHeight:1.6 }}>
                        {resistNat.map(x=><li key={x}>{x}</li>)}
                      </ul>
                    ) : (
                      <p style={{ fontStyle:'italic', fontSize:13, color:T.ink3, margin:0 }}>—</p>
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.14em', marginBottom:6 }}>ACQUISES</div>
                    {resistAcq.length > 0 ? (
                      <ul style={{ paddingLeft:16, margin:0, fontSize:13.5, lineHeight:1.6 }}>
                        {resistAcq.map(x=><li key={x}>{x}</li>)}
                      </ul>
                    ) : (
                      <p style={{ fontStyle:'italic', fontSize:13, color:T.ink3, margin:0 }}>—</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* §07 Virulence — hidden if empty */}
            {virulence.length > 0 && (
              <>
                <SectionTitle n="07" title="Facteurs de virulence" anchor="s07" accent={accent}/>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px', borderTop:`1px solid ${T.ruleSoft}` }}>
                  {virulence.map((v, i)=>(
                    <li key={v} style={{ padding:'6px 0', borderBottom:`1px solid ${T.ruleSoft}`, fontFamily:T.serif, fontSize:13.5, display:'flex', gap:10 }}>
                      <span style={{ fontFamily:T.mono, fontSize:9.5, color:accent, letterSpacing:'0.05em' }}>0{i+1}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* §08 Remarques — hidden if empty */}
            {!!b.commentaire && (
              <>
                <SectionTitle n="08" title="Remarques" anchor="s08" accent={accent}/>
                <p style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink, margin:0 }}>{b.commentaire}</p>
              </>
            )}

          </main>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox bact={b} openIdx={lightbox} onClose={()=>setLightbox(null)} images={images}/>
    </div>
  );
}
