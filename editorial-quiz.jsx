// editorial-quiz.jsx — Quiz « Qui suis-je ? » avec indices progressifs
// Indices : Gram → Morphologie → Habitat → Pathologie

const QUIZ_DIFFICULTY = {
  // 1 = facile (très distinctif), 2 = moyen, 3 = difficile (très ressemblant)
  'Streptococcus pneumoniae': 1,
  'Neisseria meningitidis':   2,
  'Listeria monocytogenes':   2,
  'Haemophilus influenzae':   2,
  'Escherichia coli':         1,
  'Streptococcus agalactiae': 2,
  'Mycobacterium tuberculosis':1,
  'Cutibacterium acnes':      3,
  'Candida albicans':         1,
  'Streptococcus pyogenes':   2,
  'Moraxella catarrhalis':    3,
  'Staphylococcus aureus':    1,
  'Pseudomonas aeruginosa':   1,
  'Fusobacterium necrophorum':3,
  'Streptococcus viridans':   3,
};

// Habitat & pathology hints per bacteria (extend as needed)
const QUIZ_HINTS = {
  'Streptococcus pneumoniae': {
    habitat: 'Coloniseur fréquent du rhinopharynx (20–60 % de la population). On me trouve aussi à l\'aise dans les sinus et l\'oreille moyenne.',
    patho:   '1ʳᵉ cause de pneumonie communautaire et de méningite bactérienne de l\'adulte. Aussi : otites, sinusites, bactériémies.',
    tell:    'Sensible à l\'optochine. Lyse par les sels biliaires. α-hémolytique sur gélose sang.',
  },
  'Neisseria meningitidis': {
    habitat: 'Rhinopharynx (5–10 % de porteurs sains). Strictement humain, transmission par gouttelettes.',
    patho:   'Méningite et purpura fulminans. Maladie à déclaration obligatoire — urgence absolue.',
    tell:    'Diplocoque en grains de café. Oxydase +. Fragile en dehors de l\'hôte.',
  },
  'Listeria monocytogenes': {
    habitat: 'Sol, eau, aliments réfrigérés (fromages au lait cru, charcuterie). Tropisme placentaire et neuroméningé.',
    patho:   'Listériose : méningite du sujet âgé/immunodéprimé, infection materno-fœtale.',
    tell:    'Bacille mobile à 25 °C, pousse au froid. β-hémolytique étroite. Catalase +.',
  },
  'Haemophilus influenzae': {
    habitat: 'Voies respiratoires hautes. Capsulé (type b) ou non capsulé.',
    patho:   'Méningite de l\'enfant non vacciné, otites, sinusites, épiglottite, exacerbations BPCO.',
    tell:    'Exigeant : facteurs X (hémine) + V (NAD). Pousse sur gélose chocolat, pas sur sang seul.',
  },
  'Escherichia coli': {
    habitat: 'Flore intestinale dominante. Sortie du tube digestif = pathogène.',
    patho:   'Infections urinaires (1ʳᵉ cause), bactériémies, méningites néonatales, gastro-entérites (souches pathovars).',
    tell:    'Lactose +, indole +, mobile. Colonies brillantes sur gélose lactosée.',
  },
  'Streptococcus agalactiae': {
    habitat: 'Tube digestif et tractus génital de la femme (10–30 % de portage).',
    patho:   'Infection materno-fœtale précoce (sepsis, méningite néonatale). Dépistage vaginal à 35–37 SA.',
    tell:    'Streptocoque B. β-hémolytique. CAMP test +. Hippurate hydrolysé.',
  },
  'Mycobacterium tuberculosis': {
    habitat: 'Strictement humain. Transmission aérienne. Croissance très lente (3–6 semaines).',
    patho:   'Tuberculose — pulmonaire surtout, mais aussi miliaire, méningée, osseuse. Déclaration obligatoire.',
    tell:    'BAAR (bacille acido-alcoolo-résistant). Coloration de Ziehl-Neelsen. Niveau de sécurité BSL-3.',
  },
  'Cutibacterium acnes': {
    habitat: 'Flore cutanée (follicules sébacés). Anaérobie.',
    patho:   'Acné. Infections de prothèses (épaule surtout). Souvent contaminant en hémoculture.',
    tell:    'Bacille pléomorphe, croissance lente en anaérobie. Catalase +. Indole +.',
  },
  'Candida albicans': {
    habitat: 'Flore digestive et muqueuses. Pas une bactérie — levure.',
    patho:   'Candidoses cutanéomuqueuses, candidémies du patient immunodéprimé ou en réanimation.',
    tell:    'Test du tube germinatif +. Filaments pseudo-mycéliens. Colonies blanches crémeuses.',
  },
  'Streptococcus pyogenes': {
    habitat: 'Pharynx et peau humaine.',
    patho:   'Angine, scarlatine, érysipèle, fasciite nécrosante, RAA, glomérulonéphrite post-strepto.',
    tell:    'Strepto A. β-hémolyse large. Bacitracine S. PYR +.',
  },
  'Staphylococcus aureus': {
    habitat: 'Narines (30 % de portage), peau. Anywhere on humans.',
    patho:   'Furoncles, abcès, impétigo, ostéomyélite, endocardite, choc toxique, intoxication alimentaire.',
    tell:    'Cocci en grappes. Coagulase +. DNase +. Colonies dorées β-hémolytiques.',
  },
  'Pseudomonas aeruginosa': {
    habitat: 'Eau, environnement humide. Hôpitaux. Mucoviscidose.',
    patho:   'Pneumonies nosocomiales, brûlures, infections urinaires sur sonde, otites externes malignes.',
    tell:    'Pigment vert (pyocyanine). Odeur de tilleul. Oxydase +. Pousse à 42 °C.',
  },
};

