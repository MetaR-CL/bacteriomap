// Shared : data, helpers, SVG morpho placeholders, system list

// Apothicaire palette per system : each color is harmonious, low-saturation
// Pairs : { accent, tint, deep } — accent for headers/rules, tint for backgrounds, deep for hover/active
const SYSTEM_PALETTES = {
  snc:  { accent: '#6b3fa0', tint: '#ede4f5', deep: '#3d1f6e', name: 'Prune' },
  yeux: { accent: '#3a6a8a', tint: '#e0eaf2', deep: '#1d3d54', name: 'Bleu de Prusse' },
  orl:  { accent: '#2d6a6f', tint: '#dceae9', deep: '#143b3e', name: 'Vert-de-gris' },
  resp: { accent: '#4a7a4d', tint: '#dfe8de', deep: '#264a28', name: 'Vert mousse' },
  osa:  { accent: '#7a7a2d', tint: '#ebe8d2', deep: '#4a4a14', name: 'Olive' },
  cv:   { accent: '#a02e1f', tint: '#f0d9d4', deep: '#5a160c', name: 'Rouge sang' },
  dig:  { accent: '#9a6b1f', tint: '#efe2c5', deep: '#5d3e0c', name: 'Ocre' },
  uri:  { accent: '#c08a1a', tint: '#f3e5c0', deep: '#7a5208', name: 'Jaune safran' },
  peau: { accent: '#a85a2a', tint: '#f0dccd', deep: '#62301a', name: 'Terre de Sienne' },
  gen:  { accent: '#9a3a6a', tint: '#efd6e0', deep: '#5a1a3a', name: 'Carmin' },
};

const SYSTEMS = [
  { id: 'snc',   label: 'Système nerveux central', short: 'SNC',          subtitle: 'LCR · Méninges',                    n: 9,  hue: 270 },
  { id: 'yeux',  label: 'Yeux',                    short: 'Yeux',         subtitle: 'Conjonctive · Cornée',              n: 6,  hue: 200 },
  { id: 'orl',   label: 'ORL',                     short: 'ORL',          subtitle: 'Oreilles · Nez · Gorge · Sinus',    n: 8,  hue: 185 },
  { id: 'resp',  label: 'Respiratoire',            short: 'Resp.',        subtitle: 'Poumons · Bronches',                n: 11, hue: 170 },
  { id: 'osa',   label: 'Os · Articulations',      short: 'Os · Artic.',  subtitle: 'Liquide articulaire · Biopsies',    n: 5,  hue: 95  },
  { id: 'cv',    label: 'Cardiovasculaire',        short: 'Cardiovasc.',  subtitle: 'Hémocultures',                      n: 28, hue: 5   },
  { id: 'dig',   label: 'Digestif',                short: 'Digestif',     subtitle: 'Estomac · Intestins · Selles',      n: 13, hue: 35  },
  { id: 'uri',   label: 'Urinaire',                short: 'Urinaire',     subtitle: 'Reins · Vessie · Urines',           n: 10, hue: 50  },
  { id: 'peau',  label: 'Peau',                    short: 'Peau',         subtitle: 'Plaies · Abcès · Brûlures',         n: 11, hue: 25  },
  { id: 'gen',   label: 'Génital',                 short: 'Génital',      subtitle: 'Masculin / Féminin',                n: 7,  hue: 330 },
];

// Returns palette for a system id (with admin overrides from localStorage)
function getSystemPalette(systemId) {
  try {
    const saved = JSON.parse(localStorage.getItem('bm.systemPalettes') || '{}');
    if (saved[systemId]) return { ...SYSTEM_PALETTES[systemId], ...saved[systemId] };
  } catch (e) {}
  return SYSTEM_PALETTES[systemId] || SYSTEM_PALETTES.orl;
}

