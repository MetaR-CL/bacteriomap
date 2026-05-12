// DIRECTION 2 — ÉDITORIAL / ATLAS SCIENTIFIQUE
// Manuel scientifique : sérif éditorial Newsreader pour titres, Inter pour corps, IBM Plex Mono pour latin/données
// Beige papier, encre noire, 1 accent ocre. Grille stricte 12 colonnes, numérotation chapitre.

const editorialTokens = {
  bg:        '#f3efe5',  // paper
  bgSoft:    '#ebe6d8',
  ink:       '#1a1610',
  ink2:      '#403930',
  ink3:      '#7a7163',
  rule:      '#cdc4ae',
  ruleSoft:  '#ddd5c0',
  paper:     '#faf6ec',
  ocre:      '#9a6b1f',
  red:       '#a02e1f',
  green:     '#3a6b3a',
  blue:      '#2c5a8a',
  serif:     '"Newsreader", "Times New Roman", Georgia, serif',
  sans:      '"Inter", "Helvetica Neue", Arial, sans-serif',
  mono:      '"IBM Plex Mono", ui-monospace, Consolas, monospace',
};

// ─────────────────────────────────────────────────
// ARTBOARD — Accueil : "Table des matières" éditoriale
function EditorialHome() {
  const t = editorialTokens;
  const half1 = SYSTEMS.slice(0, 5);
  const half2 = SYSTEMS.slice(5);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: t.serif, display: 'flex', flexDirection: 'column' }}>
      {/* Top — minimal, like a book running head */}
      <div style={{ padding: '14px 48px', borderBottom: `0.5px solid ${t.rule}`, display: 'flex', alignItems: 'center', fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.14em' }}>
        <span style={{ fontStyle: 'italic', fontFamily: t.serif, letterSpacing: 0, fontSize: 12 }}>Bacteriomap</span>
        <span style={{ marginLeft: 14 }}>· VOL. II · MICROBIOLOGIE CLINIQUE</span>
        <span style={{ flex: 1 }}/>
        <span>CHUV LAUSANNE</span>
        <span style={{ margin: '0 14px' }}>·</span>
        <span>ÉDITION 2026</span>
        <span style={{ margin: '0 14px' }}>·</span>
        <span>p. 001 / 217</span>
      </div>

      {/* Hero / cover-page */}
      <div style={{ padding: '40px 48px 28px', borderBottom: `1.5px double ${t.rule}` }}>
        <div style={{ fontFamily: t.mono, fontSize: 11, color: t.ocre, letterSpacing: '0.18em', marginBottom: 18 }}>PARTIE I — ATLAS DES SITES ANATOMIQUES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: t.serif, fontSize: 88, fontWeight: 500, lineHeight: 0.92, letterSpacing: '-0.025em', margin: 0 }}>
              Cartographie<br/>
              <span style={{ fontStyle: 'italic', color: t.ocre }}>du corps humain</span><br/>
              <span style={{ fontSize: 64 }}>en dix systèmes.</span>
            </h1>
          </div>
          <div style={{ borderLeft: `1px solid ${t.rule}`, paddingLeft: 24, fontFamily: t.sans }}>
            <div style={{ fontSize: 12, color: t.ink2, lineHeight: 1.6, fontStyle: 'italic', fontFamily: t.serif }}>
              <span style={{ fontSize: 36, float: 'left', lineHeight: 0.85, marginRight: 6, marginTop: 4, fontWeight: 500 }}>D</span>e l'arbre respiratoire à l'urètre, ce manuel recense 108 micro-organismes documentés et leurs sites de prélèvement, classés selon les dix systèmes du corps humain.
            </div>
            <div style={{ marginTop: 20, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.1em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${t.ruleSoft}`, padding: '6px 0' }}><span>SYSTÈMES</span><span>10</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${t.ruleSoft}`, padding: '6px 0' }}><span>BACTÉRIES</span><span>108</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${t.ruleSoft}`, padding: '6px 0' }}><span>FONGIQUES</span><span>14</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>DERN. RÉVISION</span><span style={{ color: t.red }}>14.04.2026</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column index — proper book TOC */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1px 1fr', padding: '34px 48px', background: t.paper, gap: 0 }}>
        {[half1, [], half2].map((col, ci) => {
          if (ci === 1) return <div key="rule" style={{ background: t.rule }}/>;
          return (
            <div key={ci} style={{ padding: ci === 0 ? '0 36px 0 0' : '0 0 0 36px' }}>
              <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 14 }}>
                {ci === 0 ? 'CHAPITRES I — V' : 'CHAPITRES VI — X'}
              </div>
              {col.map((s, i) => {
                const idx = ci === 0 ? i : i + 5;
                const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'][idx];
                return (
                  <div key={s.id} style={{ padding: '18px 0', borderBottom: `1px solid ${t.ruleSoft}`, cursor: 'pointer', display: 'grid', gridTemplateColumns: '52px 1fr auto', alignItems: 'baseline', gap: 12 }}>
                    <div style={{ fontFamily: t.serif, fontSize: 32, fontWeight: 500, color: t.ocre, fontStyle: 'italic', lineHeight: 1 }}>{roman}</div>
                    <div>
                      <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.05 }}>{s.label}</div>
                      <div style={{ fontFamily: t.sans, fontSize: 12, color: t.ink3, marginTop: 4, fontStyle: 'italic' }}>{s.subtitle}</div>
                      <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink2, letterSpacing: '0.04em', marginTop: 6 }}>{s.n} bactéries · {Math.max(1, Math.floor(s.n/3))} sous-zones</div>
                    </div>
                    <div style={{ fontFamily: t.mono, fontSize: 11, color: t.ink2, letterSpacing: '0.06em' }}>p. {String(idx*22 + 11).padStart(3,'0')}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom — legend / colophon */}
      <div style={{ padding: '14px 48px', borderTop: `1.5px double ${t.rule}`, display: 'flex', gap: 28, fontFamily: t.mono, fontSize: 10, color: t.ink2, letterSpacing: '0.08em' }}>
        <span style={{ color: t.ink3, letterSpacing: '0.16em' }}>LÉGENDE</span>
        <span><span style={{ color: '#6b3fa0' }}>●</span> Gram positif</span>
        <span><span style={{ color: '#c64577' }}>●</span> Gram négatif</span>
        <span><span style={{ color: '#2c6fb5' }}>●</span> Fongique</span>
        <span style={{ color: t.red }}>† Urgence clinique</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontStyle: 'italic', fontFamily: t.serif, fontSize: 11 }}>Cliquez sur un chapitre pour ouvrir l'atlas →</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// ARTBOARD — Vue zone éditoriale (chapitre + planche)
function EditorialZone() {
  const t = editorialTokens;
  const [activeSub, setActiveSub] = React.useState('gorge');
  const orlSubs = [
    { id: 'gorge',  label: 'Gorge',   n: 4 },
    { id: 'nez',    label: 'Nez',     n: 2 },
    { id: 'oreille',label: 'Oreille', n: 5 },
    { id: 'sinus',  label: 'Sinus',   n: 3 },
  ];
  const grid = LCR_PATHO.slice(0, 6);

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: t.serif, display: 'flex', flexDirection: 'column' }}>
      {/* running head */}
      <div style={{ padding: '14px 48px', borderBottom: `0.5px solid ${t.rule}`, display: 'flex', alignItems: 'center', fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.14em' }}>
        <span style={{ cursor: 'pointer' }}>← TABLE DES MATIÈRES</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontStyle: 'italic', fontFamily: t.serif, letterSpacing: 0, fontSize: 12 }}>Chapitre III · ORL</span>
        <span style={{ marginLeft: 24 }}>p. 067</span>
      </div>

      {/* Chapter opener */}
      <div style={{ padding: '38px 48px 26px', borderBottom: `1.5px double ${t.rule}`, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48 }}>
        <div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, color: t.ocre, marginBottom: 6 }}>Chapitre III</div>
          <h1 style={{ fontFamily: t.serif, fontSize: 92, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, lineHeight: 0.95 }}>
            ORL.
          </h1>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 22, color: t.ink2, marginTop: 8 }}>
            Oreilles, nez, gorge & sinus.
          </div>
        </div>

        <div style={{ borderLeft: `1px solid ${t.rule}`, paddingLeft: 24, fontFamily: t.serif, fontSize: 14, lineHeight: 1.55, color: t.ink2 }}>
          <span style={{ fontSize: 42, float: 'left', lineHeight: 0.85, marginRight: 6, marginTop: 6, color: t.ocre, fontWeight: 500 }}>L</span>e tractus respiratoire supérieur héberge une flore commensale dense (streptocoques, <em>Cutibacterium</em>, <em>Moraxella</em>) au sein de laquelle émergent les pathogènes par déséquilibre ou virulence accrue.
          <div style={{ marginTop: 16, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between' }}>
            <span>14 bactéries</span><span>·</span><span>4 sous-zones</span><span>·</span><span style={{ color: t.red }}>3 urgences</span>
          </div>
        </div>
      </div>

      {/* Sub-zone : index lateral + plate */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, background: t.paper }}>
        {/* Sidebar sous-zones */}
        <aside style={{ borderRight: `1px solid ${t.rule}`, padding: '24px 24px 24px 48px' }}>
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.14em', marginBottom: 12 }}>SOUS-ZONES</div>
          {orlSubs.map((s, i) => {
            const active = s.id === activeSub;
            return (
              <div key={s.id} onClick={()=>setActiveSub(s.id)} style={{
                padding: '14px 0',
                borderBottom: `1px solid ${t.ruleSoft}`,
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '24px 1fr auto',
                gap: 8,
                alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: active ? t.ocre : t.ink3 }}>{['§a','§b','§c','§d'][i]}</span>
                <span style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, color: active ? t.ink : t.ink2, fontStyle: active ? 'normal' : 'normal' }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3 }}>n={s.n}</span>
                {active && <div style={{ gridColumn: '1 / -1', marginTop: 2, fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, color: t.ocre }}>← lecture en cours</div>}
              </div>
            );
          })}

          <div style={{ marginTop: 32, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.12em', lineHeight: 1.7 }}>
            <div>VOIR AUSSI</div>
            <div style={{ color: t.ink2, marginTop: 6, fontFamily: t.serif, fontSize: 13, fontStyle: 'italic', letterSpacing: 0 }}>
              ↗ Chapitre IV · Respiratoire<br/>
              ↗ Chapitre I · SNC
            </div>
          </div>
        </aside>

        {/* Plate */}
        <div style={{ padding: '28px 48px 28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
            <span style={{ fontFamily: t.mono, fontSize: 10, color: t.ocre, letterSpacing: '0.16em' }}>§ A</span>
            <h2 style={{ fontFamily: t.serif, fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
              Pathogènes de la gorge.
            </h2>
            <div style={{ flex: 1 }}/>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.1em' }}>9 référencés · planche I</div>
          </div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink2, marginBottom: 18, maxWidth: 580 }}>
            Sont rangés par ordre de fréquence d'isolement décroissante. Les déclarations obligatoires sont signalées <span style={{ color: t.red }}>†</span>.
          </div>

          {/* Plate grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, paddingTop: 16, borderTop: `1px solid ${t.rule}` }}>
            {grid.map((b, i) => {
              const c = window.gramColor(b.gram);
              const fig = ['I','II','III','IV','V','VI'][i];
              return (
                <figure key={i} style={{ margin: 0, cursor: 'pointer' }}>
                  <div style={{ background: t.bgSoft, border: `0.5px solid ${t.rule}`, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {/* corner ticks */}
                    <div style={{ position: 'absolute', top: 6, left: 6, fontFamily: t.mono, fontSize: 9, color: t.ink3 }}>fig. {fig}</div>
                    {b.urgence && <div style={{ position: 'absolute', top: 6, right: 8, color: t.red, fontFamily: t.serif, fontSize: 16 }}>†</div>}
                    <svg viewBox="0 0 100 100" width="84" height="84">
                      <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.2} strokeWidth={1.6}/>
                    </svg>
                  </div>
                  <figcaption style={{ paddingTop: 10, paddingBottom: 12, borderBottom: `0.5px solid ${t.ruleSoft}` }}>
                    <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{b.name}</div>
                    <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, marginTop: 4, letterSpacing: '0.02em' }}>{b.shape}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: t.mono, fontSize: 9, color: t.ink2, letterSpacing: '0.06em' }}>
                      <span style={{ color: c.stroke }}>GRAM {b.gram}</span>
                      <span>·</span>
                      <span>{b.freq.toUpperCase()}</span>
                      <span>·</span>
                      <span>{b.o2.split(' ')[0].toUpperCase()}</span>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          <div style={{ marginTop: 22, fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, color: t.ink3 }}>
            (suite des pathogènes p. 069 →)
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// ARTBOARD — Fiche bactérie (Streptococcus pneumoniae) — façon entrée d'atlas
function EditorialSheet() {
  const t = editorialTokens;
  const c = window.gramColor(SPN.gram);

  const Drop = ({ children, n, title }) => (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ocre, letterSpacing: '0.16em', marginBottom: 4 }}>§ {n}</div>
      <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', borderBottom: `1px solid ${t.rule}`, paddingBottom: 6, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: t.paper, color: t.ink, fontFamily: t.serif, display: 'flex', flexDirection: 'column' }}>
      {/* running head */}
      <div style={{ padding: '14px 48px', borderBottom: `0.5px solid ${t.rule}`, display: 'flex', alignItems: 'center', fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.14em' }}>
        <span style={{ cursor: 'pointer' }}>← Chapitre III · ORL</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontStyle: 'italic', fontFamily: t.serif, letterSpacing: 0, fontSize: 12 }}>S. pneumoniae · entrée 023</span>
        <span style={{ marginLeft: 24 }}>p. 074</span>
      </div>

      {/* Two columns layout — entry + side notes */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>
        {/* Main entry */}
        <main style={{ padding: '40px 48px' }}>
          <div style={{ fontFamily: t.mono, fontSize: 11, color: t.ocre, letterSpacing: '0.18em' }}>ENTRÉE Nº 023 · GENRE STREPTOCOCCUS</div>
          <h1 style={{ fontFamily: t.serif, fontSize: 84, fontStyle: 'italic', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 0.92, margin: '8px 0 0' }}>
            Streptococcus<br/>pneumoniae
          </h1>
          <div style={{ fontFamily: t.serif, fontSize: 20, color: t.ink2, marginTop: 12, fontStyle: 'italic', maxWidth: 640, lineHeight: 1.4 }}>
            « Diplocoque Gram positif lancéolé, α-hémolytique, sensible à l'optochine. Première cause de pneumonie communautaire de l'adulte. »
          </div>

          {/* Drop cap intro */}
          <div style={{ marginTop: 28, fontFamily: t.serif, fontSize: 16, lineHeight: 1.6, color: t.ink, columnCount: 2, columnGap: 36, columnRule: `1px solid ${t.ruleSoft}` }}>
            <span style={{ fontFamily: t.serif, fontSize: 78, float: 'left', lineHeight: 0.78, marginRight: 8, marginTop: 6, color: t.ocre, fontWeight: 500 }}>L</span>
            e pneumocoque colonise le rhinopharynx d'environ 30 % des adultes sains. Sa virulence repose sur une <em>capsule polysaccharidique</em> (plus de 90 sérotypes), responsable de la résistance à la phagocytose. L'isolement repose sur la culture en gélose au sang, où les colonies α-hémolytiques sont identifiables à leur sensibilité au disque d'optochine et à leur lyse par les sels biliaires.
          </div>

          <Drop n="01" title="Tests rapides">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: `1px solid ${t.rule}` }}>
              {SPN.rapid.map((r, i) => (
                <div key={r.k} style={{
                  padding: '14px 16px',
                  borderRight: i < 3 ? `1px solid ${t.rule}` : 'none',
                  background: t.bg,
                }}>
                  <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.1em' }}>{r.k}</div>
                  <div style={{ fontFamily: t.serif, fontSize: 40, lineHeight: 1, marginTop: 6, fontWeight: 500 }}>{r.v}</div>
                </div>
              ))}
            </div>
          </Drop>

          <Drop n="02" title="Milieux de culture">
            {SPN.milieux.map((m, i) => (
              <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', alignItems: 'baseline', padding: '10px 0', borderBottom: i === SPN.milieux.length-1 ? 'none' : `1px solid ${t.ruleSoft}`, gap: 12 }}>
                <span style={{ fontFamily: t.mono, fontSize: 10, color: t.ocre, letterSpacing: '0.1em' }}>{['I','II'][i]}</span>
                <div>
                  <div style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink2, marginTop: 2 }}>{m.note}</div>
                </div>
                {m.primary && <span style={{ fontFamily: t.mono, fontSize: 10, color: t.ocre, letterSpacing: '0.12em' }}>1ʳᵉ INTENTION</span>}
              </div>
            ))}
          </Drop>

          <Drop n="03" title="Identification au laboratoire">
            <p style={{ fontFamily: t.serif, fontSize: 15, lineHeight: 1.6, color: t.ink, margin: 0 }}>{SPN.identif}</p>
          </Drop>

          <Drop n="04" title="Signification clinique">
            <p style={{ fontFamily: t.serif, fontSize: 15, lineHeight: 1.6, color: t.ink, margin: 0 }}>{SPN.clinique}</p>
          </Drop>
        </main>

        {/* Marginalia */}
        <aside style={{ borderLeft: `1px solid ${t.rule}`, padding: '40px 36px', background: t.bg, fontFamily: t.serif, fontSize: 13, lineHeight: 1.55 }}>
          {/* Plate / morphology */}
          <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>PLANCHE I · MORPHOLOGIE</div>
          <div style={{ background: t.paper, border: `1px solid ${t.rule}`, padding: 18, position: 'relative' }}>
            <svg viewBox="0 0 100 100" width="100%" height="180">
              <MorphoSVG kind={SPN.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.22} strokeWidth={1.8}/>
              {/* Annotations */}
              <line x1="58" y1="40" x2="86" y2="20" stroke={t.ink2} strokeWidth="0.5" strokeDasharray="2 2"/>
              <text x="86" y="18" fontFamily={t.serif} fontStyle="italic" fontSize="6" fill={t.ink2}>capsule</text>
              <line x1="35" y1="55" x2="14" y2="78" stroke={t.ink2} strokeWidth="0.5" strokeDasharray="2 2"/>
              <text x="2" y="84" fontFamily={t.serif} fontStyle="italic" fontSize="6" fill={t.ink2}>diplocoque</text>
            </svg>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, color: t.ink2, textAlign: 'center', marginTop: 4 }}>fig. I — × 1000, coloration de Gram</div>
          </div>

          <div style={{ marginTop: 22, padding: '14px 16px', background: c.stroke, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontFamily: t.mono, fontSize: 9, letterSpacing: '0.18em', opacity: 0.8 }}>COLORATION DE GRAM</div>
            <div style={{ fontFamily: t.serif, fontSize: 28, fontWeight: 500, marginTop: 4 }}>{c.label}</div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, opacity: 0.9, marginTop: 2 }}>violet cristal retenu</div>
          </div>

          <div style={{ marginTop: 22, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>RÉSISTANCES</div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 13, color: t.ink2, marginBottom: 4 }}>Naturelles</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {SPN.resistNat.map(x=><li key={x} style={{ marginBottom: 2 }}>{x}</li>)}
          </ul>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 13, color: t.ink2, marginTop: 10, marginBottom: 4 }}>Acquises</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {SPN.resistAcq.map(x=><li key={x} style={{ marginBottom: 2 }}>{x}</li>)}
          </ul>

          <div style={{ marginTop: 22, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 6 }}>FACTEURS DE VIRULENCE</div>
          <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 14, color: t.ink, lineHeight: 1.5 }}>
            {SPN.virulence.join(' · ')}
          </div>

          <div style={{ marginTop: 22, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 6 }}>ANTIBIO 1ʳᵉ INTENTION</div>
          <div style={{ background: t.paper, border: `1px solid ${t.rule}`, padding: '12px 14px' }}>
            <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 500 }}>Amoxicilline</div>
            <div style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 12, color: t.ink2, marginTop: 2 }}>Ceftriaxone si méningite.</div>
          </div>

          <div style={{ marginTop: 22, fontFamily: t.mono, fontSize: 10, color: t.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>RENVOIS</div>
          {SPN.sites.map(s => (
            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${t.ruleSoft}`, padding: '7px 0', fontSize: 13 }}>
              <span style={{ fontStyle: 'italic' }}>↗ {s.l}</span>
              <span style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3 }}>{s.tag}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { EditorialHome, EditorialZone, EditorialSheet });