function QuizScreen({ navigate }) {
  // Filters
  const [filterSystem, setFilterSystem] = React.useState('all');
  const [filterGram, setFilterGram]     = React.useState('all');
  const [filterDiff, setFilterDiff]     = React.useState('all');

  // Quiz state
  const [hintLevel, setHintLevel] = React.useState(0); // 0=Gram, 1=morpho, 2=habitat, 3=patho, 4=révélé
  const [revealed, setRevealed]   = React.useState(false);
  const [seed, setSeed]           = React.useState(0);

  // Build pool from data
  const pool = React.useMemo(() => {
    const all = [
      ...LCR_PATHO,
      ...(window.ORL_PATHO || []),
    ];
    // dedupe by name
    const seen = new Set();
    const out = [];
    for (const b of all) {
      if (seen.has(b.name)) continue;
      seen.add(b.name);
      out.push(b);
    }
    return out;
  }, []);

  // Filtered pool
  const filtered = React.useMemo(() => {
    return pool.filter(b => {
      if (filterGram !== 'all' && b.gram !== filterGram) return false;
      const d = QUIZ_DIFFICULTY[b.name] || 2;
      if (filterDiff !== 'all' && String(d) !== filterDiff) return false;
      // System filter — use the SPN.sites mapping or LCR fallback
      if (filterSystem !== 'all') {
        // crude : ORL species in ORL_PATHO get 'orl', LCR species get 'snc'
        const inORL = (window.ORL_PATHO || []).some(p => p.name === b.name);
        const inLCR = LCR_PATHO.some(p => p.name === b.name);
        if (filterSystem === 'orl' && !inORL) return false;
        if (filterSystem === 'snc' && !inLCR) return false;
        if (filterSystem !== 'orl' && filterSystem !== 'snc') return false;
      }
      return true;
    });
  }, [pool, filterSystem, filterGram, filterDiff]);

  // Pick current
  const current = React.useMemo(() => {
    if (!filtered.length) return null;
    return filtered[seed % filtered.length];
  }, [filtered, seed]);

  const next = () => {
    setHintLevel(0);
    setRevealed(false);
    setSeed(s => {
      // pick a new random different from current
      if (filtered.length <= 1) return s + 1;
      let n;
      do { n = Math.floor(Math.random() * filtered.length); } while (n === (s % filtered.length));
      return n;
    });
  };

  const reveal = () => { setRevealed(true); setHintLevel(4); };
  const nextHint = () => setHintLevel(h => Math.min(h + 1, 3));

  if (!current) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, color:T.ink2, padding:40, textAlign:'center' }}>
        <div>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:26, marginBottom:8 }}>Aucune bactérie ne correspond à ces filtres.</div>
          <button onClick={()=>{ setFilterSystem('all'); setFilterGram('all'); setFilterDiff('all'); }}
                  style={{ marginTop:14, padding:'8px 16px', border:`1px solid ${T.rule}`, background:'transparent', color:T.ink2, fontFamily:T.mono, fontSize:11, letterSpacing:'0.1em', cursor:'pointer' }}>
            RÉINITIALISER
          </button>
        </div>
      </div>
    );
  }

  const c = window.gramColor(current.gram);
  const hints = QUIZ_HINTS[current.name] || { habitat: '—', patho: '—', tell: '—' };
  const diff = QUIZ_DIFFICULTY[current.name] || 2;

  // Reset quiz when filters / current change
  React.useEffect(() => {
    setHintLevel(0);
    setRevealed(false);
  }, [current.name]);

  // Hint levels rendered
  const HintCard = ({ n, label, available, content, accent }) => (
    <div style={{
      border:`1px solid ${available ? T.rule : T.ruleSoft}`,
      background: available ? T.paper : 'transparent',
      padding:'20px 22px',
      opacity: available ? 1 : 0.45,
      transition:'all .25s',
      position:'relative',
    }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:available ? 10 : 0 }}>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.16em' }}>INDICE {n}</span>
        <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, color: available ? (accent||T.ink) : T.ink3 }}>{label}</span>
      </div>
      {available && (
        <div style={{ fontFamily:T.serif, fontSize:15, lineHeight:1.55, color:T.ink2 }}>
          {content}
        </div>
      )}
      {!available && (
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.12em', marginTop:6 }}>VERROUILLÉ</div>
      )}
    </div>
  );

  // Hints labels and contents
  const morphoLabel = current.shape || current.morpho;
  const morphoNote = current.morpho === 'cocci-pairs' ? 'En diplocoques.'
                  : current.morpho === 'cocci-chains' ? 'En chaînettes.'
                  : current.morpho === 'cocci-cluster' ? 'En amas, comme une grappe de raisin.'
                  : current.morpho === 'rod' ? 'Bacille.'
                  : current.morpho === 'coccobacillus' ? 'Coccobacille — entre coque et bacille.'
                  : current.morpho === 'rod-bar' ? 'Bacille acido-alcoolo-résistant (BAAR).'
                  : current.morpho === 'yeast' ? 'Levure (pas une bactérie au sens strict).' : '';

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, background:T.bg }}>
      {/* Running head */}
      <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('home')}>← TABLE DES MATIÈRES</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>
          Annexe · Récréation
        </span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span>p. 245</span>
      </div>

      {/* Title */}
      <div style={{ padding:'40px 56px 28px', borderBottom:`1.5px double ${T.rule}`, background:T.paper }}>
        <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:T.ocre, marginBottom:6 }}>Récréation</div>
        <h1 style={{ fontFamily:T.serif, fontSize:88, fontWeight:500, letterSpacing:'-0.025em', lineHeight:0.92, fontStyle:'italic', margin:0 }}>
          Qui suis-je&nbsp;?
        </h1>
        <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:T.ink2, marginTop:14, maxWidth:680, lineHeight:1.5 }}>
          Quatre indices, du plus large au plus précis. Devine la bactérie avant qu'elle ne se révèle.
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding:'18px 56px', borderBottom:`1px solid ${T.rule}`, background:T.paper, display:'flex', gap:24, alignItems:'center', fontFamily:T.mono, fontSize:10 }}>
        <span style={{ color:T.ink3, letterSpacing:'0.16em' }}>FILTRES</span>

        <FilterGroup label="SYSTÈME" value={filterSystem} onChange={setFilterSystem} options={[
          ['all','Tous'], ['snc','SNC'], ['orl','ORL']
        ]}/>
        <FilterGroup label="GRAM" value={filterGram} onChange={setFilterGram} options={[
          ['all','Tous'], ['+','G+'], ['−','G−'], ['F','F']
        ]}/>
        <FilterGroup label="DIFFICULTÉ" value={filterDiff} onChange={setFilterDiff} options={[
          ['all','Tous'], ['1','★'], ['2','★★'], ['3','★★★']
        ]}/>

        <span style={{ flex:1 }}/>
        <span style={{ color:T.ink3, fontStyle:'italic', fontFamily:T.serif, fontSize:13 }}>
          {filtered.length} bactérie{filtered.length>1?'s':''} dans le tirage
        </span>
      </div>

      {/* Body */}
      <div style={{ flex:1, padding:'40px 56px 56px', display:'grid', gridTemplateColumns:'380px 1fr', gap:48, maxWidth:1400, margin:'0 auto', width:'100%' }}>
        {/* Left : silhouette + actions */}
        <div>
          <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.18em', marginBottom:10 }}>SILHOUETTE</div>
          <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:24, position:'relative' }}>
            <div style={{ height:280, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {/* Silhouette : show the SVG only when hintLevel >= 1 (morpho revealed), else show a blurred / mystery placeholder */}
              {hintLevel >= 1 ? (
                <svg viewBox="0 0 100 100" width={240} height={240}>
                  <MorphoSVG kind={current.morpho} size={100}
                             stroke={hintLevel >= 0 ? c.stroke : '#888'}
                             fill={hintLevel >= 0 ? c.fill : '#888'}
                             fillOpacity={0.3} strokeWidth={1.6} vivid={false}/>
                </svg>
              ) : (
                <div style={{ width:240, height:240, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.serif, fontSize:140, color:T.ink3, fontStyle:'italic', opacity:0.35 }}>
                  ?
                </div>
              )}
            </div>
            <div style={{ borderTop:`1px solid ${T.ruleSoft}`, marginTop:8, paddingTop:10, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.12em' }}>DIFFICULTÉ</span>
              <span style={{ fontFamily:T.serif, fontSize:18, color:T.ocre }}>{'★'.repeat(diff)}{'☆'.repeat(3-diff)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop:22, display:'flex', flexDirection:'column', gap:10 }}>
            {!revealed && hintLevel < 3 && (
              <button onClick={nextHint} style={{
                padding:'14px 18px', background:T.ink, color:T.paper, border:'none',
                fontFamily:T.mono, fontSize:11, letterSpacing:'0.16em', cursor:'pointer',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span>INDICE SUIVANT</span>
                <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14 }}>→</span>
              </button>
            )}
            {!revealed && (
              <button onClick={reveal} style={{
                padding:'12px 18px', background:'transparent', color:T.ink2,
                border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:11,
                letterSpacing:'0.16em', cursor:'pointer',
              }}>RÉVÉLER</button>
            )}
            {revealed && (
              <button onClick={next} style={{
                padding:'14px 18px', background:T.ocre, color:T.paper, border:'none',
                fontFamily:T.mono, fontSize:11, letterSpacing:'0.16em', cursor:'pointer',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <span>SUIVANTE</span>
                <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14 }}>→</span>
              </button>
            )}
          </div>

          {/* Reveal panel */}
          {revealed && (
            <div style={{ marginTop:22, padding:'18px 20px', background:c.tint, borderLeft:`4px solid ${c.stroke}` }}>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.18em', marginBottom:6 }}>RÉPONSE</div>
              <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:28, fontWeight:500, color:T.ink, lineHeight:1.1 }}>
                {current.name}
              </div>
              <div style={{ fontFamily:T.serif, fontSize:14, color:T.ink2, marginTop:10, lineHeight:1.5 }}>
                {hints.tell}
              </div>
              <div onClick={()=>navigate('sheet', { bacteriaId: current.name, systemId: filterSystem !== 'all' ? filterSystem : 'orl' })}
                   style={{ marginTop:14, fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ocre, cursor:'pointer' }}>
                ↗ Voir la fiche complète
              </div>
            </div>
          )}
        </div>

        {/* Right : hints stack */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <HintCard n={1} label="Coloration de Gram" available={hintLevel >= 0}
                    accent={c.stroke}
                    content={(
                      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <span style={{
                          background:c.stroke, color:'#fff', padding:'6px 14px',
                          fontFamily:T.serif, fontSize:18, fontWeight:500,
                        }}>{c.label}</span>
                        <span style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink2 }}>
                          {current.gram === '+' ? 'Paroi épaisse à peptidoglycane qui retient le violet cristal.'
                          : current.gram === '−' ? 'Paroi fine + membrane externe LPS — décoloré au mordant, recoloré en fuchsine.'
                          : 'Levure : non concerné par la coloration de Gram.'}
                        </span>
                      </div>
                    )}/>
          <HintCard n={2} label="Morphologie" available={hintLevel >= 1}
                    content={(
                      <div>
                        <div style={{ fontStyle:'italic', marginBottom:4 }}>{morphoLabel}</div>
                        <div style={{ fontSize:13, color:T.ink3 }}>{morphoNote}</div>
                      </div>
                    )}/>
          <HintCard n={3} label="Habitat & écologie" available={hintLevel >= 2}
                    content={hints.habitat}/>
          <HintCard n={4} label="Pathologie associée" available={hintLevel >= 3}
                    content={hints.patho}/>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ color:T.ink3, letterSpacing:'0.12em' }}>{label}</span>
      <div style={{ display:'flex', gap:0 }}>
        {options.map(([v,l],i)=>(
          <button key={v} onClick={()=>onChange(v)} style={{
            padding:'4px 9px',
            background: value===v ? T.ink : 'transparent',
            color: value===v ? T.paper : T.ink2,
            border:`1px solid ${value===v ? T.ink : T.rule}`,
            borderLeft: i>0 && value!==v ? 'none' : `1px solid ${value===v ? T.ink : T.rule}`,
            fontFamily:T.mono, fontSize:10, letterSpacing:'0.06em', cursor:'pointer',
          }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { QuizScreen });
