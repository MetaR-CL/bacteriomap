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
// color = accent color (matches the `color` column in the schema)
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
// systemSlug resolved to integer system_id in seed()
const zonesData = [
  { slug:'orl-gorge',   systemSlug:'orl', name:'Gorge',   position:1, n:4, flora:0, descr:'Pharynx, amygdales. Prélèvement par écouvillonnage.' },
  { slug:'orl-nez',     systemSlug:'orl', name:'Nez',     position:2, n:2, flora:1, descr:'Fosses nasales. Flore commensale importante.' },
  { slug:'orl-oreille', systemSlug:'orl', name:'Oreille', position:3, n:5, flora:0, descr:'Conduit auditif externe, oreille moyenne.' },
  { slug:'orl-sinus',   systemSlug:'orl', name:'Sinus',   position:4, n:3, flora:0, descr:'Sinus paranasaux. Prélèvement per-endoscopique.' },
  { slug:'snc-lcr',     systemSlug:'snc', name:'LCR',     position:1, n:9, flora:0, descr:'Liquide céphalo-rachidien. Ponction lombaire stérile.' },
]

// ── Bacteria ──────────────────────────────────────────────────────────────────
// gram/morpho converted to Supabase values in seed()
// zoneSlugs resolved to integer zone_ids in seed()
const bacteriaRaw = [
  {
    name: 'Streptococcus pneumoniae',
    gram: '+', morpho: 'cocci-pairs', shape: 'coque · diplocoques lancéolés',
    freq: 'fréquent', o2: 'aéro-anaérobie facultatif',
    urgence: true, declaration: false, zoneSlugs: ['snc-lcr', 'orl-gorge'],
    milieux: ['Gélose sang', 'Gélose chocolat'],
    resistances: ['Pénicilline (selon CMI)', 'Macrolides (erm, mef)'],
    resist_nat: ['Aminosides (bas niveau)'],
    resist_acq: ['Pénicilline (altération PLP)', 'Macrolides (erm, mef)', 'Fluoroquinolones (rare)'],
    virulence: ['Capsule polysaccharidique', 'Pneumolysine', 'Autolysine', 'IgA protéase'],
    clinical_info: 'Pneumonies communautaires (1ère cause), méningites bactériennes (adulte), otites moyennes, sinusites, bactériémies.',
    identif: "MALDI-TOF. Sensibilité à l'optochine (zone ≥14 mm). Lyse par les sels biliaires.",
    antibio: 'Amoxicilline (si sensible). Ceftriaxone pour méningites.',
  },
  { name:'Neisseria meningitidis',     gram:'−', morpho:'cocci-pairs',   shape:'coque · diplocoques en grains de café', freq:'fréquent',    o2:'aérobie strict',            urgence:true,  declaration:true,  zoneSlugs:['snc-lcr'], milieux:['Gélose chocolat', 'Gélose Müller-Hinton'] },
  { name:'Listeria monocytogenes',     gram:'+', morpho:'rod',           shape:'bacille · isolés ou courtes chaînettes', freq:'occasionnel', o2:'aéro-anaérobie facultatif', urgence:true,  declaration:true,  zoneSlugs:['snc-lcr'], milieux:['BHI', 'Gélose sang'] },
  { name:'Haemophilus influenzae',     gram:'−', morpho:'coccobacillus', shape:'coccobacille · isolés, pléomorphes',    freq:'rare',        o2:'aéro-anaérobie facultatif', urgence:false, declaration:false, zoneSlugs:['snc-lcr'], milieux:['Gélose chocolat'] },
  { name:'Escherichia coli',           gram:'−', morpho:'rod',           shape:'bacille · isolés',                      freq:'occasionnel', o2:'aéro-anaérobie facultatif', urgence:true,  declaration:false, zoneSlugs:['snc-lcr'], milieux:['MacConkey', 'EMB'] },
  { name:'Streptococcus agalactiae',   gram:'+', morpho:'cocci-chains',  shape:'coque · chaînettes',                    freq:'occasionnel', o2:'aéro-anaérobie facultatif', urgence:true,  declaration:false, zoneSlugs:['snc-lcr'], milieux:['Gélose sang'] },
  { name:'Mycobacterium tuberculosis', gram:'+', morpho:'rod-bar',       shape:'bacille · isolés, BAAR',                freq:'rare',        o2:'aérobie strict',            urgence:true,  declaration:true,  zoneSlugs:['snc-lcr'], bsl3:true, milieux:['Löwenstein-Jensen', 'Middlebrook 7H10'] },
  { name:'Cutibacterium acnes',        gram:'+', morpho:'rod',           shape:'bacille · isolés, pléomorphes',         freq:'rare',        o2:'anaérobie strict',          urgence:false, declaration:false, zoneSlugs:['snc-lcr'], milieux:['Gélose sang (anaérobie)'] },
  { name:'Candida albicans',           gram:'F', morpho:'yeast',         shape:'levure · pseudo-hyphes',                freq:'occasionnel', o2:'aéro-anaérobie facultatif', urgence:false, declaration:false, zoneSlugs:['snc-lcr'], milieux:['Sabouraud', 'CHROMagar Candida'] },
]

async function seed() {
  // 1. Insert systems, get back integer IDs indexed by slug
  console.log('Seeding systems…')
  const { data: sysDone, error: e1 } = await supabase
    .from('bacterio_systems')
    .upsert(systemsData, { onConflict: 'slug' })
    .select('id, slug')
  if (e1) { console.error('systems:', e1.message); process.exit(1) }
  const systemIdBySlug = Object.fromEntries(sysDone.map(s => [s.slug, s.id]))
  console.log(`  ✓ ${sysDone.length} systèmes`)

  // 2. Insert zones (resolve system_id from slug), get back integer IDs
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

  // 3. Insert bacteria (resolve zone_ids, map gram + type)
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
