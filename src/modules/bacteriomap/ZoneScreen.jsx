// ZoneScreen.jsx — Vue chapitre + sous-zones + planche de bactéries
import React from 'react';
import { T, ORL_SUBS_DETAIL } from './data.js';
import { SYSTEMS, LCR_PATHO, getSystemPalette, gramColor } from './shared.jsx';

export default function ZoneScreen({ navigate, systemId = 'orl', vivid = false, showImages = true }) {
  const sys = SYSTEMS.find(s => s.id === systemId) || SYSTEMS[2];
  const palette = getSystemPalette(sys.id);
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const idx = SYSTEMS.indexOf(sys);
  const roman = romans[idx];
  const pages = [11,33,67,89,121,149,177,199,219,235];

  // Use ORL detail data if ORL, else generate stubs
  const subs = systemId === 'orl' ? ORL_SUBS_DETAIL : [
    { id:'z1', label:'Zone A', n: Math.floor(sys.n/3), flora:1, descr:'Sous-zone principale. Prélèvement par écouvillonnage.', patho: LCR_PATHO.slice(0,3), floraList: [] },
    { id:'z2', label:'Zone B', n: Math.floor(sys.n/3)+1, flora:2, descr:'Sous-zone secondaire. Prélèvement guidé.', patho: LCR_PATHO.slice(2,5), floraList: [] },
    { id:'z3', label:'Zone C', n: sys.n - Math.floor(sys.n/3)*2, flora:0, descr:'Sous-zone tertiaire.', patho: LCR_PATHO.slice(4,7), floraList: [] },
  ];

  const [activeSub, setActiveSub] = React.useState(subs[0].id);
  const [filter, setFilter] = React.useState('all');
  const sub = subs.find(s => s.id === activeSub) || subs[0];

  const bacteria = sub.patho.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'gp')  return b.gram === '+';
    if (filter === 'gm')  return b.gram === '−';
    if (filter === 'f')   return b.gram === 'F';
    if (filter === 'urg') return b.urgence;
    return true;
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, '--accent': palette.accent }}>
      {/* Running head */}
      <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('home')}>← TABLE DES MATIÈRES</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>
          {sys.label}
        </span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span>p. {String(pages[idx]).padStart(3,'0')}</span>
      </div>

      {/* Chapter opener — calm, single column */}
      <div style={{ padding:'56px 56px 40px', borderBottom:`1.5px double ${T.rule}`, background:T.paper }}>
        <div style={{ maxWidth:920 }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:'var(--accent)', letterSpacing:'0.2em', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:24, height:2, background:'var(--accent)' }}/>
            {sys.short?.toUpperCase()}
          </div>
          <h1 style={{ fontFamily:T.serif, fontSize:120, fontWeight:500, letterSpacing:'-0.03em', lineHeight:0.9, margin:0 }}>
            {sys.label.split(' ')[0]}<span style={{ color:'var(--accent)' }}>.</span>
          </h1>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:22, color:T.ink2, marginTop:14, maxWidth:620 }}>
            {sys.subtitle}.
          </div>
        </div>
      </div>

      {/* Body: sidebar + plate */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'230px 1fr', background:T.bg }}>
        {/* Sidebar */}
        <aside style={{ borderRight:`1px solid ${T.rule}`, padding:'28px 24px 28px 56px', background:T.paper }}>
          <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.16em', marginBottom:14 }}>SOUS-ZONES</div>
          {subs.map((s, i) => {
            const active = s.id === activeSub;
            return (
              <div key={s.id} onClick={()=>setActiveSub(s.id)} style={{
                padding:'16px 0', borderBottom:`1px solid ${T.ruleSoft}`, cursor:'pointer',
                display:'grid', gridTemplateColumns:'28px 1fr', gap:10, alignItems:'baseline',
              }}>
                <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color: active ? T.ocre : T.ink3 }}>§{['a','b','c','d'][i]}</span>
                <div>
                  <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:500, color: active ? T.ink : T.ink2 }}>{s.label}</div>
                  <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, marginTop:3 }}>
                    n={s.n} pathogènes {s.flora > 0 ? `· ${s.flora} commensaux` : ''}
                  </div>
                  {active && (
                    <div style={{ marginTop:8, fontFamily:T.serif, fontSize:12, color:T.ink3, fontStyle:'italic', lineHeight:1.4 }}>
                      {s.descr}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop:28, fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ink3 }}>
            ↗ {SYSTEMS[Math.max(0,idx-1)]?.label}<br/>
            <span style={{ marginTop:6, display:'block' }}>↗ {SYSTEMS[Math.min(9,idx+1)]?.label}</span>
          </div>
        </aside>

        {/* Plate */}
        <div style={{ padding:'28px 56px 40px' }}>
          {/* Sub-zone title + filters */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:20 }}>
            <div>
              <span style={{ fontFamily:T.mono, fontSize:10, color:T.ocre, letterSpacing:'0.18em' }}>§ {['A','B','C','D'][subs.findIndex(s=>s.id===activeSub)]} · PATHOGÈNES</span>
              <div style={{ fontFamily:T.serif, fontSize:36, fontWeight:500, letterSpacing:'-0.02em', lineHeight:1, marginTop:4 }}>
                {sub.label}.
              </div>
            </div>
            <div style={{ flex:1 }}/>
            {/* Filters */}
            <div style={{ display:'flex', gap:4, fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em' }}>
              {[['all','TOUS'],['gp','G+'],['gm','G−'],['f','F'],['urg','†']].map(([k,l])=>(
                <button key={k} onClick={()=>setFilter(k)} style={{
                  padding:'5px 9px',
                  background: filter===k ? T.ink : T.paper,
                  color: filter===k ? T.paper : T.ink3,
                  border:`1px solid ${filter===k ? T.ink : T.rule}`,
                  cursor:'pointer', fontFamily:T.mono, fontSize:9, letterSpacing:'0.08em',
                  transition:'all .1s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:`1px solid ${T.rule}`, marginBottom:22 }}/>

          {/* Bacteria grid — editorial plate layout */}
          {bacteria.length === 0 ? (
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:16, color:T.ink3, padding:'40px 0' }}>Aucun résultat pour ce filtre.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0 32px' }}>
              {bacteria.map((b, i) => {
                const c = gramColor(b.gram);
                const fig = ['I','II','III','IV','V','VI','VII','VIII','IX'][i] || String(i+1);
                return (
                  <figure key={i}
                          onClick={()=>navigate('sheet', { bacteriaId: b.name, systemId })}
                          style={{ margin:0, paddingBottom:28, borderBottom:`1px solid ${T.ruleSoft}`, marginBottom:28, cursor:'pointer' }}>
                    <div style={{ background:T.bgSoft, height:148, position:'relative', border:`0.5px solid ${T.rule}`, overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:8, left:10, fontFamily:T.mono, fontSize:9, color:'#888', zIndex:2 }}>fig. {fig}</div>
                      {b.urgence && <div style={{ position:'absolute', top:6, right:10, color:T.red, fontFamily:T.serif, fontSize:18, zIndex:2 }}>†</div>}
                      {b.declaration && <div style={{ position:'absolute', bottom:8, left:10, fontFamily:T.mono, fontSize:8, color:T.ink3, letterSpacing:'0.1em', border:`1px solid ${T.rule}`, padding:'1px 4px', background:'var(--paper)', zIndex:2 }}>DÉCL.</div>}
                      {window.__bm?.BactFigure ? <window.__bm.BactFigure bact={b} vivid={vivid} showImages={showImages} size={100}/> : null}
                    </div>
                    <figcaption style={{ paddingTop:12 }}>
                      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:19, fontWeight:500, letterSpacing:'-0.01em', lineHeight:1.15 }}>{b.name}</div>
                      <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, marginTop:5, letterSpacing:'0.02em' }}>{b.shape}</div>
                      <div style={{ display:'flex', gap:12, marginTop:9, fontFamily:T.mono, fontSize:9, color:T.ink2, letterSpacing:'0.06em', alignItems:'center' }}>
                        <span style={{ color:c.stroke, fontWeight:500 }}>GRAM {b.gram}</span>
                        <span style={{ color:T.ink3 }}>·</span>
                        <span>{b.freq.toUpperCase()}</span>
                        <span style={{ color:T.ink3 }}>·</span>
                        <span>{b.o2.split(' ')[0].toUpperCase()}</span>
                        <span style={{ flex:1, textAlign:'right', color:T.ocre, fontSize:9 }}>↗ fiche</span>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}

          {/* Flora section */}
          {sub.floraList.length > 0 && filter === 'all' && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:16 }}>
                <span style={{ fontFamily:T.mono, fontSize:10, color:T.green, letterSpacing:'0.18em' }}>§ FLORE COMMENSALE</span>
                <div style={{ flex:1, borderBottom:`1px solid ${T.ruleSoft}`, marginBottom:3 }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px 32px' }}>
                {sub.floraList.map((b,i) => {
                  const c = gramColor(b.gram);
                  return (
                    <div key={i} style={{ borderLeft:`2px solid ${T.green}`, paddingLeft:10 }}>
                      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, fontWeight:500, lineHeight:1.2 }}>{b.name}</div>
                      <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, marginTop:4, letterSpacing:'0.04em' }}>{b.shape}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
