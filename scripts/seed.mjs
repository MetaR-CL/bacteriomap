import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Maps static gram symbols to Supabase check-constraint values
const GRAM_MAP = { '+': 'positif', '−': 'negatif', '±': 'variable', 'F': 'aucun' }

function typeOf(gram, morpho) {
  if (gram === 'F') return morpho === 'mold' ? 'moisissure' : 'levure'
  return 'bacterie'
}

// ── Systems ──────────────────────────────────────────────────────────────────
const systemsData = [
  { slug:'snc',  name:'Système nerveux central', short:'SNC',          subtitle:'LCR · Méninges',                   position:1,  hue:270, color:'#6b3fa0', tint:'#ede4f5', deep:'#3d1f6e' },
  { slug:'yeux', name:'Yeux',                    short:'Yeux',         subtitle:'Conjonctive · Cornée',             position:2,  hue:200, color:'#3a6a8a', tint:'#e0eaf2', deep:'#1d3d54' },
  { slug:'orl',  name:'ORL',                     short:'ORL',          subtitle:'Oreilles · Nez · Gorge · Sinus',  position:3,  hue:185, color:'#2d6a6f', tint:'#dceae9', deep:'#143b3e' },
  { slug:'resp', name:'Respiratoire',             short:'Resp.',        subtitle:'Poumons · Bronches',               position:4,  hue:170, color:'#4a7a4d', tint:'#dfe8de', deep:'#264a28' },
  { slug:'osa',  name:'Os · Articulations',       short:'Os · Artic.', subtitle:'Liquide articulaire · Biopsies',  position:5,  hue:95,  color:'#7a7a2d', tint:'#ebe8d2', deep:'#4a4a14' },
  { slug:'cv',   name:'Cardiovasculaire',         short:'Cardiovasc.', subtitle:'Hémocultures',                    position:6,  hue:5,   color:'#a02e1f', tint:'#f0d9d4', deep:'#5a160c' },
  { slug:'dig',  name:'Digestif',                 short:'Digestif',    subtitle:'Estomac · Intestins · Selles',    position:7,  hue:35,  color:'#9a6b1f', tint:'#efe2c5', deep:'#5d3e0c' },
  { slug:'uri',  name:'Urinaire',                 short:'Urinaire',    subtitle:'Reins · Vessie · Urines',         position:8,  hue:50,  color:'#c08a1a', tint:'#f3e5c0', deep:'#7a5208' },
  { slug:'peau', name:'Peau',                     short:'Peau',        subtitle:'Plaies · Abcès · Brûlures',       position:9,  hue:25,  color:'#a85a2a', tint:'#f0dccd', deep:'#62301a' },
  { slug:'gen',  name:'Génital',                  short:'Génital',     subtitle:'Masculin / Féminin',              position:10, hue:330, color:'#9a3a6a', tint:'#efd6e0', deep:'#5a1a3a' },
]

// ── Zones ─────────────────────────────────────────────────────────────────────
const zonesData = [
  { slug:'orl-gorge',   systemSlug:'orl', name:'Gorge',   position:1, n:4, flora:0, descr:'Pharynx, amygdales. Prélèvement par écouvillonnage.' },
  { slug:'orl-nez',     systemSlug:'orl', name:'Nez',     position:2, n:2, flora:1, descr:'Fosses nasales. Flore commensale importante.' },
  { slug:'orl-oreille', systemSlug:'orl', name:'Oreille', position:3, n:5, flora:0, descr:'Conduit auditif externe, oreille moyenne.' },
  { slug:'orl-sinus',   systemSlug:'orl', name:'Sinus',   position:4, n:3, flora:0, descr:'Sinus paranasaux. Prélèvement per-endoscopique.' },
  { slug:'snc-lcr',     systemSlug:'snc', name:'LCR',     position:1, n:9, flora:0, descr:'Liquide céphalo-rachidien. Ponction lombaire stérile.' },
]

