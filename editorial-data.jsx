// editorial-data.jsx — tokens + extended data for the editorial prototype

const T = {
  bg:       'var(--bg)',
  bgSoft:   'var(--bgSoft)',
  paper:    'var(--paper)',
  ink:      'var(--ink)',
  ink2:     'var(--ink2)',
  ink3:     'var(--ink3)',
  rule:     'var(--rule)',
  ruleSoft: 'var(--ruleSoft)',
  ocre:     'var(--accent)',
  red:      'var(--red)',
  green:    'var(--green)',
  blue:     'var(--blue)',
  violet:   'var(--violet)',
  rose:     'var(--rose)',
  qrBg:     'var(--qr-bg)',
  qrInk:    'var(--qr-ink)',
  qrMute:   'var(--qr-mute)',
  qrRule:   'var(--qr-rule)',
  serif:  '"Newsreader", "Times New Roman", Georgia, serif',
  sans:   '"Inter", "Helvetica Neue", Arial, sans-serif',
  mono:   '"IBM Plex Mono", ui-monospace, Consolas, monospace',
};

// Extended bacteria data for ORL zone
const ORL_PATHO = [
  { name:'Streptococcus pyogenes',    gram:'+', morpho:'cocci-chains',   shape:'coque · chaînettes',         freq:'fréquent',    o2:'aéro-anaérobie facultatif', urgence:false, declaration:false },
  { name:'Streptococcus pneumoniae',  gram:'+', morpho:'cocci-pairs',    shape:'coque · diplocoques lancéolés',freq:'fréquent',  o2:'aéro-anaérobie facultatif', urgence:true,  declaration:false },
  { name:'Haemophilus influenzae',    gram:'−', morpho:'coccobacillus',  shape:'coccobacille · pléomorphes', freq:'fréquent',    o2:'aéro-anaérobie facultatif', urgence:false, declaration:false },
  { name:'Moraxella catarrhalis',     gram:'−', morpho:'cocci-pairs',    shape:'coque · diplocoques',        freq:'fréquent',    o2:'aérobie strict',            urgence:false, declaration:false },
  { name:'Staphylococcus aureus',     gram:'+', morpho:'cocci-cluster',  shape:'coque · amas en grappes',    freq:'fréquent',    o2:'aéro-anaérobie facultatif', urgence:true,  declaration:false },
  { name:'Pseudomonas aeruginosa',    gram:'−', morpho:'rod',            shape:'bacille · isolés',            freq:'occasionnel', o2:'aérobie strict',            urgence:true,  declaration:false },
  { name:'Fusobacterium necrophorum', gram:'−', morpho:'rod',            shape:'bacille fusiforme',           freq:'rare',        o2:'anaérobie strict',          urgence:true,  declaration:false },
  { name:'Candida albicans',          gram:'F', morpho:'yeast',          shape:'levure · pseudo-hyphes',     freq:'occasionnel', o2:'aéro-anaérobie facultatif', urgence:false, declaration:false },
  { name:'Streptococcus agalactiae',  gram:'+', morpho:'cocci-chains',   shape:'coque · chaînettes',         freq:'rare',        o2:'aéro-anaérobie facultatif', urgence:false, declaration:false },
];

const ORL_FLORA = [
  { name:'Streptococcus viridans',    gram:'+', morpho:'cocci-chains',   shape:'coque · chaînettes α-hém.',  freq:'habituelle',  o2:'aéro-anaérobie facultatif', urgence:false, declaration:false },
  { name:'Cutibacterium acnes',       gram:'+', morpho:'rod',            shape:'bacille · isolés',            freq:'habituelle',  o2:'anaérobie strict',          urgence:false, declaration:false },
  { name:'Neisseria sp.',             gram:'−', morpho:'cocci-pairs',    shape:'coque · diplocoques',        freq:'habituelle',  o2:'aérobie strict',            urgence:false, declaration:false },
  { name:'Lactobacillus sp.',         gram:'+', morpho:'rod',            shape:'bacille · isolés ou chaînes',freq:'habituelle',  o2:'micro-aérophile',           urgence:false, declaration:false },
];

// Full SPN antibiogramme
const SPN_ANTIBIO = [
  { famille:'Bêta-lactamines',   ab:'Amoxicilline',      cmival:'≤0.06',  statut:'S', note:'1ʳᵉ intention' },
  { famille:'Bêta-lactamines',   ab:'Amoxicilline–Clav.', cmival:'≤0.06', statut:'S', note:'' },
  { famille:'Bêta-lactamines',   ab:'Ceftriaxone',        cmival:'≤0.5',  statut:'S', note:'méningite' },
  { famille:'Bêta-lactamines',   ab:'Pénicilline G',      cmival:'>0.06', statut:'I', note:'selon CMI' },
  { famille:'Macrolides',        ab:'Érythromycine',      cmival:'>0.25', statut:'R', note:'erm / mef' },
  { famille:'Macrolides',        ab:'Azithromycine',      cmival:'>0.25', statut:'R', note:'erm / mef' },
  { famille:'Fluoroquinolones',  ab:'Lévofloxacine',      cmival:'≤2',    statut:'S', note:'' },
  { famille:'Glycopeptides',     ab:'Vancomycine',        cmival:'≤1',    statut:'S', note:'méningite réfractaire' },
  { famille:'Tétracyclines',     ab:'Doxycycline',        cmival:'>1',    statut:'R', note:'' },
  { famille:'Aminosides',        ab:'Gentamicine',        cmival:'≥4',    statut:'R', note:'résistance naturelle' },
];

const ORL_SUBS_DETAIL = [
  { id:'gorge',   label:'Gorge',   n:4, flora:2, descr:'Pharynx, amygdales. Site de prélèvement par écouvillonnage oropharyngé.', patho: ORL_PATHO.slice(0,4), floraList: ORL_FLORA.slice(0,2) },
  { id:'nez',     label:'Nez',     n:2, flora:2, descr:'Fosses nasales, rhinopharynx. Prélèvement par écouvillonnage nasal profond.', patho: ORL_PATHO.slice(0,2), floraList: ORL_FLORA.slice(1,3) },
  { id:'oreille', label:'Oreille', n:5, flora:1, descr:'Oreille externe, conduit auditif, oreille moyenne. Prélèvement par écouvillonnage ou ponction.', patho: ORL_PATHO.slice(0,5), floraList: ORL_FLORA.slice(0,1) },
  { id:'sinus',   label:'Sinus',   n:3, flora:0, descr:'Sinus frontaux, maxillaires, ethmoïdaux. Prélèvement chirurgical ou par ponction.', patho: ORL_PATHO.slice(0,3), floraList: [] },
];

Object.assign(window, { T, ORL_PATHO, ORL_FLORA, ORL_SUBS_DETAIL, SPN_ANTIBIO });