const LCR_PATHO = [
  { name: 'Streptococcus pneumoniae', gram: '+', morpho: 'cocci-pairs',   shape: 'coque · diplocoques lancéolés',         freq: 'fréquent',     o2: 'aéro-anaérobie facultatif', urgence: true,  declaration: false },
  { name: 'Neisseria meningitidis',   gram: '−', morpho: 'cocci-pairs',   shape: 'coque · diplocoques en grains de café', freq: 'fréquent',     o2: 'aérobie strict',            urgence: true,  declaration: true  },
  { name: 'Listeria monocytogenes',   gram: '+', morpho: 'rod',           shape: 'bacille · isolés ou courtes chaînettes',freq: 'occasionnel',  o2: 'aéro-anaérobie facultatif', urgence: true,  declaration: true  },
  { name: 'Haemophilus influenzae',   gram: '−', morpho: 'coccobacillus', shape: 'coccobacille · isolés, pléomorphes',    freq: 'rare',         o2: 'aéro-anaérobie facultatif', urgence: false, declaration: false },
  { name: 'Escherichia coli',         gram: '−', morpho: 'rod',           shape: 'bacille · isolés',                      freq: 'occasionnel',  o2: 'aéro-anaérobie facultatif', urgence: true,  declaration: false },
  { name: 'Streptococcus agalactiae', gram: '+', morpho: 'cocci-chains',  shape: 'coque · chaînettes',                    freq: 'occasionnel',  o2: 'aéro-anaérobie facultatif', urgence: true,  declaration: false },
  { name: 'Mycobacterium tuberculosis', gram: '+', morpho: 'rod-bar',     shape: 'bacille · isolés, BAAR',                freq: 'rare',         o2: 'aérobie strict',            urgence: true,  declaration: true,  bsl3: true },
  { name: 'Cutibacterium acnes',      gram: '+', morpho: 'rod',           shape: 'bacille · isolés, pléomorphes',         freq: 'rare',         o2: 'anaérobie strict',          urgence: false, declaration: false },
  { name: 'Candida albicans',         gram: 'F', morpho: 'yeast',         shape: 'levure · pseudo-hyphes',                freq: 'occasionnel',  o2: 'aéro-anaérobie facultatif', urgence: false, declaration: false },
];

const SPN = {
  name: 'Streptococcus pneumoniae',
  gram: '+',
  morpho: 'cocci-pairs',
  shapeShort: 'coque · diplocoques lancéolés',
  o2: 'aéro-anaérobie facultatif',
  urgence: 'Urgence clinique',
  rapid: [
    { k: 'Catalase',    v: '−' },
    { k: 'Oxydase',     v: '−' },
    { k: 'Coagulase',   v: '−' },
    { k: 'Sporulation', v: '−' },
  ],
  milieux: [
    { name: 'Gélose sang',    note: 'colonies mucoïdes, α-hémolytiques avec zone verte', primary: true },
    { name: 'Gélose chocolat', note: 'meilleure croissance',                              primary: false },
  ],
  identif: 'MALDI-TOF. Sensibilité à l\'optochine (zone ≥14mm). Lyse par les sels biliaires. Antigène urinaire (BinaxNOW).',
  resistNat: ['Aminosides (bas niveau)'],
  resistAcq: ['Pénicilline (altération PLP)', 'Macrolides (erm, mef)', 'Fluoroquinolones (rare)'],
  virulence: ['Capsule polysaccharidique', 'Pneumolysine', 'Autolysine', 'IgA protéase'],
  clinique: 'Pneumonies communautaires (1ère cause), méningites bactériennes (adulte), otites moyennes, sinusites, bactériémies.',
  antibio: 'Amoxicilline (si sensible). Ceftriaxone pour méningites. Selon CMI pour les souches de sensibilité diminuée.',
  sites: [
    { l: 'Voies respiratoires', tag: 'fréquent' },
    { l: 'Système nerveux central', tag: 'fréquent' },
    { l: 'ORL', tag: 'fréquent', flora: true },
    { l: 'Cardiovasculaire', tag: 'occasionnel' },
    { l: 'Yeux', tag: 'occasionnel' },
  ],
};

const ORL_SUBS = [
  { id: 'gorge',  label: 'Gorge',  n: 4 },
  { id: 'nez',    label: 'Nez',    n: 2 },
  { id: 'oreille',label: 'Oreille',n: 5 },
  { id: 'sinus',  label: 'Sinus',  n: 3 },
];

