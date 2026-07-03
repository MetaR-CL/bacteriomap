// SheetScreen.jsx — Fiche bactérie
// Carrousel images · sommaire sticky · meta-bar sticky
import React from 'react';
import { T } from './data.js';
import { SYSTEMS, getSystemPalette, gramColor } from './shared.jsx';
import { supabase } from '../../lib/supabase.js';
import TopBar from './TopBar.jsx'
import MarkdownView from './MarkdownView.jsx'
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { useCompare } from '../../context/CompareContext.jsx';

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
  const label = img.label && img.label.trim() !== '' ? img.label : null;

  return (
    <figure style={{ margin:0 }}>
      <div style={{ position:'relative', border:`0.5px solid ${T.rule}`, overflow:'hidden', aspectRatio:'16/7', cursor: total > 0 ? 'zoom-in' : 'default' }}
           onClick={() => onOpen(idx)}>
        {/* Slide strip */}
        <div style={{
          display:'flex',
          transform:`translateX(-${idx * 100}%)`,
          transition:'transform 0.3s ease',
          height:'100%',
        }}>
          {images.map((im, i) => (
            <div key={im.id || i} style={{ flex:'0 0 100%', height:'100%' }}>
              <img src={im.url} alt={im.label || ''} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
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
      {label && (
        <figcaption style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink2, marginTop:8, lineHeight:1.35 }}>
          {label}
        </figcaption>
      )}
      {img.legend && img.legend.trim() !== '' && (
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em', textAlign: 'center', marginTop: 6 }}>
          {img.legend}
        </div>
      )}
      {img.source && (
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, marginTop: 3, letterSpacing: '0.08em' }}>
          © {img.source}
        </div>
      )}
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
  const label = img?.label && img.label.trim() !== '' ? img.label : null;

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
        {img?.source && (
          <div style={{ fontFamily: T.mono, fontSize: 9, color: 'rgba(248,243,229,.45)', marginTop: 6, textAlign: 'center', letterSpacing: '0.08em' }}>
            © {img.source}
          </div>
        )}
      </div>
    </div>
  );
}

// Section heading
function SectionTitle({ n, title, anchor, accent, right }) {
  return (
    <div id={anchor} style={{ padding:'18px 0 8px', borderBottom:`1px solid ${T.rule}`, marginBottom:12, scrollMarginTop:96 }}>
      <span style={{ fontFamily:T.serif, fontSize:18, fontWeight:500, letterSpacing:'-0.005em' }}>{title}</span>
    </div>
  );
}

