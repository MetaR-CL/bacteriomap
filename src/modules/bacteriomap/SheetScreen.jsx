// SheetScreen.jsx — Fiche bactérie, refonte densité quotidienne
// Carrousel 3 planches cliquable → lightbox · sommaire sticky · meta-bar sticky
import React from 'react';
import { T, SPN_ANTIBIO } from './data.js';
import { SYSTEMS, SPN, getSystemPalette, gramColor } from './shared.jsx';
import { supabase } from '../../lib/supabase.js';

const SHEET_SLOTS = [
  { key: 'gram',    label: 'Coloration de Gram',        caption: '×1000 · immersion',     fig: 'I'   },
  { key: 'culture', label: 'Culture · gélose au sang',  caption: '24 h · α-hémolyse',     fig: 'II'  },
  { key: 'meb',     label: 'Microscopie électronique',  caption: '×6000 · contraste neg.',fig: 'III' },
];

// Multi-slot image hook
function useBactImageSlot(name, slot) {
  const key = `bm-img:${name}:${slot}`;
  const [img, setImg] = React.useState(() => { try { return localStorage.getItem(key); } catch (e) { return null; } });
  React.useEffect(() => {
    const fn = () => { try { setImg(localStorage.getItem(key)); } catch (e) {} };
    window.addEventListener('bm-img-updated', fn);
    return () => window.removeEventListener('bm-img-updated', fn);
  }, [key]);
  const set = (dataUrl) => {
    try {
      if (dataUrl) localStorage.setItem(key, dataUrl);
      else localStorage.removeItem(key);
      window.dispatchEvent(new Event('bm-img-updated'));
    } catch (e) {}
    setImg(dataUrl);
  };
  return [img, set];
}

// Striped placeholder for empty slot
function PlateauPlaceholder({ label, caption, accent }) {
  const stripeId = `stripes-${label.replace(/\s+/g,'-')}`;
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:'100%' }}>
      <defs>
        <pattern id={stripeId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="var(--bgSoft)"/>
          <line x1="0" y1="0" x2="0" y2="14" stroke={accent} strokeWidth="0.7" strokeOpacity="0.18"/>
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#${stripeId})`}/>
      <text x="100" y="96" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" letterSpacing="2" fill="var(--ink3)">{label.toUpperCase()}</text>
      <text x="100" y="112" textAnchor="middle" fontFamily="Newsreader, serif" fontStyle="italic" fontSize="9" fill="var(--ink3)" opacity="0.7">{caption}</text>
      <text x="100" y="132" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="1.5" fill="var(--ink3)" opacity="0.55">[ déposer image ]</text>
    </svg>
  );
}

// One planche in the carrousel
function Planche({ bact, slot, idx, onOpen, accent }) {
  const [img, setImg] = useBactImageSlot(bact.name, idx);
  const fileRef = React.useRef(null);
  const onPick = (e) => { e.stopPropagation(); fileRef.current && fileRef.current.click(); };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImg(ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };
  const onClear = (e) => { e.stopPropagation(); setImg(null); };

  return (
    <figure style={{ margin:0, display:'flex', flexDirection:'column' }}>
      <div
        onClick={() => onOpen(idx)}
        style={{
          position:'relative',
          background:'var(--paper)',
          border:`0.5px solid ${T.rule}`,
          padding:8,
          cursor:'zoom-in',
          aspectRatio:'4 / 5',
        }}
        title="Cliquer pour agrandir"
      >
        <div style={{ position:'absolute', top:14, left:14, fontFamily:T.mono, fontSize:8, color:T.ink3, letterSpacing:'0.18em', zIndex:2 }}>
          PL. {slot.fig}
        </div>
        <div style={{ width:'100%', height:'100%', overflow:'hidden', position:'relative' }}>
          {img ? (
            <img src={img} alt={slot.label} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          ) : (
            <PlateauPlaceholder label={slot.key} caption={slot.caption} accent={accent}/>
          )}
        </div>
        <button onClick={onPick} title="Déposer une image"
                style={{ position:'absolute', top:8, right:8, width:22, height:22, padding:0, border:`0.5px solid ${T.rule}`, background:'rgba(255,255,255,.85)', color:T.ink3, fontSize:13, lineHeight:'20px', cursor:'pointer', borderRadius:1 }}>+</button>
        {img && (
          <button onClick={onClear} title="Retirer"
                  style={{ position:'absolute', top:8, right:34, width:22, height:22, padding:0, border:`0.5px solid ${T.rule}`, background:'rgba(255,255,255,.85)', color:T.ink3, fontSize:13, lineHeight:'20px', cursor:'pointer', borderRadius:1 }}>×</button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:'none' }}/>
      </div>
      <figcaption style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink2, marginTop:8, lineHeight:1.35 }}>
        <span style={{ fontFamily:T.mono, fontStyle:'normal', fontSize:9, color:T.ink3, letterSpacing:'0.14em', marginRight:6 }}>FIG. {slot.fig}</span>
        {slot.label}
        <span style={{ color:T.ink3 }}> — {slot.caption}</span>
      </figcaption>
    </figure>
  );
}