// ── Bacteria ──────────────────────────────────────────────────────────────────
const bacteriaRaw = [
  {
    name: 'Streptococcus pneumoniae',
    gram: '+', morpho: 'cocci-pairs', shape: 'coque · diplocoques lancéolés',
    freq: 'fréquent', o2: 'aéro-anaérobie facultatif',
    urgence: true, declaration: false,
    zoneSlugs: ['snc-lcr', 'orl-gorge'],
    catalase: false, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose Columbia + 5% sang de mouton', note: 'colonies mucoïdes, α-hémolytiques avec zone verte', primary: true },
      { name: 'Gélose au sang cuit (chocolat)', note: 'meilleure croissance en 5% CO₂', primary: false },
    ],
    identif: "MALDI-TOF. Sensibilité à l'optochine (zone ≥14 mm). Lyse par les sels biliaires. Antigène urinaire (BinaxNOW).",
    resist_nat: ['Aminosides (bas niveau)'],
    resist_acq: ['Pénicilline (altération PLP)', 'Macrolides (erm, mef)', 'Fluoroquinolones (rare)'],
    virulence: ['Capsule polysaccharidique', 'Pneumolysine', 'Autolysine', 'IgA protéase'],
    clinical_info: 'Pneumonies communautaires (1ère cause), méningites bactériennes (adulte), otites moyennes, sinusites, bactériémies.',
    antibio: 'Amoxicilline (si sensible). Ceftriaxone pour méningites. Selon CMI pour les souches de sensibilité diminuée.',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'S' },
      { ab: 'Ceftriaxone', sens: 'S' },
      { ab: 'Vancomycine', sens: 'S' },
      { ab: 'Érythromycine', sens: 'I' },
      { ab: 'Tétracycline', sens: 'I' },
    ],
  },
  {
    name: 'Neisseria meningitidis',
    gram: '−', morpho: 'cocci-pairs', shape: 'coque · diplocoques en grains de café',
    freq: 'fréquent', o2: 'aérobie strict',
    urgence: true, declaration: true,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: true, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose au sang cuit (chocolat)', note: 'atmosphère 5% CO₂ obligatoire', primary: true },
      { name: 'Gélose Columbia + 5% sang de mouton', note: '', primary: false },
    ],
    identif: 'MALDI-TOF. Oxydase +. Diplocoques Gram− en grains de café. Agglutination latex ou PCR pour sérogroupage.',
    resist_nat: ['Polymyxines'],
    resist_acq: ['Pénicilline (rare, β-lactamase)'],
    virulence: ['Capsule polysaccharidique', 'Pili', 'Endotoxine LPS', 'IgA protéase'],
    clinical_info: 'Méningite bactérienne, purpura fulminans. Maladie à déclaration obligatoire. Pronostic vital engagé.',
    antibio: 'Ceftriaxone IV en urgence. Chimioprophylaxie entourage : rifampicine ou ciprofloxacine.',
    antibiogramme: [
      { ab: 'Ceftriaxone', sens: 'S' },
      { ab: 'Pénicilline G', sens: 'S' },
      { ab: 'Rifampicine', sens: 'S' },
      { ab: 'Ciprofloxacine', sens: 'S' },
    ],
  },
  {
    name: 'Listeria monocytogenes',
    gram: '+', morpho: 'rod', shape: 'bacille · isolés ou courtes chaînettes',
    freq: 'occasionnel', o2: 'aéro-anaérobie facultatif',
    urgence: true, declaration: true,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose Columbia + 5% sang de mouton', note: 'β-hémolyse étroite, colonies grises', primary: true },
      { name: 'Gélose ALOA ou RAPID Listeria', note: 'milieu sélectif chromogène', primary: false },
    ],
    identif: 'MALDI-TOF. Mobilité en parapluie à 25°C. β-hémolytique étroite. CAMP test + avec S. aureus.',
    resist_nat: ['Céphalosporines', 'Fosfomycine'],
    resist_acq: [],
    virulence: ['Listeriolysine O (LLO)', 'Internalines A/B', 'ActA (mobilité intracellulaire)'],
    clinical_info: 'Listériose : méningite du sujet âgé/immunodéprimé, infection materno-fœtale, septicémie. Aliments réfrigérés (fromages, charcuterie).',
    antibio: 'Amoxicilline + gentamicine. Cotrimoxazole si allergie aux pénicillines.',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'S' },
      { ab: 'Cotrimoxazole', sens: 'S' },
      { ab: 'Gentamicine', sens: 'S' },
      { ab: 'Ceftriaxone', sens: 'R' },
    ],
  },
  {
    name: 'Haemophilus influenzae',
    gram: '−', morpho: 'coccobacillus', shape: 'coccobacille · isolés, pléomorphes',
    freq: 'rare', o2: 'aéro-anaérobie facultatif',
    urgence: false, declaration: false,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: true, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose au sang cuit (chocolat)', note: 'facteurs X et V indispensables', primary: true },
      { name: 'Gélose au sang cuit (chocolat) + Polyvitex', note: '', primary: false },
    ],
    identif: 'MALDI-TOF. Satellite autour de S. aureus sur gélose sang. Exige facteurs X (hémine) + V (NAD).',
    resist_nat: [],
    resist_acq: ['β-lactamase (ampicilline)', 'BLNAR (altération PLP3)'],
    virulence: ['Capsule type b (Hib)', 'Adhésines', 'IgA protéase'],
    clinical_info: 'Méningite enfant non vacciné (Hib), otites, sinusites, épiglottite, exacerbations BPCO.',
    antibio: 'Amoxicilline-clavulanate ou cefuroxime. Ceftriaxone si méningite.',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'I' },
      { ab: 'Amoxicilline-clavulanate', sens: 'S' },
      { ab: 'Ceftriaxone', sens: 'S' },
      { ab: 'Ciprofloxacine', sens: 'S' },
    ],
  },
  {
    name: 'Escherichia coli',
    gram: '−', morpho: 'rod', shape: 'bacille · isolés',
    freq: 'occasionnel', o2: 'aéro-anaérobie facultatif',
    urgence: true, declaration: false,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose MacConkey', note: 'colonies roses lactose+', primary: true },
      { name: 'Gélose Columbia + 5% sang de mouton', note: '', primary: false },
      { name: 'Gélose chromogène', note: 'colonies roses/rouges', primary: false },
    ],
    identif: 'MALDI-TOF. Lactose +, indole +, mobile. Colonies brillantes sur gélose lactosée.',
    resist_nat: [],
    resist_acq: ['BLSE', 'Carbapénémases (rare)', 'Fluoroquinolones'],
    virulence: ['Fimbriae type 1 et P', 'Toxines (ETEC, STEC)', 'Capsule K1 (méningite néonatale)'],
    clinical_info: 'Infections urinaires (1ère cause), bactériémies, méningites néonatales, gastro-entérites (ETEC, STEC).',
    antibio: 'Selon antibiogramme. Amoxicilline-clavulanate ou C3G en première intention.',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'R' },
      { ab: 'Amoxicilline-clavulanate', sens: 'S' },
      { ab: 'Ciprofloxacine', sens: 'S' },
      { ab: 'Ceftriaxone', sens: 'S' },
      { ab: 'Imipénème', sens: 'S' },
    ],
  },
  {
    name: 'Streptococcus agalactiae',
    gram: '+', morpho: 'cocci-chains', shape: 'coque · chaînettes',
    freq: 'occasionnel', o2: 'aéro-anaérobie facultatif',
    urgence: true, declaration: false,
    zoneSlugs: ['snc-lcr'],
    catalase: false, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose Columbia + 5% sang de mouton', note: 'β-hémolyse large', primary: true },
      { name: 'Milieu chromogène StrepB', note: '', primary: false },
    ],
    identif: 'MALDI-TOF. Strepto B. CAMP test +. Hippurate hydrolysé. AgLA latex.',
    resist_nat: ['Aminosides (bas niveau)'],
    resist_acq: ['Macrolides (erm, mef)', 'Tétracyclines'],
    virulence: ['Capsule polysaccharidique', 'Protéine CAMP', 'Adhésines'],
    clinical_info: 'Infection materno-fœtale précoce (sepsis, méningite néonatale). Dépistage vaginal 35–37 SA. Infections adulte âgé.',
    antibio: 'Amoxicilline. Clindamycine si allergie (selon antibiogramme).',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'S' },
      { ab: 'Clindamycine', sens: 'S' },
      { ab: 'Érythromycine', sens: 'I' },
      { ab: 'Vancomycine', sens: 'S' },
    ],
  },
  {
    name: 'Mycobacterium tuberculosis',
    gram: '+', morpho: 'rod-bar', shape: 'bacille · isolés, BAAR',
    freq: 'rare', o2: 'aérobie strict',
    urgence: true, declaration: true, bsl3: true,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Löwenstein-Jensen', note: 'croissance 3–6 semaines, 37°C', primary: true },
      { name: 'Middlebrook 7H10/7H11', note: 'milieu gélosé enrichi', primary: false },
    ],
    identif: 'MALDI-TOF (BSL3). Ziehl-Neelsen (BAAR). PCR GeneXpert MTB/RIF. Culture lente obligatoire.',
    resist_nat: ['Pyrazinamide (M. bovis)'],
    resist_acq: ['Isoniazide', 'Rifampicine (MDR)', 'Fluoroquinolones (XDR)'],
    virulence: ['Cord factor (TDM)', 'Lipoarabinomannane', 'Résistance intracellulaire'],
    clinical_info: 'Tuberculose pulmonaire (toux > 3 semaines, hémoptysie). Formes extrapulmonaires : miliaire, méningite, osseuse. Déclaration obligatoire.',
    antibio: 'Quadrithérapie : Isoniazide + Rifampicine + Pyrazinamide + Éthambutol × 2 mois, puis bithérapie × 4 mois.',
    antibiogramme: [
      { ab: 'Isoniazide', sens: 'S' },
      { ab: 'Rifampicine', sens: 'S' },
      { ab: 'Pyrazinamide', sens: 'S' },
      { ab: 'Éthambutol', sens: 'S' },
    ],
  },
  {
    name: 'Cutibacterium acnes',
    gram: '+', morpho: 'rod', shape: 'bacille · isolés, pléomorphes',
    freq: 'rare', o2: 'anaérobie strict',
    urgence: false, declaration: false,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose Columbia + 5% sang de mouton', note: 'anaérobie strict, 5–7 jours', primary: true },
      { name: 'Gélose Schaedler', note: '', primary: false },
    ],
    identif: 'MALDI-TOF. Anaérobie strict. Colonies blanches/grises. Indole +. Catalase +.',
    resist_nat: [],
    resist_acq: ['Macrolides (acné chronique traitée)'],
    virulence: ['Lipases', 'Protéases', 'Biofilm (prothèses)'],
    clinical_info: 'Acné vulgaire. Infections de prothèses orthopédiques (épaule +++). Souvent contaminant en hémoculture. Endocardites rares.',
    antibio: 'Amoxicilline ou doxycycline. Acné : tétracyclines topiques/systémiques.',
    antibiogramme: [
      { ab: 'Amoxicilline', sens: 'S' },
      { ab: 'Doxycycline', sens: 'S' },
      { ab: 'Clindamycine', sens: 'S' },
      { ab: 'Métronidazole', sens: 'R' },
    ],
  },
  {
    name: 'Candida albicans',
    gram: 'F', morpho: 'yeast', shape: 'levure · pseudo-hyphes',
    freq: 'occasionnel', o2: 'aéro-anaérobie facultatif',
    urgence: false, declaration: false,
    zoneSlugs: ['snc-lcr'],
    catalase: true, oxydase: false, coagulase: false, sporulation: false,
    milieux: [
      { name: 'Gélose Sabouraud', note: 'colonies blanches crémeuses', primary: true },
      { name: 'CHROMagar Candida', note: 'colonies vertes (C. albicans)', primary: false },
      { name: 'Gélose Columbia + 5% sang de mouton', note: '', primary: false },
    ],
    identif: 'MALDI-TOF. Test du tube germinatif + (2h à 37°C). Filaments pseudo-mycéliens. API 20C AUX.',
    resist_nat: ['Fluconazole (C. krusei — autre espèce)', 'Échinocandines (rare)'],
    resist_acq: ['Fluconazole (usage prolongé)'],
    virulence: ['Adhésines (Als)', 'Transition levure-hyphe', 'Biofilm', 'Protéases aspartiques (SAP)'],
    clinical_info: 'Candidoses superficielles (muguet, vaginite). Candidémies du patient immunodéprimé ou en réanimation. Endocardites sur prothèse.',
    antibio: 'Fluconazole (souches sensibles). Échinocandines (infections sévères). Amphotéricine B (formes réfractaires).',
    antibiogramme: [
      { ab: 'Fluconazole', sens: 'S' },
      { ab: 'Caspofungine', sens: 'S' },
      { ab: 'Amphotéricine B', sens: 'S' },
      { ab: 'Voriconazole', sens: 'S' },
    ],
  },
]

