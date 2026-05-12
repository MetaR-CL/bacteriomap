// HomeScreen.jsx — Table des matières
import { T } from './data.js';
import { SYSTEMS, getSystemPalette } from './shared.jsx';

export default function HomeScreen({ navigate }) {
  const half1 = SYSTEMS.slice(0, 5);
  const half2 = SYSTEMS.slice(5);
  const pages  = [11,33,67,89,121,149,177,199,219,235];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily: T.serif }}>
      {/* Running head */}
      <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>Bacteriomap</span>
        <span style={{ marginLeft:14 }}>· ATLAS DE MICROBIOLOGIE CLINIQUE · CHUV LAUSANNE</span>
        <span style={{ flex:1 }}/>
        <span>ÉDITION 2026</span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span>p. 001</span>
      </div>

      {/* Hero — calm, single column */}
      <div style={{ padding:'68px 56px 52px', borderBottom:`1.5px double ${T.rule}`, background:T.paper }}>
        <div style={{ maxWidth:920 }}>
          <div style={{ fontFamily:T.mono, fontSize:11, color:T.ocre, letterSpacing:'0.2em', marginBottom:24 }}>ATLAS DE MICROBIOLOGIE CLINIQUE</div>
          <h1 style={{ fontFamily:T.serif, fontSize:160, fontWeight:500, lineHeight:0.86, letterSpacing:'-0.04em', margin:0 }}>
            <em style={{ fontStyle:'italic' }}>Bacterio</em><span style={{ color:T.ocre }}>map.</span>
          </h1>
          <div style={{ marginTop:28, fontFamily:T.serif, fontStyle:'italic', fontSize:22, color:T.ink2, maxWidth:680, lineHeight:1.45 }}>
            Un atlas par site anatomique — pathogènes, commensaux, antibiogrammes. Pensé pour la pratique au laboratoire, lu comme un livre.
          </div>
        </div>
      </div>

      {/* TOC — 2 columns */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1px 1fr', background:T.bg, padding:'40px 56px', gap:0 }}>
        {[half1, null, half2].map((col, ci) => {
          if (!col) return <div key="rule" style={{ background:T.rule }}/>;
          const offset = ci === 2 ? 5 : 0;
          return (
            <div key={ci} style={{ padding: ci===0 ? '0 40px 0 0' : '0 0 0 40px' }}>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.18em', marginBottom:16 }}>
                {ci===0 ? 'CHAPITRES I — V' : 'CHAPITRES VI — X'}
              </div>
              {col.map((s, i) => {
                const idx = offset + i;
                const page = pages[idx];
                const palette = getSystemPalette(s.id);
                return (
                  <div key={s.id}
                       onClick={()=>navigate('zone', { systemId:s.id })}
                       style={{ padding:'22px 0 22px 18px', borderBottom:`1px solid ${T.ruleSoft}`, cursor:'pointer', display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'baseline', position:'relative', borderLeft:`3px solid ${palette.accent}`, transition:'padding-left .15s' }}
                       onMouseEnter={e=>e.currentTarget.style.paddingLeft='28px'}
                       onMouseLeave={e=>e.currentTarget.style.paddingLeft='18px'}>
                    <div>
                      <div style={{ fontFamily:T.mono, fontSize:9, color:palette.accent, letterSpacing:'0.18em', marginBottom:6 }}>
                        {s.short?.toUpperCase()}
                      </div>
                      <div style={{ fontFamily:T.serif, fontSize:30, fontWeight:500, letterSpacing:'-0.015em', lineHeight:1.05 }}>{s.label}</div>
                      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink3, marginTop:6, lineHeight:1.4 }}>{s.subtitle}</div>
                    </div>
                    <div style={{ fontFamily:T.mono, fontSize:11, color:T.ink2, letterSpacing:'0.08em' }}>p. {String(page).padStart(3,'0')}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Annexes — Quiz + Atelier */}
      <div style={{ padding:'24px 56px 28px', background:T.paper, borderTop:`1px solid ${T.rule}` }}>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.18em', marginBottom:16 }}>ANNEXES</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
          <div onClick={()=>navigate('quiz')}
               onMouseEnter={e=>e.currentTarget.style.paddingLeft='28px'}
               onMouseLeave={e=>e.currentTarget.style.paddingLeft='18px'}
               style={{ cursor:'pointer', padding:'18px 0 18px 18px', borderBottom:`1px solid ${T.ruleSoft}`, display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'baseline', transition:'padding-left .15s', borderLeft:`3px solid ${T.ocre}` }}>
            <div>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.ocre, letterSpacing:'0.18em', marginBottom:6 }}>RÉCRÉATION</div>
              <div style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, letterSpacing:'-0.015em', lineHeight:1.05, fontStyle:'italic' }}>Qui suis-je&nbsp;?</div>
              <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink3, marginTop:6, lineHeight:1.4 }}>Quiz d'identification — quatre indices progressifs</div>
            </div>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.ink2, letterSpacing:'0.08em' }}>p. 245</div>
          </div>

          <div onClick={()=>navigate('admin')}
               onMouseEnter={e=>e.currentTarget.style.paddingLeft='28px'}
               onMouseLeave={e=>e.currentTarget.style.paddingLeft='18px'}
               style={{ cursor:'pointer', padding:'18px 0 18px 18px', borderBottom:`1px solid ${T.ruleSoft}`, display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'baseline', transition:'padding-left .15s', borderLeft:`3px solid ${T.ink2}` }}>
            <div>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink2, letterSpacing:'0.18em', marginBottom:6 }}>ADMINISTRATION</div>
              <div style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, letterSpacing:'-0.015em', lineHeight:1.05, fontStyle:'italic' }}>Atelier</div>
              <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink3, marginTop:6, lineHeight:1.4 }}>Édition complète du contenu · accès protégé</div>
            </div>
            <div style={{ fontFamily:T.mono, fontSize:11, color:T.ink2, letterSpacing:'0.08em' }}>p. 251</div>
          </div>
        </div>
      </div>

      {/* Footer legend */}
      <div style={{ padding:'14px 56px', borderTop:`1.5px double ${T.rule}`, display:'flex', gap:24, fontFamily:T.mono, fontSize:10, color:T.ink2, letterSpacing:'0.08em', background:T.paper, alignItems:'center' }}>
        <span style={{ color:T.ink3, letterSpacing:'0.18em' }}>LÉGENDE</span>
        <span><span style={{ color:T.violet }}>●</span>&nbsp;Gram positif</span>
        <span><span style={{ color:T.rose }}>●</span>&nbsp;Gram négatif</span>
        <span><span style={{ color:T.blue }}>●</span>&nbsp;Fongique</span>
        <span style={{ color:T.red }}>† urgence clinique</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, fontSize:12, color:T.ink3 }}>Cliquer sur un chapitre →</span>
      </div>
    </div>
  );
}