// Lightbox overlay
function Lightbox({ bact, openIdx, onClose }) {
  const [idx, setIdx] = React.useState(openIdx);
  React.useEffect(() => { setIdx(openIdx); }, [openIdx]);
  const slot = SHEET_SLOTS[idx];
  const [img] = useBactImageSlot(bact.name, idx);

  React.useEffect(() => {
    if (openIdx == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % SHEET_SLOTS.length);
      else if (e.key === 'ArrowLeft')  setIdx((i) => (i - 1 + SHEET_SLOTS.length) % SHEET_SLOTS.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [openIdx, onClose]);

  if (openIdx == null) return null;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(15,12,8,0.94)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'48px 64px', cursor:'zoom-out',
    }}>
      {/* Top bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'18px 28px', display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:'rgba(248,243,229,.6)', letterSpacing:'0.16em' }}>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:13, color:'rgba(248,243,229,.85)' }}>{bact.name}</span>
        <span style={{ flex:1 }}/>
        <span>{(idx + 1).toString().padStart(2,'0')} / {SHEET_SLOTS.length.toString().padStart(2,'0')}</span>
        <span style={{ margin:'0 14px', opacity:0.4 }}>·</span>
        <span onClick={onClose} style={{ cursor:'pointer', padding:'4px 10px', border:'1px solid rgba(248,243,229,.3)' }}>ESC</span>
      </div>

      {/* Arrows */}
      <button onClick={(e)=>{ e.stopPropagation(); setIdx((i)=>(i-1+SHEET_SLOTS.length)%SHEET_SLOTS.length); }}
              style={{ position:'absolute', left:24, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'1px solid rgba(248,243,229,.25)', color:'rgba(248,243,229,.85)', width:44, height:44, fontFamily:T.serif, fontSize:22, cursor:'pointer' }}>←</button>
      <button onClick={(e)=>{ e.stopPropagation(); setIdx((i)=>(i+1)%SHEET_SLOTS.length); }}
              style={{ position:'absolute', right:24, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'1px solid rgba(248,243,229,.25)', color:'rgba(248,243,229,.85)', width:44, height:44, fontFamily:T.serif, fontSize:22, cursor:'pointer' }}>→</button>

      {/* Image */}
      <div onClick={(e)=>e.stopPropagation()} style={{ cursor:'default', maxWidth:'min(1100px, 86vw)', maxHeight:'78vh', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ background:'var(--qr-bg)', border:'1px solid rgba(248,243,229,.12)', padding:14 }}>
          <div style={{ width:'min(1000px, 80vw)', maxWidth:'100%', aspectRatio: img ? 'auto' : '4 / 3', maxHeight:'66vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {img ? (
              <img src={img} alt={slot.label} style={{ maxWidth:'100%', maxHeight:'66vh', display:'block' }}/>
            ) : (
              <div style={{ width:'100%', height:'100%', minHeight:300, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, fontFamily:T.mono, fontSize:11, color:'rgba(248,243,229,.45)', letterSpacing:'0.18em' }}>
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:22, color:'rgba(248,243,229,.85)', letterSpacing:0 }}>{slot.label}</div>
                <div>[ AUCUNE IMAGE DÉPOSÉE ]</div>
                <div style={{ marginTop:8, opacity:0.6 }}>Retour fiche · cliquer le « + » sur la planche</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop:18, textAlign:'center', fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:'rgba(248,243,229,.85)' }}>
          <span style={{ fontFamily:T.mono, fontStyle:'normal', fontSize:9, color:'rgba(248,243,229,.55)', letterSpacing:'0.18em', marginRight:8 }}>PL. {slot.fig}</span>
          {slot.label} <span style={{ color:'rgba(248,243,229,.55)' }}>— {slot.caption}</span>
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
  const [b, setB] = React.useState(SPN);

  React.useEffect(() => {
    if (!bacteriaId) { setB(SPN); return; }
    supabase
      .from('bacterio_bacteria')
      .select('*, bacterio_images(*)')
      .eq('name', bacteriaId)
      .single()
      .then(({ data }) => { if (data) setB(data); });
  }, [bacteriaId]);

  const c = gramColor(b.gram);
  const palette = getSystemPalette(systemId);
  const accent = palette.accent;
  const sys = SYSTEMS.find(s => s.id === systemId) || SYSTEMS[2];
  const sysIdx = SYSTEMS.indexOf(sys);
  const sysRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][sysIdx];

  const [antiTab, setAntiTab] = React.useState('tableau');
  const [lightbox, setLightbox] = React.useState(null);
  const [activeAnchor, setActiveAnchor] = React.useState('s02');

  const sections = [
    { id:'s02', n:'02', label:'Microscopie & culture' },
    { id:'s03', n:'03', label:'Identification' },
    { id:'s04', n:'04', label:'Clinique' },
    { id:'s05', n:'05', label:'Antibiogramme' },
    { id:'s06', n:'06', label:'Résistances' },
    { id:'s07', n:'07', label:'Virulence' },
    { id:'s08', n:'08', label:'Renvois' },
  ];

  // Scroll-spy
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActiveAnchor(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // Quick reference meta items
  const metaItems = [
    { k:'GRAM',     v:'+' },
    { k:'CATALASE', v:'−' },
    { k:'OXYDASE',  v:'−' },
    { k:'OPTOCHINE',v:'S' },
    { k:'HÉMOLYSE', v:'α' },
    { k:'SPORULATION', v:'−' },
    { k:'O₂',       v:'FAC.' },
    { k:'BSL',      v:'2' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, '--accent': accent, background:T.bg }}>
      {/* ── Running head ── */}
      <div style={{ padding:'10px 48px', borderBottom:`3px solid ${accent}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('zone',{systemId})}>← Chapitre {sysRoman} · {sys.short || sys.label}</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>Streptococcus pneumoniae · entrée 023</span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span>p. 074</span>
        <div style={{ marginLeft:18, display:'flex', gap:6 }}>
          <button style={{ height:24, padding:'0 10px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer', color:T.ink2 }}>↳ COMPARER</button>
          <button style={{ height:24, padding:'0 10px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer', color:T.ink2 }}>⎙ IMPRIMER</button>
        </div>
      </div>

      {/* ── Title block (compressed) ── */}
      <div style={{ padding:'28px 48px 16px', background:T.paper, borderBottom:`1px solid ${T.rule}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:accent, letterSpacing:'0.2em', marginBottom:8 }}>ENTRÉE Nº 023 · GENRE STREPTOCOCCUS</div>
          <h1 style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:62, fontWeight:500, letterSpacing:'-0.022em', lineHeight:0.95, margin:0 }}>
            Streptococcus pneumoniae
          </h1>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:32, marginTop:14 }}>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, lineHeight:1.5, maxWidth:740 }}>
              « Diplocoque Gram positif lancéolé, α-hémolytique, sensible à l'optochine. Première cause de pneumonie communautaire et de méningite bactérienne de l'adulte. »
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
              {[
                {l:'⚠ URGENCE', col:T.red},
                {l:'BSL-2', col:T.ink2},
                {l:'5 SITES', col:T.ink2},
                {l:'FRÉQUENT', col:T.ink2},
              ].map(p=>(
                <span key={p.l} style={{ fontFamily:T.mono, fontSize:9, padding:'3px 8px', border:`1px solid ${p.col === T.red ? T.red : T.rule}`, color:p.col, letterSpacing:'0.08em' }}>{p.l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky meta bar (data grid) ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:T.paper, borderBottom:`1px solid ${T.rule}`, boxShadow:'0 1px 0 rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:`repeat(${metaItems.length}, 1fr) 220px`, alignItems:'stretch' }}>
          {metaItems.map((m, i) => (
            <div key={m.k} style={{ padding:'10px 12px', borderLeft: i === 0 ? 'none' : `1px solid ${T.ruleSoft}`, display:'flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontFamily:T.mono, fontSize:8.5, color:T.ink3, letterSpacing:'0.14em' }}>{m.k}</span>
              <span style={{ fontFamily:T.serif, fontSize:20, lineHeight:1, fontWeight:500 }}>{m.v}</span>
            </div>
          ))}
          <div style={{ borderLeft:`1px solid ${T.rule}`, background:T.qrBg, color:T.qrInk, padding:'10px 14px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <span style={{ fontFamily:T.mono, fontSize:8.5, color:T.qrMute, letterSpacing:'0.16em' }}>1ʳᵉ INTENTION</span>
            <span style={{ fontFamily:T.serif, fontSize:18, fontWeight:500, lineHeight:1.1, marginTop:2 }}>Amoxicilline</span>
            <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:T.qrMute, opacity:0.85 }}>Ceftriaxone si méningite</span>
          </div>
        </div>
      </div>

      {/* ── Carrousel hero (3 planches) ── */}
      <div style={{ padding:'24px 48px 20px', background:T.paper, borderBottom:`1px solid ${T.rule}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.18em' }}>§ 01 · PLANCHES — MORPHOLOGIE</span>
            <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink3 }}>cliquer une planche pour agrandir · ←/→ pour naviguer</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18 }}>
            {SHEET_SLOTS.map((slot, idx) => (
              <Planche key={slot.key} bact={b} slot={slot} idx={idx} onOpen={setLightbox} accent={accent}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body : sommaire + main column ── */}
      <div style={{ background:T.paper, flex:1 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'160px 1fr', gap:32, padding:'28px 48px 64px' }}>
          {/* Sommaire sticky */}
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

          {/* Main column — dense single column */}
          <main style={{ minWidth:0 }}>
            {/* §02 Microscopie & culture */}
            <SectionTitle n="02" title="Microscopie & culture" anchor="s02" accent={accent} right="LECTURE 24H"/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {SPN.milieux.map((m) => (
                <div key={m.name} style={{ background:T.bg, border:`0.5px solid ${T.rule}`, padding:'10px 12px', borderLeft:`3px solid ${m.primary ? accent : T.rule}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500 }}>{m.name}</div>
                    {m.primary && <span style={{ fontFamily:T.mono, fontSize:9, color:accent, letterSpacing:'0.12em' }}>1ʳᵉ</span>}
                  </div>
                  <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink2, marginTop:3, lineHeight:1.4 }}>{m.note}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', border:`1px solid ${T.rule}` }}>
              {SPN.rapid.map((r, i) => (
                <div key={r.k} style={{
                  padding:'8px 12px',
                  borderRight: i < SPN.rapid.length - 1 ? `1px solid ${T.ruleSoft}` : 'none',
                  background: i % 2 === 0 ? T.bg : T.paper,
                }}>
                  <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em' }}>{r.k}</div>
                  <div style={{ fontFamily:T.serif, fontSize:26, lineHeight:1, marginTop:4, fontWeight:500 }}>{r.v}</div>
                </div>
              ))}
            </div>

            {/* §03 Identification */}
            <SectionTitle n="03" title="Identification" anchor="s03" accent={accent}/>
            <p style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink, margin:0 }}>{SPN.identif}</p>

            {/* §04 Clinique */}
            <SectionTitle n="04" title="Signification clinique" anchor="s04" accent={accent}/>
            <p style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink, margin:0 }}>{SPN.clinique}</p>

            {/* §05 Antibiogramme */}
            <SectionTitle n="05" title="Antibiogramme" anchor="s05" accent={accent} right={
              <div style={{ display:'flex', gap:4 }}>
                {['tableau','résumé'].map(k=>(
                  <button key={k} onClick={()=>setAntiTab(k)} style={{ padding:'2px 8px', background: antiTab===k ? T.ink : 'transparent', color: antiTab===k ? T.paper : T.ink3, border:`1px solid ${antiTab===k ? T.ink : T.rule}`, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em', cursor:'pointer' }}>{k.toUpperCase()}</button>
                ))}
              </div>
            }/>
            {antiTab === 'tableau' ? (
              <div style={{ border:`1px solid ${T.rule}` }}>
                <div style={{ display:'grid', gridTemplateColumns:'150px 1fr 78px 56px 1fr', padding:'6px 12px', background:T.bgSoft, fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.12em', borderBottom:`1px solid ${T.rule}` }}>
                  <span>FAMILLE</span><span>ANTIBIOTIQUE</span><span>CMI</span><span>STATUT</span><span>NOTE</span>
                </div>
                {SPN_ANTIBIO.map((row, i) => {
                  const col = row.statut === 'S' ? T.green : row.statut === 'R' ? T.red : accent;
                  return (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'150px 1fr 78px 56px 1fr', padding:'7px 12px', borderBottom: i < SPN_ANTIBIO.length-1 ? `1px solid ${T.ruleSoft}` : 'none', fontFamily:T.sans, fontSize:12.5, alignItems:'center', background: i%2===0 ? T.paper : T.bg }}>
                      <span style={{ fontFamily:T.mono, fontSize:9.5, color:T.ink3 }}>{row.famille}</span>
                      <span style={{ fontFamily:T.serif, fontStyle:'italic', fontWeight:500, fontSize:14 }}>{row.ab}</span>
                      <span style={{ fontFamily:T.mono, fontSize:10.5, color:T.ink2 }}>{row.cmival}</span>
                      <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:col }}>{row.statut}</span>
                      <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11.5, color:T.ink3 }}>{row.note}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontFamily:T.serif, fontSize:14, lineHeight:1.6, color:T.ink }}>{SPN.antibio}</div>
            )}

            {/* §06 Résistances — 2 cols */}
            <SectionTitle n="06" title="Résistances" anchor="s06" accent={accent}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, fontFamily:T.serif }}>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.14em', marginBottom:6 }}>NATURELLES</div>
                <ul style={{ paddingLeft:16, margin:0, fontSize:13.5, lineHeight:1.6 }}>
                  {SPN.resistNat.map(x=><li key={x}>{x}</li>)}
                </ul>
              </div>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.14em', marginBottom:6 }}>ACQUISES</div>
                <ul style={{ paddingLeft:16, margin:0, fontSize:13.5, lineHeight:1.6 }}>
                  {SPN.resistAcq.map(x=><li key={x}>{x}</li>)}
                </ul>
              </div>
            </div>

            {/* §07 Virulence — inline data list */}
            <SectionTitle n="07" title="Facteurs de virulence" anchor="s07" accent={accent}/>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px', borderTop:`1px solid ${T.ruleSoft}` }}>
              {SPN.virulence.map((v, i)=>(
                <li key={v} style={{ padding:'6px 0', borderBottom:`1px solid ${T.ruleSoft}`, fontFamily:T.serif, fontSize:13.5, display:'flex', gap:10 }}>
                  <span style={{ fontFamily:T.mono, fontSize:9.5, color:accent, letterSpacing:'0.05em' }}>0{i+1}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>

            {/* §08 Renvois */}
            <SectionTitle n="08" title="Renvois anatomiques" anchor="s08" accent={accent}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px' }}>
              {SPN.sites.map((s)=>(
                <div key={s.l}
                     onClick={()=>navigate('zone', { systemId: SYSTEMS.find(sys=>sys.label===s.l)?.id || 'orl' })}
                     style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:`1px solid ${T.ruleSoft}`, padding:'7px 0', cursor:'pointer' }}>
                  <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13.5 }}>↗ {s.l}</span>
                  <span style={{ fontFamily:T.mono, fontSize:9.5, color:T.ink3, letterSpacing:'0.06em' }}>{s.tag}</span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox bact={b} openIdx={lightbox} onClose={()=>setLightbox(null)}/>
    </div>
  );
}