async function seed() {
  // 1. Insert systems
  console.log('Seeding systems…')
  const { data: sysDone, error: e1 } = await supabase
    .from('bacterio_systems')
    .upsert(systemsData, { onConflict: 'slug' })
    .select('id, slug')
  if (e1) { console.error('systems:', e1.message); process.exit(1) }
  const systemIdBySlug = Object.fromEntries(sysDone.map(s => [s.slug, s.id]))
  console.log(`  ✓ ${sysDone.length} systèmes`)

  // 2. Insert zones
  console.log('Seeding zones…')
  const zonesPayload = zonesData.map(({ systemSlug, ...z }) => ({
    ...z,
    system_id: systemIdBySlug[systemSlug],
  }))
  const { data: zonesDone, error: e2 } = await supabase
    .from('bacterio_zones')
    .upsert(zonesPayload, { onConflict: 'slug' })
    .select('id, slug')
  if (e2) { console.error('zones:', e2.message); process.exit(1) }
  const zoneIdBySlug = Object.fromEntries(zonesDone.map(z => [z.slug, z.id]))
  console.log(`  ✓ ${zonesDone.length} zones`)

  // 3. Insert bacteria
  console.log('Seeding bacteria…')
  const bacteriaPayload = bacteriaRaw.map(({ gram, morpho, zoneSlugs, ...b }) => ({
    ...b,
    gram: GRAM_MAP[gram] ?? null,
    morphology: morpho,
    type: typeOf(gram, morpho),
    zone_ids: zoneSlugs?.map(s => zoneIdBySlug[s]).filter(Boolean) ?? null,
  }))
  const { data: bactDone, error: e3 } = await supabase
    .from('bacterio_bacteria')
    .upsert(bacteriaPayload, { onConflict: 'name' })
    .select('id, name')
  if (e3) { console.error('bacteria:', e3.message); process.exit(1) }
  console.log(`  ✓ ${bactDone.length} bactéries`)

  console.log('\n✓ Seed terminé.')
}

seed()