// ─────────────────────────────────────────────────
// Richer SVG morphologies — capsules, hemispheres, highlights, internal detail
// `vivid` = bool : if true, gradients + saturated highlights
function MorphoSVG({ kind, size = 100, stroke = 'var(--violet)', fill = 'var(--violet)', fillOpacity = 0.22, strokeWidth = 1.5, vivid = false, gradId = 'g' }) {
  const r = size / 2;
  const cx = r, cy = r;
  const gid = `${gradId}-${kind}-${Math.random().toString(36).slice(2,7)}`;

  // Coccus with capsule + highlight
  const Coccus = ({ x, y, rad, key }) => (
    <g key={key}>
      {/* capsule halo */}
      <circle cx={x} cy={y} r={rad+1.6} fill={fill} fillOpacity={vivid ? 0.08 : 0.06} stroke={stroke} strokeOpacity={0.35} strokeWidth={strokeWidth*0.5} strokeDasharray="1.2 1.2"/>
      {/* body */}
      <circle cx={x} cy={y} r={rad} fill={`url(#${gid}-c)`} stroke={stroke} strokeWidth={strokeWidth}/>
      {/* highlight */}
      <ellipse cx={x - rad*0.35} cy={y - rad*0.4} rx={rad*0.3} ry={rad*0.18} fill="#fff" fillOpacity={vivid ? 0.5 : 0.3}/>
      {/* nucleoid speck */}
      <circle cx={x + rad*0.15} cy={y + rad*0.1} r={rad*0.18} fill={stroke} fillOpacity={0.35}/>
    </g>
  );

  // Rod with rounded caps + texture
  const Rod = ({ x, y, w, h, key, angle=0 }) => (
    <g key={key} transform={`rotate(${angle} ${x+w/2} ${y+h/2})`}>
      <rect x={x} y={y} width={w} height={h} rx={h/2} fill={`url(#${gid}-r)`} stroke={stroke} strokeWidth={strokeWidth}/>
      {/* septum line */}
      <line x1={x + w*0.5} y1={y+h*0.15} x2={x + w*0.5} y2={y+h*0.85} stroke={stroke} strokeWidth={strokeWidth*0.4} opacity={0.55}/>
      {/* highlight */}
      <rect x={x + w*0.1} y={y + h*0.18} width={w*0.8} height={h*0.18} rx={h*0.09} fill="#fff" fillOpacity={vivid ? 0.4 : 0.22}/>
    </g>
  );

  const defs = (
    <defs>
      <radialGradient id={`${gid}-c`} cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#fff" stopOpacity={vivid ? 0.6 : 0.35}/>
        <stop offset="35%" stopColor={fill} stopOpacity={vivid ? 0.75 : fillOpacity*2.5}/>
        <stop offset="100%" stopColor={fill} stopOpacity={vivid ? 0.95 : fillOpacity*3.2}/>
      </radialGradient>
      <linearGradient id={`${gid}-r`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity={vivid ? 0.45 : 0.2}/>
        <stop offset="50%" stopColor={fill} stopOpacity={vivid ? 0.7 : fillOpacity*2.2}/>
        <stop offset="100%" stopColor={fill} stopOpacity={vivid ? 0.95 : fillOpacity*3.5}/>
      </linearGradient>
      <radialGradient id={`${gid}-y`} cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#fff" stopOpacity={vivid ? 0.7 : 0.4}/>
        <stop offset="40%" stopColor={fill} stopOpacity={vivid ? 0.6 : fillOpacity*2}/>
        <stop offset="100%" stopColor={fill} stopOpacity={vivid ? 0.9 : fillOpacity*3}/>
      </radialGradient>
    </defs>
  );

  if (kind === 'cocci-pairs') {
    return (
      <g>
        {defs}
        <Coccus x={cx-18} y={cy-10} rad={11}/>
        <Coccus x={cx-5}  y={cy-7}  rad={11}/>
        <Coccus x={cx+8}  y={cy+10} rad={11}/>
        <Coccus x={cx+22} y={cy+13} rad={11}/>
      </g>
    );
  }
  if (kind === 'cocci-chains') {
    const items = [];
    for (let i=0;i<6;i++) {
      const x = cx - 28 + i*11;
      const y = cy + Math.sin(i*0.7)*5;
      items.push(<Coccus key={i} x={x} y={y} rad={7.5}/>);
    }
    return <g>{defs}{items}</g>;
  }
  if (kind === 'cocci-cluster') {
    const positions = [
      [cx-14, cy-12, 9], [cx-2, cy-16, 9], [cx+12, cy-9, 9],
      [cx-18, cy+1, 9], [cx-4, cy+3, 9], [cx+10, cy+7, 9],
      [cx-9, cy+16, 9], [cx+5, cy+18, 9],
    ];
    return <g>{defs}{positions.map(([x,y,r],i)=><Coccus key={i} x={x} y={y} rad={r}/>)}</g>;
  }
  if (kind === 'rod') {
    return (
      <g>
        {defs}
        <Rod x={cx-26} y={cy-8} w={26} h={11} angle={-8}/>
        <Rod x={cx+2}  y={cy-6} w={26} h={11} angle={6}/>
        <Rod x={cx-12} y={cy+10} w={28} h={11} angle={-3}/>
      </g>
    );
  }
  if (kind === 'rod-bar') {
    // BAAR — beaded mycobacteria
    return (
      <g>
        {defs}
        {[0,1,2].map(i=>(
          <g key={i} transform={`rotate(${(i-1)*8} ${cx} ${cy + (i-1)*12})`}>
            <rect x={cx-26} y={cy + (i-1)*12 - 4} width={52} height={8} rx={4} fill={`url(#${gid}-r)`} stroke={stroke} strokeWidth={strokeWidth}/>
            {[0,1,2,3,4].map(b=>(
              <circle key={b} cx={cx-22 + b*11} cy={cy + (i-1)*12} r={2} fill={stroke} fillOpacity={0.7}/>
            ))}
          </g>
        ))}
      </g>
    );
  }
  if (kind === 'coccobacillus') {
    return (
      <g>
        {defs}
        <Rod x={cx-24} y={cy-14} w={18} h={11} angle={-12}/>
        <Rod x={cx-2}  y={cy-4}  w={18} h={11} angle={8}/>
        <Rod x={cx-14} y={cy+14} w={20} h={11} angle={-4}/>
      </g>
    );
  }
  if (kind === 'spiral') {
    return (
      <g>
        {defs}
        <path d={`M ${cx-26} ${cy} q 6 -16 12 0 t 12 0 t 12 0 t 12 0`}
              fill="none" stroke={stroke} strokeWidth={strokeWidth+1} strokeLinecap="round"/>
        <path d={`M ${cx-26} ${cy} q 6 -16 12 0 t 12 0 t 12 0 t 12 0`}
              fill="none" stroke={fill} strokeWidth={strokeWidth+0.4} strokeLinecap="round" opacity="0.5"/>
      </g>
    );
  }
  if (kind === 'yeast') {
    return (
      <g>
        {defs}
        <ellipse cx={cx-6} cy={cy-4} rx={18} ry={14} fill={`url(#${gid}-y)`} stroke={stroke} strokeWidth={strokeWidth}/>
        <ellipse cx={cx+14} cy={cy+10} rx={11} ry={9} fill={`url(#${gid}-y)`} stroke={stroke} strokeWidth={strokeWidth}/>
        {/* highlight */}
        <ellipse cx={cx-12} cy={cy-10} rx={5} ry={3} fill="#fff" fillOpacity={vivid ? 0.55 : 0.32}/>
        {/* internal vacuole */}
        <ellipse cx={cx-2} cy={cy-1} rx={4} ry={3} fill={stroke} fillOpacity={0.18}/>
        <ellipse cx={cx+16} cy={cy+11} rx={2.5} ry={2} fill={stroke} fillOpacity={0.18}/>
      </g>
    );
  }
  // fallback
  return (
    <g>
      {defs}
      <Coccus x={cx} y={cy} rad={14}/>
    </g>
  );
}

function gramColor(gram) {
  // Returns palette for Gram type: positive = violet/indigo, negative = pink/red
  if (gram === '+') return { stroke: '#3D2A6B', fill: '#5B3FA8', tint: '#EDE7F8', label: 'Gram +' };
  if (gram === '-' || gram === '−') return { stroke: '#7A1F3D', fill: '#C4337A', tint: '#FBE6EE', label: 'Gram −' };
  return { stroke: '#444', fill: '#777', tint: '#EEE', label: gram || '—' };
}

Object.assign(window, { SYSTEMS, SYSTEM_PALETTES, getSystemPalette, LCR_PATHO, SPN, ORL_SUBS, MorphoSVG, gramColor });