// ── SheetView — pure rendering, no fetch, no TopBar, no Lightbox ─────────────
// Exported so AdminBacteria can use it for the live preview panel.
export function SheetView({ b, images: imagesProp, systemId = 'orl', compact = false }) {
  const [lightbox, setLightbox] = React.useState(null);

  if (!b) return null;

  const palette = getSystemPalette(systemId);
  const accent = palette.accent;
  const genus = b.name?.split(' ')[0] || '';

  const images = imagesProp ?? (Array.isArray(b.bacterio_images) ? b.bacterio_images : []);
  const milieux = parseJSONField(b.milieux);
  const antibiogramme = parseJSONField(b.antibiogramme);
  const resistNat = Array.isArray(b.resist_nat) ? b.resist_nat : [];
  const resistAcq = Array.isArray(b.resist_acq) ? b.resist_acq : [];
  const virulence = Array.isArray(b.virulence) ? b.virulence : [];

  const standardTests = [
    b.catalase    != null && { k: 'Catalase',    v: b.catalase    ? '+' : '−' },
    b.oxydase     != null && { k: 'Oxydase',     v: b.oxydase     ? '+' : '−' },
    b.coagulase   != null && { k: 'Coagulase',   v: b.coagulase   ? '+' : '−' },
    b.sporulation != null && { k: 'Sporulation', v: b.sporulation ? '+' : '−' },
  ].filter(Boolean);
  const extraTests = Array.isArray(b.tests_rapides)
    ? b.tests_rapides.map(t => ({ k: t.k || t.name || '', v: t.v || t.value || '' })).filter(t => t.k)
    : [];

  const hidden = new Set(Array.isArray(b.hidden_fields) ? b.hidden_fields : []);

  return (
    <div style={{ fontFamily: T.serif, '--accent': accent, background: T.bg }}>

      {/* Title block */}
      <div style={{ padding: compact ? '12px 16px' : '20px 28px 14px', background: T.paper, borderBottom: `1px solid ${T.rule}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: accent, letterSpacing: '0.2em', marginBottom: 6 }}>GENRE {genus.toUpperCase()}</div>
        <h2 style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: compact ? 22 : 28, fontWeight: 500, letterSpacing: '-0.022em', lineHeight: 1, margin: 0 }}>
          {b.name}
        </h2>
      </div>

      {/* Carrousel */}
      {!hidden.has('images') && images.length > 0 && (
        <div style={{ padding: compact ? '10px 16px' : '16px 28px', background: T.paper, borderBottom: `1px solid ${T.rule}` }}>
          <Carrousel images={images} accent={accent} onOpen={setLightbox} />
        </div>
      )}

      {/* Sections */}
      <div style={{ background: T.paper, padding: compact ? '12px 16px 32px' : '20px 28px 48px' }}>

        {!hidden.has('microscopie') && (
          <>
            <SectionTitle n="02" title="Microscopie & culture" anchor={null} accent={accent} />
            {milieux.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 12 }}>
                {milieux.map((m, i) => {
                  const mName = typeof m === 'string' ? m : (m.name || '');
                  const mNote = typeof m === 'object' ? m.note : null;
                  const mPrim = typeof m === 'object' ? m.primary : false;
                  return (
                    <div key={mName + i} style={{ background: T.bg, border: `0.5px solid ${T.rule}`, padding: '8px 10px', borderLeft: `3px solid ${mPrim ? accent : T.rule}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 500 }}>{mName}</div>
                        {mPrim && <span style={{ fontFamily: T.mono, fontSize: 9, color: accent }}>1ʳᵉ</span>}
                      </div>
                      {mNote && <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.ink2, marginTop: 2 }}>{mNote}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ink3, marginBottom: 12 }}>Données non renseignées.</p>
            )}
            {standardTests.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(standardTests.length, 4)}, 1fr)`, border: `1px solid ${T.rule}`, marginBottom: extraTests.length > 0 ? 0 : 8 }}>
                {standardTests.map((r, i) => (
                  <div key={r.k} style={{ padding: '6px 10px', borderRight: i < standardTests.length - 1 ? `1px solid ${T.ruleSoft}` : 'none', background: i % 2 === 0 ? T.bg : T.paper }}>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.ink3, letterSpacing: '0.1em' }}>{r.k}</div>
                    <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1, marginTop: 3, fontWeight: 500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
            )}
            {extraTests.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(extraTests.length, 4)}, 1fr)`, border: `1px solid ${T.rule}`, borderTop: standardTests.length > 0 ? `1px solid ${T.ruleSoft}` : undefined, marginBottom: 8 }}>
                {extraTests.map((r, i) => (
                  <div key={r.k} style={{ padding: '6px 10px', borderRight: i < extraTests.length - 1 ? `1px solid ${T.ruleSoft}` : 'none', background: T.bgSoft || T.bg }}>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.ink3, letterSpacing: '0.1em' }}>{r.k}</div>
                    <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1, marginTop: 3, fontWeight: 500 }}>{r.v}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!!b.identif && !hidden.has('identif') && (
          <>
            <SectionTitle n="03" title="Identification" anchor={null} accent={accent} />
            <MarkdownView content={b.identif} />
          </>
        )}

        {!!(b.clinical_info || b.clinique) && !hidden.has('clinique') && (
          <>
            <SectionTitle n="04" title="Signification clinique" anchor={null} accent={accent} />
            <MarkdownView content={b.clinical_info || b.clinique} />
          </>
        )}

        {!!b.antibio && !hidden.has('antibio') && (
          <>
            <SectionTitle n="05" title="Traitement" anchor={null} accent={accent} />
            <MarkdownView content={b.antibio} />
          </>
        )}

        {antibiogramme.length > 0 && !hidden.has('antibiogramme') && (
          <>
            <SectionTitle n="06" title="Antibiogramme" anchor={null} accent={accent} />
            <div style={{ border: `1px solid ${T.rule}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', padding: '5px 10px', background: T.bgSoft, fontFamily: T.mono, fontSize: 8, color: T.ink3, letterSpacing: '0.1em', borderBottom: `1px solid ${T.rule}` }}>
                <span>ANTIBIOTIQUE</span><span>S/I/R</span>
              </div>
              {antibiogramme.map((row, i) => {
                const sens = row.sens || '?';
                const col = sens === 'S' ? T.green : sens === 'R' ? T.red : accent;
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px', padding: '6px 10px', borderBottom: i < antibiogramme.length - 1 ? `1px solid ${T.ruleSoft}` : 'none', fontFamily: T.serif, fontSize: 13, alignItems: 'center', background: i % 2 === 0 ? T.paper : T.bg }}>
                    <span style={{ fontStyle: 'italic' }}>{row.ab}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: col }}>{sens}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {((resistNat.length > 0 && !hidden.has('resist_nat')) || (resistAcq.length > 0 && !hidden.has('resist_acq'))) && (
          <>
            <SectionTitle n="06" title="Résistances" anchor={null} accent={accent} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontFamily: T.serif }}>
              {!hidden.has('resist_nat') && (
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.ink3, letterSpacing: '0.12em', marginBottom: 4 }}>NATURELLES</div>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: 13, lineHeight: 1.55 }}>
                    {resistNat.map(x => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              )}
              {!hidden.has('resist_acq') && (
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.ink3, letterSpacing: '0.12em', marginBottom: 4 }}>ACQUISES</div>
                  <ul style={{ paddingLeft: 14, margin: 0, fontSize: 13, lineHeight: 1.55 }}>
                    {resistAcq.map(x => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {virulence.length > 0 && !hidden.has('virulence') && (
          <>
            <SectionTitle n="07" title="Facteurs de virulence" anchor={null} accent={accent} />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: `1px solid ${T.ruleSoft}` }}>
              {virulence.map((v, i) => (
                <li key={v} style={{ padding: '5px 0', borderBottom: `1px solid ${T.ruleSoft}`, fontFamily: T.serif, fontSize: 13, display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: accent }}>0{i + 1}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {!!b.commentaire && !hidden.has('commentaire') && (
          <>
            <SectionTitle n="08" title="Remarques" anchor={null} accent={accent} />
            <MarkdownView content={b.commentaire} />
          </>
        )}

      </div>

      <Lightbox bact={b} openIdx={lightbox} onClose={() => setLightbox(null)} images={images} />
    </div>
  );
}

// ── SheetScreen — full page with fetch, TopBar, and SheetView ────────────────
export default function SheetScreen({ navigate, bacteriaId, systemId = 'orl', vivid = false, showImages = true }) {
  const mobile = useIsMobile();
  const { add, has, basket } = useCompare();
  const [b, setB] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, color: T.ink3, fontStyle: 'italic' }}>
      Chargement…
    </div>
  );

  if (!b) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, color: T.ink3, fontStyle: 'italic' }}>
      Bactérie introuvable.
    </div>
  );

  const palette = getSystemPalette(systemId);
  const accent = palette.accent;
  const genus = b.name?.split(' ')[0] || '';
  const images = Array.isArray(b.bacterio_images) ? b.bacterio_images : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.serif, '--accent': accent, background: T.bg }}>

      <TopBar navigate={navigate} center={b?.name} onBack={() => navigate('zone', { systemId })} />

      {/* Title block with compare button */}
      <div style={{ padding: mobile ? '16px 16px 12px' : '28px 48px 16px', background: T.paper, borderBottom: `1px solid ${T.rule}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: accent, letterSpacing: '0.2em', marginBottom: 8 }}>GENRE {genus.toUpperCase()}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <h1 style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 32, fontWeight: 500, letterSpacing: '-0.022em', lineHeight: 0.95, margin: 0 }}>
              {b.name}
            </h1>
            <button
              onClick={() => { if (!has(b.id) && basket.length < 4) add(b) }}
              disabled={has(b.id) || basket.length >= 4}
              style={{
                fontFamily: T.mono, fontSize: 9, letterSpacing: '0.1em',
                padding: '3px 10px', cursor: has(b.id) || basket.length >= 4 ? 'default' : 'pointer',
                background: has(b.id) ? accent : 'transparent',
                border: `1px solid ${has(b.id) ? accent : T.rule}`,
                color: has(b.id) ? '#fff' : T.ink2,
                flexShrink: 0,
              }}
            >{has(b.id) ? '✓ COMPARER' : '+ COMPARER'}</button>
          </div>
        </div>
      </div>

      {/* Body via SheetView */}
      <div style={{ flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SheetView b={b} images={images} systemId={systemId} />
        </div>
      </div>

    </div>
  );
}
