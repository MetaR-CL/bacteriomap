// editorial-admin.jsx — Mode Admin (mot de passe + édition contenu, palette, images)

const ADMIN_PASSWORD = 'admin'; // simple mot de passe par défaut, modifiable depuis l'écran

// Storage helpers (localStorage + JSON export/import)
const ADMIN_KEYS = {
  systemPalettes:  'bm.systemPalettes',
  systemOrder:     'bm.systemOrder',
  systemOverrides: 'bm.systemOverrides',   // { [id]: {label, subtitle, short, ...} }
  customSystems:   'bm.customSystems',     // [{ id, label, subtitle, short, n }] ajoutés
  bacteria:        'bm.bacteria',          // { [name]: {...overrides} }
  customBacteria:  'bm.customBacteria',    // [{ name, gram, morpho, ... }] ajoutées
  subzones:        'bm.subzones',          // { [systemId]: [{id,label,n,...}] }
  quizPool:        'bm.quizPool',          // { [name]: { enabled, hints:[g,m,h,p] } }
  meta:            'bm.meta',              // { atlasTitle, atlasSubtitle, etc }
  password:        'bm.adminPassword',
};

function adminLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEYS[key]) || 'null') ?? fallback; }
  catch (e) { return fallback; }
}
function adminSave(key, value) {
  localStorage.setItem(ADMIN_KEYS[key], JSON.stringify(value));
  window.dispatchEvent(new Event('bm-admin-updated'));
}

function AdminScreen({ navigate }) {
  // Auth state
  const [unlocked, setUnlocked] = React.useState(() => sessionStorage.getItem('bm.adminUnlocked') === '1');
  const [pwInput, setPwInput]   = React.useState('');
  const [pwError, setPwError]   = React.useState('');

  // Tab state
  const [tab, setTab] = React.useState('chapters');

  const tryUnlock = () => {
    const stored = adminLoad('password', ADMIN_PASSWORD);
    if (pwInput === stored) {
      sessionStorage.setItem('bm.adminUnlocked', '1');
      setUnlocked(true);
      setPwError('');
    } else {
      setPwError('Mot de passe incorrect.');
    }
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, background:T.bg }}>
        <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
          <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('home')}>← TABLE DES MATIÈRES</span>
          <span style={{ flex:1 }}/>
          <span>Admin · accès restreint</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          <div style={{ maxWidth:420, width:'100%', background:T.paper, border:`0.5px solid ${T.rule}`, padding:'40px 36px' }}>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:T.ocre, marginBottom:6 }}>Annexe administrative</div>
            <h1 style={{ fontFamily:T.serif, fontSize:44, fontWeight:500, letterSpacing:'-0.02em', lineHeight:1, fontStyle:'italic', margin:0 }}>
              Atelier
            </h1>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, marginTop:14, lineHeight:1.5 }}>
              L'accès aux outils d'édition est protégé. Indiquez votre mot de passe.
            </div>
            <div style={{ marginTop:28 }}>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.16em', marginBottom:8 }}>MOT DE PASSE</div>
              <input type="password" value={pwInput} onChange={e=>setPwInput(e.target.value)}
                     onKeyDown={e=>{ if (e.key==='Enter') tryUnlock(); }}
                     autoFocus
                     style={{ width:'100%', padding:'10px 12px', background:T.bg, border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:14, color:T.ink, outline:'none' }}/>
              {pwError && <div style={{ fontFamily:T.mono, fontSize:10, color:T.red, marginTop:8, letterSpacing:'0.06em' }}>{pwError}</div>}
              <button onClick={tryUnlock} style={{ marginTop:14, width:'100%', padding:'12px 18px', background:T.ink, color:T.paper, border:'none', fontFamily:T.mono, fontSize:11, letterSpacing:'0.16em', cursor:'pointer' }}>
                ENTRER
              </button>
              <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink3, marginTop:14, lineHeight:1.5 }}>
                Mot de passe par défaut : <code style={{ fontFamily:T.mono, fontSize:11, color:T.ink2 }}>admin</code>. Vous pourrez le changer une fois entré.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Locked → unlocked: render admin tabs
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, background:T.bg }}>
      {/* Header */}
      <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={()=>navigate('home')}>← TABLE DES MATIÈRES</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>Atelier · session ouverte</span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span style={{ cursor:'pointer', color:T.red }} onClick={()=>{ sessionStorage.removeItem('bm.adminUnlocked'); setUnlocked(false); }}>VERROUILLER</span>
      </div>

      {/* Title */}
      <div style={{ padding:'34px 56px 22px', borderBottom:`1.5px double ${T.rule}`, background:T.paper, display:'flex', alignItems:'flex-end', gap:24 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:16, color:T.ocre, marginBottom:4 }}>Annexe administrative</div>
          <h1 style={{ fontFamily:T.serif, fontSize:64, fontWeight:500, letterSpacing:'-0.025em', lineHeight:0.95, fontStyle:'italic', margin:0 }}>
            Atelier
          </h1>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, marginTop:8, maxWidth:700, lineHeight:1.5 }}>
            Réglages, contenu, palette et médias. Toute modification est conservée localement et peut être exportée.
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <ExportButton/>
          <ImportButton/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding:'0 56px', background:T.paper, borderBottom:`1px solid ${T.rule}`, display:'flex', gap:0, flexWrap:'wrap' }}>
        {[
          ['chapters', 'Chapitres & sous-zones'],
          ['bacteria', 'Bactéries & fiches'],
          ['quiz',     'Quiz « Qui suis-je »'],
          ['palette',  'Couleurs par système'],
          ['images',   'Images'],
          ['meta',     'Identité de l\'atlas'],
          ['settings', 'Paramètres'],
        ].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:'14px 0', marginRight:32, background:'transparent', border:'none',
            borderBottom: tab===k ? `2px solid ${T.ocre}` : '2px solid transparent',
            color: tab===k ? T.ink : T.ink3,
            fontFamily: tab===k ? T.serif : T.mono,
            fontSize: tab===k ? 15 : 11,
            fontStyle: tab===k ? 'italic' : 'normal',
            letterSpacing: tab===k ? 0 : '0.12em',
            cursor:'pointer',
          }}>{tab===k ? l : l.toUpperCase()}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex:1, padding:'40px 56px 56px', maxWidth:1400, margin:'0 auto', width:'100%' }}>
        {tab === 'chapters' && <ChaptersEditor/>}
        {tab === 'bacteria' && <BacteriaEditor/>}
        {tab === 'quiz'     && <QuizEditor/>}
        {tab === 'palette'  && <PaletteEditor/>}
        {tab === 'images'   && <ImagesEditor/>}
        {tab === 'meta'     && <MetaEditor/>}
        {tab === 'settings' && <SettingsEditor/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// PALETTE EDITOR
function PaletteEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const overrides = adminLoad('systemPalettes', {});

  const setColor = (sysId, key, value) => {
    const next = { ...overrides, [sysId]: { ...overrides[sysId], [key]: value } };
    adminSave('systemPalettes', next);
    force();
  };
  const resetSystem = (sysId) => {
    const next = { ...overrides };
    delete next[sysId];
    adminSave('systemPalettes', next);
    force();
  };
  const resetAll = () => {
    if (!confirm('Réinitialiser toutes les couleurs ?')) return;
    adminSave('systemPalettes', {});
    force();
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Palette par système</h2>
        <span style={{ flex:1 }}/>
        <button onClick={resetAll} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.1em', color:T.ink2, cursor:'pointer' }}>
          TOUT RÉINITIALISER
        </button>
      </div>
      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink2, marginBottom:24, maxWidth:720, lineHeight:1.55 }}>
        Chaque système a sa propre couleur d'accent qui se propage dans la mise en page (filets, en-têtes, planches). Modifie l'<i>accent</i>, la <i>teinte</i> de fond ou le <i>profond</i> au survol.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
        {SYSTEMS.map(sys => {
          const p = window.getSystemPalette(sys.id);
          const isCustom = !!overrides[sys.id];
          return (
            <div key={sys.id} style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'18px 20px', position:'relative', borderLeft:`4px solid ${p.accent}` }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:500, letterSpacing:'-0.01em' }}>{sys.label}</div>
                  <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.1em', marginTop:2 }}>{p.name?.toUpperCase()}</div>
                </div>
                {isCustom && (
                  <button onClick={()=>resetSystem(sys.id)} style={{ padding:'3px 8px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', cursor:'pointer' }}>
                    RÉINIT.
                  </button>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                {[['accent','Accent'],['tint','Teinte'],['deep','Profond']].map(([k,l])=>(
                  <ColorField key={k} label={l} value={p[k]} onChange={v=>setColor(sys.id, k, v)}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  const [local, setLocal] = React.useState(value);
  React.useEffect(()=>setLocal(value), [value]);
  return (
    <div>
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:5 }}>{label.toUpperCase()}</div>
      <div style={{ display:'flex', gap:6, alignItems:'center', border:`1px solid ${T.rule}`, padding:'4px 6px 4px 4px', background:T.bg }}>
        <input type="color" value={local} onChange={e=>{ setLocal(e.target.value); onChange(e.target.value); }}
               style={{ width:30, height:26, border:'none', padding:0, background:'transparent', cursor:'pointer' }}/>
        <input type="text" value={local} onChange={e=>setLocal(e.target.value)}
               onBlur={()=>onChange(local)}
               onKeyDown={e=>{ if (e.key==='Enter') onChange(local); }}
               style={{ flex:1, border:'none', background:'transparent', fontFamily:T.mono, fontSize:11, color:T.ink2, outline:'none', minWidth:0 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// CHAPTERS EDITOR
function ChaptersEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const order      = adminLoad('systemOrder', SYSTEMS.map(s=>s.id));
  const sysOver    = adminLoad('systemOverrides', {});
  const customSys  = adminLoad('customSystems', []);
  const subzones   = adminLoad('subzones', {});

  // Effective system list (built-in + custom)
  const allSys = React.useMemo(() => {
    const base = SYSTEMS.map(s => ({ ...s, _kind:'built-in' }));
    const cus  = customSys.map(s => ({ ...s, _kind:'custom' }));
    return [...base, ...cus];
  }, [customSys]);

  // Resolve label/subtitle/short with overrides applied
  const effSys = (id) => {
    const base = allSys.find(s => s.id === id);
    if (!base) return null;
    const ov = sysOver[id] || {};
    return { ...base, ...ov };
  };

  const [activeSys, setActiveSys] = React.useState(allSys[2]?.id || allSys[0]?.id);

  // ── chapter actions ───────────────────────────────
  const move = (sysId, dir) => {
    const idx = order.indexOf(sysId);
    if (idx < 0) return;
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= order.length) return;
    const next = [...order];
    [next[idx], next[tgt]] = [next[tgt], next[idx]];
    adminSave('systemOrder', next);
    force();
  };
  const addChapter = () => {
    const id = 'sys-' + Date.now().toString(36);
    const nb = customSys.length + 1;
    const nu = [...customSys, { id, label:'Nouveau chapitre', subtitle:'sous-titre éditorial', short:'NEW'+nb, n:0 }];
    adminSave('customSystems', nu);
    adminSave('systemOrder', [...order, id]);
    setActiveSys(id);
    force();
  };
  const duplicateChapter = (sysId) => {
    const src = effSys(sysId);
    if (!src) return;
    const id = 'sys-' + Date.now().toString(36);
    const nu = [...customSys, { id, label:src.label + ' (copie)', subtitle:src.subtitle, short:(src.short||'NEW')+'\''.repeat(1), n:src.n }];
    adminSave('customSystems', nu);
    const idx = order.indexOf(sysId);
    const ord = [...order]; ord.splice(idx+1, 0, id);
    adminSave('systemOrder', ord);
    // dupliquer aussi les sous-zones
    if (subzones[sysId]) adminSave('subzones', { ...subzones, [id]: JSON.parse(JSON.stringify(subzones[sysId])) });
    setActiveSys(id);
    force();
  };
  const deleteChapter = (sysId) => {
    const sys = allSys.find(s => s.id === sysId);
    if (!sys) return;
    if (sys._kind === 'built-in') {
      if (!confirm('Masquer ce chapitre intégré ? (les données seront conservées et restaurables)')) return;
      const ov = { ...sysOver, [sysId]: { ...sysOver[sysId], hidden:true } };
      adminSave('systemOverrides', ov);
    } else {
      if (!confirm('Supprimer définitivement « '+sys.label+' » et toutes ses sous-zones ?')) return;
      adminSave('customSystems', customSys.filter(s => s.id !== sysId));
      adminSave('systemOrder', order.filter(id => id !== sysId));
      const nz = { ...subzones }; delete nz[sysId]; adminSave('subzones', nz);
    }
    force();
  };
  const setSysField = (sysId, key, val) => {
    adminSave('systemOverrides', { ...sysOver, [sysId]: { ...sysOver[sysId], [key]:val } });
    force();
  };
  const restoreChapter = (sysId) => {
    const ov = { ...sysOver };
    if (ov[sysId]) { delete ov[sysId].hidden; if (!Object.keys(ov[sysId]).length) delete ov[sysId]; }
    adminSave('systemOverrides', ov);
    force();
  };

  // ── sous-zones ────────────────────────────────────
  const sysSubs = subzones[activeSys] || (activeSys === 'orl' ? (window.ORL_SUBS_DETAIL || []).map(s=>({ id:s.id, label:s.label, n:s.n, descr:s.descr })) : []);
  const setSysSubs = (next) => { adminSave('subzones', { ...subzones, [activeSys]: next }); force(); };
  const addSub = () => setSysSubs([...sysSubs, { id:'z'+Date.now().toString(36), label:'Nouvelle sous-zone', n:0, descr:'' }]);
  const dupSub = (i) => { const c = {...sysSubs[i], id:'z'+Date.now().toString(36), label:sysSubs[i].label+' (copie)'}; const nx=[...sysSubs]; nx.splice(i+1,0,c); setSysSubs(nx); };
  const updateSub = (i, patch) => setSysSubs(sysSubs.map((s,j)=> j===i ? {...s, ...patch} : s));
  const removeSub = (i) => { if (!confirm('Supprimer cette sous-zone ?')) return; setSysSubs(sysSubs.filter((_,j)=>j!==i)); };
  const moveSub = (i, dir) => { const tgt = i + dir; if (tgt < 0 || tgt >= sysSubs.length) return; const next = [...sysSubs]; [next[i], next[tgt]] = [next[tgt], next[i]]; setSysSubs(next); };

  const active = effSys(activeSys);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:32 }}>
      {/* COLONNE GAUCHE — liste chapitres */}
      <div>
        <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
          <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>Chapitres</h2>
          <span style={{ flex:1 }}/>
          <button onClick={addChapter} style={primaryBtn}>+ NOUVEAU</button>
        </div>
        <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ink3, marginBottom:12, lineHeight:1.5 }}>
          Réorganiser, dupliquer, masquer ou ajouter de nouveaux chapitres.
        </div>
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
          {order.map((sysId, idx) => {
            const sys = effSys(sysId);
            if (!sys) return null;
            const p = window.getSystemPalette(sys.id);
            const hidden = sys.hidden;
            const isCustom = sys._kind === 'custom';
            const sel = activeSys === sysId;
            return (
              <div key={sysId} onClick={()=>setActiveSys(sysId)} style={{
                padding:'12px 14px 12px 14px',
                borderBottom: idx < order.length-1 ? `1px solid ${T.ruleSoft}` : 'none',
                display:'grid', gridTemplateColumns:'10px 1fr auto', gap:12, alignItems:'center',
                cursor:'pointer',
                background: sel ? p.tint : 'transparent',
                opacity: hidden ? 0.4 : 1,
                borderLeft: sel ? `3px solid ${p.accent}` : '3px solid transparent',
              }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:p.accent }}/>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500, lineHeight:1.2, color:T.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {sys.label}
                    {isCustom && <span style={{ fontFamily:T.mono, fontSize:9, color:p.accent, letterSpacing:'0.1em', marginLeft:8 }}>NOUV.</span>}
                    {hidden && <span style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginLeft:8 }}>MASQUÉ</span>}
                  </div>
                  <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.08em' }}>{(sys.short||'').toUpperCase()} · {sys.n||0} bact.</div>
                </div>
                <div style={{ display:'flex', gap:3 }} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>move(sysId,-1)} style={arrowBtn} title="Monter">↑</button>
                  <button onClick={()=>move(sysId,+1)} style={arrowBtn} title="Descendre">↓</button>
                  <button onClick={()=>duplicateChapter(sysId)} style={arrowBtn} title="Dupliquer">⎘</button>
                  {hidden
                    ? <button onClick={()=>restoreChapter(sysId)} style={{...arrowBtn, color:T.green}} title="Restaurer">↺</button>
                    : <button onClick={()=>deleteChapter(sysId)} style={{...arrowBtn, color:T.red}} title="Supprimer">×</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLONNE DROITE — édition du chapitre actif */}
      <div>
        {active ? (
          <>
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
              <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>Détails du chapitre</h2>
            </div>
            <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'22px 26px', marginBottom:24 }}>
              <Field label="Titre">
                <input type="text" value={active.label||''} onChange={e=>setSysField(activeSys,'label',e.target.value)} style={inpStyle}/>
              </Field>
              <Field label="Sous-titre éditorial" hint="Phrase qui apparaît sous le titre">
                <input type="text" value={active.subtitle||''} onChange={e=>setSysField(activeSys,'subtitle',e.target.value)} style={inpStyle}/>
              </Field>
              <Field label="Étiquette courte" hint="Tag affiché à l'accueil (ex. ORL, SNC)">
                <input type="text" value={active.short||''} onChange={e=>setSysField(activeSys,'short',e.target.value)} style={{...inpStyle, maxWidth:140, fontFamily:T.mono, textTransform:'uppercase'}}/>
              </Field>
            </div>

            {/* Sous-zones */}
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
              <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>
                Sous-zones
                <span style={{ color:T.ink3, fontStyle:'normal', fontSize:12, fontFamily:T.mono, letterSpacing:'0.1em', marginLeft:10 }}>· {(active.short||'').toUpperCase()}</span>
              </h2>
              <span style={{ flex:1 }}/>
              <button onClick={addSub} style={primaryBtn}>+ AJOUTER</button>
            </div>
            {sysSubs.length === 0 ? (
              <div style={{ background:T.paper, border:`0.5px dashed ${T.rule}`, padding:'30px 20px', textAlign:'center', fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>
                Aucune sous-zone. Cliquer + AJOUTER.
              </div>
            ) : (
              <div style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
                {sysSubs.map((s, i) => (
                  <div key={s.id} style={{ padding:'14px 16px', borderBottom: i < sysSubs.length-1 ? `1px solid ${T.ruleSoft}` : 'none' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 80px auto', gap:10, alignItems:'center' }}>
                      <input type="text" value={s.label} onChange={e=>updateSub(i, {label:e.target.value})}
                             style={{ border:'none', background:'transparent', fontFamily:T.serif, fontSize:16, fontWeight:500, color:T.ink, outline:'none' }}/>
                      <input type="number" value={s.n||0} onChange={e=>updateSub(i, {n:parseInt(e.target.value)||0})}
                             style={{ border:`1px solid ${T.rule}`, background:T.bg, padding:'4px 8px', fontFamily:T.mono, fontSize:11, color:T.ink2, width:60, textAlign:'right' }} title="Nb bactéries"/>
                      <div style={{ display:'flex', gap:3 }}>
                        <button onClick={()=>moveSub(i,-1)} style={arrowBtn}>↑</button>
                        <button onClick={()=>moveSub(i,+1)} style={arrowBtn}>↓</button>
                        <button onClick={()=>dupSub(i)}    style={arrowBtn} title="Dupliquer">⎘</button>
                        <button onClick={()=>removeSub(i)} style={{ ...arrowBtn, color:T.red }}>×</button>
                      </div>
                    </div>
                    <input type="text" placeholder="Description (optionnel)" value={s.descr||''} onChange={e=>updateSub(i, {descr:e.target.value})}
                           style={{ marginTop:6, width:'100%', border:'none', background:'transparent', fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ink3, outline:'none' }}/>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40, textAlign:'center' }}>
            Sélectionner un chapitre.
          </div>
        )}
      </div>
    </div>
  );
}

const arrowBtn = {
  width:26, height:26, padding:0, border:'1px solid var(--rule)', background:'var(--paper)',
  fontFamily:'inherit', fontSize:12, color:'var(--ink2)', cursor:'pointer',
};
const primaryBtn = {
  padding:'5px 12px', background:'var(--ocre)', color:'var(--paper)', border:'none',
  fontFamily:'"IBM Plex Mono", monospace', fontSize:10, letterSpacing:'0.1em', cursor:'pointer',
};
const ghostBtn = {
  padding:'5px 12px', background:'transparent', border:'1px solid var(--rule)',
  fontFamily:'"IBM Plex Mono", monospace', fontSize:10, letterSpacing:'0.1em', color:'var(--ink2)', cursor:'pointer',
};

// ─────────────────────────────────────────────────
// BACTERIA EDITOR
function BacteriaEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const overrides = adminLoad('bacteria', {});
  const custom    = adminLoad('customBacteria', []);
  const [selected, setSelected] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [gramFilter, setGramFilter] = React.useState('all');

  // built-in (canon) + custom (added by admin)
  const allBact = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    [...LCR_PATHO, ...(window.ORL_PATHO || []), ...(window.ORL_FLORA || [])].forEach(b => {
      if (seen.has(b.name)) return;
      seen.add(b.name); out.push({ ...b, _kind:'built-in' });
    });
    custom.forEach(b => { if (!seen.has(b.name)) { seen.add(b.name); out.push({ ...b, _kind:'custom' }); } });
    return out;
  }, [custom]);

  const filtered = allBact.filter(b => {
    if (gramFilter !== 'all' && b.gram !== gramFilter) return false;
    return b.name.toLowerCase().includes(search.toLowerCase());
  });
  const current = selected || filtered[0];
  const ov = current ? (overrides[current.name] || {}) : {};
  const isCustom = current?._kind === 'custom';

  const merge = (patch) => {
    if (!current) return;
    if (isCustom) {
      adminSave('customBacteria', custom.map(b => b.name === current.name ? { ...b, ...patch } : b));
      setSelected({ ...current, ...patch });
    } else {
      adminSave('bacteria', { ...overrides, [current.name]: { ...ov, ...patch } });
    }
    force();
  };
  const resetBact = () => {
    if (!current) return;
    if (!confirm('Réinitialiser les modifications de '+current.name+' ?')) return;
    const next = { ...overrides }; delete next[current.name];
    adminSave('bacteria', next); force();
  };
  const addBact = () => {
    const base = { name:'Nouvelle bactérie '+(custom.length+1), gram:'+', morpho:'cocci-cluster', shape:'cocci en amas', freq:'fréquent', o2:'aéro-anaérobie facultative', urgence:false, declaration:false, clinique:'', antibio:'', identif:'' };
    adminSave('customBacteria', [...custom, base]);
    setSelected({ ...base, _kind:'custom' });
    force();
  };
  const duplicateBact = () => {
    if (!current) return;
    const src = { ...current, ...ov };
    const cp = { ...src, name: current.name + ' (copie)', _kind:undefined };
    adminSave('customBacteria', [...custom, cp]);
    setSelected({ ...cp, _kind:'custom' });
    force();
  };
  const deleteBact = () => {
    if (!current) return;
    if (current._kind === 'built-in') {
      if (!confirm('Masquer « '+current.name+' » du catalogue ? (réversible)')) return;
      adminSave('bacteria', { ...overrides, [current.name]: { ...ov, hidden:true } });
    } else {
      if (!confirm('Supprimer définitivement « '+current.name+' » ?')) return;
      adminSave('customBacteria', custom.filter(b => b.name !== current.name));
      setSelected(null);
    }
    force();
  };

  // Effective values (override or original)
  const eff = (k) => ov[k] !== undefined ? ov[k] : current?.[k];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:32 }}>
      {/* List */}
      <div>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
          <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>Bactéries</h2>
          <span style={{ flex:1 }}/>
          <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.1em' }}>{filtered.length}/{allBact.length}</span>
        </div>

        <button onClick={addBact} style={{...primaryBtn, width:'100%', padding:'9px 12px', fontSize:11, marginBottom:10 }}>+ NOUVELLE BACTÉRIE</button>

        <input type="text" placeholder="Rechercher par nom…" value={search} onChange={e=>setSearch(e.target.value)}
               style={{ width:'100%', padding:'8px 12px', background:T.bg, border:`1px solid ${T.rule}`, fontFamily:T.serif, fontSize:14, color:T.ink, outline:'none', marginBottom:8, boxSizing:'border-box' }}/>

        <div style={{ display:'flex', gap:3, marginBottom:10, fontFamily:T.mono, fontSize:9, letterSpacing:'0.06em' }}>
          {[['all','TOUS'],['+','G+'],['−','G−'],['F','F']].map(([k,l])=>(
            <button key={k} onClick={()=>setGramFilter(k)} style={{
              flex:1, padding:'5px 0',
              background: gramFilter===k ? T.ink : T.paper, color: gramFilter===k ? T.paper : T.ink3,
              border:`1px solid ${gramFilter===k ? T.ink : T.rule}`, cursor:'pointer', fontFamily:T.mono, fontSize:9,
            }}>{l}</button>
          ))}
        </div>

        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, maxHeight:520, overflowY:'auto' }}>
          {filtered.map((b,i) => {
            const c = window.gramColor(b.gram);
            const isMod = !!overrides[b.name];
            const hidden = overrides[b.name]?.hidden;
            const isSel = current && current.name === b.name;
            return (
              <div key={b.name} onClick={()=>setSelected(b)} style={{
                padding:'10px 14px', borderBottom: i < filtered.length-1 ? `1px solid ${T.ruleSoft}` : 'none',
                cursor:'pointer',
                background: isSel ? T.bgSoft : 'transparent',
                borderLeft: isSel ? `3px solid ${c.stroke}` : '3px solid transparent',
                display:'flex', alignItems:'center', gap:10,
                opacity: hidden ? 0.4 : 1,
              }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c.stroke, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, fontWeight:500, color:T.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {b.name}
                  </div>
                </div>
                {b._kind === 'custom' && <span style={{ fontFamily:T.mono, fontSize:8, color:T.green, letterSpacing:'0.1em' }}>NOUV.</span>}
                {isMod && !hidden && b._kind !== 'custom' && <span style={{ fontFamily:T.mono, fontSize:8, color:T.ocre, letterSpacing:'0.1em' }}>MOD</span>}
                {hidden && <span style={{ fontFamily:T.mono, fontSize:8, color:T.ink3, letterSpacing:'0.1em' }}>MASQ.</span>}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding:30, textAlign:'center', fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Aucun résultat.</div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div>
        {current ? (
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
              <h2 style={{ fontFamily:T.serif, fontSize:28, fontWeight:500, fontStyle:'italic', margin:0 }}>
                {current.name}
                {current._kind === 'custom' && <span style={{ fontFamily:T.mono, fontSize:11, color:T.green, letterSpacing:'0.12em', fontStyle:'normal', marginLeft:14 }}>NOUVELLE</span>}
              </h2>
              <span style={{ flex:1 }}/>
              <button onClick={duplicateBact} style={ghostBtn}>⎘ DUPLIQUER</button>
              {!!overrides[current.name] && current._kind !== 'custom' && (
                <button onClick={resetBact} style={ghostBtn}>↺ RÉINIT.</button>
              )}
              <button onClick={deleteBact} style={{ ...ghostBtn, color:T.red, borderColor:T.red }}>× {current._kind === 'custom' ? 'SUPPRIMER' : 'MASQUER'}</button>
            </div>

            <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'24px 28px' }}>
              {/* Identité */}
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.16em', marginBottom:10 }}>IDENTITÉ</div>
              {current._kind === 'custom' && (
                <Field label="Nom"><input type="text" value={current.name} onChange={e=>merge({name:e.target.value})} style={{ ...inpStyle, fontStyle:'italic' }}/></Field>
              )}
              <Field label="Coloration de Gram" hint="+ / − / F (fongique)">
                <select value={eff('gram')||'+'} onChange={e=>merge({gram:e.target.value})} style={selStyle}>
                  <option value="+">+ (Gram positif)</option>
                  <option value="−">− (Gram négatif)</option>
                  <option value="F">F (fongique)</option>
                </select>
              </Field>
              <Field label="Morphologie">
                <select value={eff('morpho')||'cocci-cluster'} onChange={e=>merge({morpho:e.target.value})} style={selStyle}>
                  {[['cocci-pairs','Cocci en paires'],['cocci-chains','Cocci en chaînettes'],['cocci-cluster','Cocci en amas'],['rod','Bacille'],['rod-bar','Bacille (forme courte)'],['coccobacillus','Coccobacille'],['yeast','Levure']].map(([k,l])=>(
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description morphologique" hint="Phrase libre affichée sur la planche"><input type="text" value={eff('shape')||''} onChange={e=>merge({shape:e.target.value})} style={inpStyle}/></Field>
              <Field label="Fréquence">
                <select value={eff('freq')||'fréquent'} onChange={e=>merge({freq:e.target.value})} style={selStyle}>
                  {['très fréquent','fréquent','occasionnel','rare','habituelle'].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Atmosphère / O₂"><input type="text" value={eff('o2')||''} onChange={e=>merge({o2:e.target.value})} style={inpStyle}/></Field>
              <Field label="Drapeaux">
                <div style={{ display:'flex', gap:18, alignItems:'center', paddingTop:6 }}>
                  <label style={chkLbl}><input type="checkbox" checked={!!eff('urgence')} onChange={e=>merge({urgence:e.target.checked})}/> Urgence clinique †</label>
                  <label style={chkLbl}><input type="checkbox" checked={!!eff('declaration')} onChange={e=>merge({declaration:e.target.checked})}/> Déclaration obligatoire</label>
                </div>
              </Field>

              {/* Fiche détaillée */}
              <div style={{ borderTop:`1px solid ${T.ruleSoft}`, marginTop:18, paddingTop:18 }}>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.16em', marginBottom:14 }}>FICHE DÉTAILLÉE</div>
                <Field label="Description clinique" wide>
                  <textarea value={eff('clinique')||''} onChange={e=>merge({clinique:e.target.value})}
                            rows={3} style={{ ...inpStyle, fontFamily:T.serif, lineHeight:1.5, resize:'vertical' }}/>
                </Field>
                <Field label="Antibiogramme — résumé" wide>
                  <textarea value={eff('antibio')||''} onChange={e=>merge({antibio:e.target.value})}
                            rows={3} style={{ ...inpStyle, fontFamily:T.serif, lineHeight:1.5, resize:'vertical' }}/>
                </Field>
                <Field label="Identification au laboratoire" wide>
                  <textarea value={eff('identif')||''} onChange={e=>merge({identif:e.target.value})}
                            rows={2} style={{ ...inpStyle, fontFamily:T.serif, lineHeight:1.5, resize:'vertical' }}/>
                </Field>
                <Field label="Habitat / réservoir" wide>
                  <input type="text" value={eff('habitat')||''} onChange={e=>merge({habitat:e.target.value})} placeholder="ex. flore commensale de l'oropharynx" style={inpStyle}/>
                </Field>
                <Field label="Transmission" wide>
                  <input type="text" value={eff('transmission')||''} onChange={e=>merge({transmission:e.target.value})} placeholder="ex. gouttelettes respiratoires" style={inpStyle}/>
                </Field>
              </div>

              {/* Quiz — indices */}
              <div style={{ borderTop:`1px solid ${T.ruleSoft}`, marginTop:18, paddingTop:18 }}>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ocre, letterSpacing:'0.16em', marginBottom:14 }}>QUIZ « QUI SUIS-JE ? » — INDICES</div>
                <Field label="Indice 1 — Gram" wide>
                  <input type="text" value={eff('hint1')||''} onChange={e=>merge({hint1:e.target.value})} placeholder="ex. Gram positif, en grappes" style={inpStyle}/>
                </Field>
                <Field label="Indice 2 — Morphologie" wide>
                  <input type="text" value={eff('hint2')||''} onChange={e=>merge({hint2:e.target.value})} placeholder="ex. cocci, catalase +, coagulase +" style={inpStyle}/>
                </Field>
                <Field label="Indice 3 — Habitat" wide>
                  <input type="text" value={eff('hint3')||''} onChange={e=>merge({hint3:e.target.value})} placeholder="ex. flore cutanée et nasale" style={inpStyle}/>
                </Field>
                <Field label="Indice 4 — Pathologie" wide>
                  <input type="text" value={eff('hint4')||''} onChange={e=>merge({hint4:e.target.value})} placeholder="ex. infections cutanées, endocardites" style={inpStyle}/>
                </Field>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40, textAlign:'center' }}>
            Sélectionner une bactérie dans la liste, ou cliquer <strong style={{ color:T.ocre }}>+ NOUVELLE BACTÉRIE</strong>.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// QUIZ EDITOR — pool & question pacing
function QuizEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const pool = adminLoad('quizPool', {});
  const allBact = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    [...LCR_PATHO, ...(window.ORL_PATHO || []), ...(window.ORL_FLORA || [])].forEach(b => {
      if (seen.has(b.name)) return; seen.add(b.name); out.push(b);
    });
    adminLoad('customBacteria', []).forEach(b => { if (!seen.has(b.name)) { seen.add(b.name); out.push(b); } });
    return out;
  }, []);

  const isOn = (name) => pool[name]?.enabled !== false; // default ON
  const toggle = (name) => { adminSave('quizPool', { ...pool, [name]: { ...pool[name], enabled: !isOn(name) } }); force(); };
  const allOn  = () => { const nx = {}; allBact.forEach(b => nx[b.name] = { enabled:true }); adminSave('quizPool', nx); force(); };
  const allOff = () => { const nx = {}; allBact.forEach(b => nx[b.name] = { enabled:false }); adminSave('quizPool', nx); force(); };

  const onCount = allBact.filter(b => isOn(b.name)).length;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Pool du quiz</h2>
        <span style={{ flex:1 }}/>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink2, letterSpacing:'0.12em' }}>{onCount} / {allBact.length} ACTIVES</span>
        <button onClick={allOn}  style={ghostBtn}>TOUT ACTIVER</button>
        <button onClick={allOff} style={ghostBtn}>TOUT DÉSACTIVER</button>
      </div>
      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink2, marginBottom:24, maxWidth:760, lineHeight:1.55 }}>
        Coche/décoche les bactéries du tirage. Les indices (Gram → morpho → habitat → pathologie) sont édités dans <strong>Bactéries & fiches</strong> avec le reste de la fiche.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
        {allBact.map(b => {
          const c = window.gramColor(b.gram);
          const on = isOn(b.name);
          return (
            <label key={b.name} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              background:T.paper, border:`0.5px solid ${T.rule}`, cursor:'pointer',
              borderLeft:`3px solid ${on ? c.stroke : T.ruleSoft}`,
              opacity: on ? 1 : 0.55,
            }}>
              <input type="checkbox" checked={on} onChange={()=>toggle(b.name)} style={{ accentColor:T.ocre }}/>
              <span style={{ width:8, height:8, borderRadius:'50%', background:c.stroke, flexShrink:0 }}/>
              <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, fontWeight:500, color:T.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// META EDITOR — atlas-wide labels
function MetaEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const meta = adminLoad('meta', {});
  const set = (k,v) => { adminSave('meta', { ...meta, [k]:v }); force(); };
  const reset = () => { if (!confirm('Réinitialiser ?')) return; adminSave('meta', {}); force(); };

  return (
    <div style={{ maxWidth:760 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Identité de l'atlas</h2>
        <span style={{ flex:1 }}/>
        <button onClick={reset} style={ghostBtn}>RÉINIT.</button>
      </div>
      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink2, marginBottom:24, lineHeight:1.55 }}>
        Textes affichés sur la page d'accueil et l'ours.
      </div>

      <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'24px 28px' }}>
        <Field label="Titre de l'atlas" hint="affiché en grand sur l'accueil"><input type="text" value={meta.title||'Bacteriomap'} onChange={e=>set('title',e.target.value)} style={inpStyle}/></Field>
        <Field label="Surtitre"><input type="text" value={meta.kicker||'Atlas de microbiologie clinique'} onChange={e=>set('kicker',e.target.value)} style={inpStyle}/></Field>
        <Field label="Sous-titre éditorial" wide>
          <textarea value={meta.subtitle||"Un atlas par site anatomique — pathogènes, commensaux, antibiogrammes. Pensé pour la pratique au laboratoire, lu comme un livre."} onChange={e=>set('subtitle',e.target.value)} rows={3} style={{ ...inpStyle, fontFamily:T.serif, lineHeight:1.5, resize:'vertical' }}/>
        </Field>
        <Field label="Auteur·trice / éditeur·trice"><input type="text" value={meta.author||''} placeholder="ex. Dr. Untel · Laboratoire X" onChange={e=>set('author',e.target.value)} style={inpStyle}/></Field>
        <Field label="Édition / millésime"><input type="text" value={meta.edition||'Édition 2026'} onChange={e=>set('edition',e.target.value)} style={{ ...inpStyle, maxWidth:240 }}/></Field>
        <Field label="Note de bas de page (ours)" wide>
          <textarea value={meta.colophon||''} placeholder="ex. Imprimé en France · BACTÉRIOMAP · v1.0" onChange={e=>set('colophon',e.target.value)} rows={2} style={{ ...inpStyle, fontFamily:T.serif, lineHeight:1.5, resize:'vertical' }}/>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, hint, wide, children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr' : '180px 1fr', gap: wide ? 6 : 16, alignItems:'baseline', padding:'10px 0', borderBottom:`1px dotted var(--ruleSoft)` }}>
      <div>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink2, letterSpacing:'0.08em' }}>{label}</div>
        {hint && <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:T.ink3 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
const inpStyle = { width:'100%', padding:'8px 10px', background:'var(--bg)', border:`1px solid var(--rule)`, fontFamily:'"Newsreader", serif', fontSize:14, color:'var(--ink)', outline:'none' };
const selStyle = { ...inpStyle, fontFamily:'"IBM Plex Mono", monospace', fontSize:12 };
const chkLbl = { fontFamily:'"Newsreader", serif', fontSize:14, color:'var(--ink2)', display:'flex', alignItems:'center', gap:6, cursor:'pointer' };

// ─────────────────────────────────────────────────
// IMAGES EDITOR
function ImagesEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const allBact = React.useMemo(() => {
    const seen = new Set();
    return [...LCR_PATHO, ...(window.ORL_PATHO || []), ...(window.ORL_FLORA || [])].filter(b => {
      if (seen.has(b.name)) return false;
      seen.add(b.name); return true;
    });
  }, []);

  const onUpload = (name, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { localStorage.setItem('bm-img:' + name, ev.target.result); window.dispatchEvent(new Event('bm-img-updated')); force(); };
    r.readAsDataURL(file);
  };
  const onClear = (name) => { if (!confirm('Retirer l\'image ?')) return; localStorage.removeItem('bm-img:' + name); window.dispatchEvent(new Event('bm-img-updated')); force(); };
  const clearAll = () => { if (!confirm('Supprimer toutes les images téléversées ?')) return; Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k=>localStorage.removeItem(k)); window.dispatchEvent(new Event('bm-img-updated')); force(); };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Images de bactéries</h2>
        <span style={{ flex:1 }}/>
        <button onClick={clearAll} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.1em', color:T.red, cursor:'pointer' }}>
          TOUT SUPPRIMER
        </button>
      </div>
      <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:14, color:T.ink2, marginBottom:24, maxWidth:720, lineHeight:1.55 }}>
        Téléverse une image (microscopie, culture, illustration) pour chaque bactérie. Format JPG/PNG, stockées localement.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
        {allBact.map(b => {
          const img = localStorage.getItem('bm-img:' + b.name);
          const c = window.gramColor(b.gram);
          return (
            <div key={b.name} style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
              <div style={{ height:140, background:T.bgSoft, position:'relative', overflow:'hidden', borderBottom:`0.5px solid ${T.rule}` }}>
                {img ? (
                  <img src={img} alt={b.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg viewBox="0 0 100 100" width={80} height={80}>
                      <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.22} strokeWidth={1.6} vivid={false}/>
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ padding:'10px 12px' }}>
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, fontWeight:500, color:T.ink, lineHeight:1.2, marginBottom:8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={b.name}>
                  {b.name}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <label style={{ flex:1, padding:'5px 8px', background:T.ocre, color:T.paper, fontFamily:T.mono, fontSize:9, letterSpacing:'0.1em', cursor:'pointer', textAlign:'center' }}>
                    {img ? 'REMPLACER' : 'TÉLÉVERSER'}
                    <input type="file" accept="image/*" onChange={e=>onUpload(b.name, e.target.files[0])} style={{ display:'none' }}/>
                  </label>
                  {img && (
                    <button onClick={()=>onClear(b.name)} style={{ width:30, padding:'5px', background:'transparent', border:`1px solid ${T.rule}`, color:T.red, fontFamily:T.mono, fontSize:11, cursor:'pointer' }}>×</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SETTINGS EDITOR
function SettingsEditor() {
  const [pwOld, setPwOld] = React.useState('');
  const [pwNew, setPwNew] = React.useState('');
  const [msg, setMsg]     = React.useState('');

  const changePw = () => {
    const stored = adminLoad('password', ADMIN_PASSWORD);
    if (pwOld !== stored) { setMsg('✗ Ancien mot de passe incorrect.'); return; }
    if (pwNew.length < 3) { setMsg('✗ Trop court (min. 3 caractères).'); return; }
    adminSave('password', pwNew);
    setMsg('✓ Mot de passe modifié.');
    setPwOld(''); setPwNew('');
  };

  const wipeAll = () => {
    if (!confirm('Effacer TOUTES les modifications admin (palette, contenu, images) ? Cette action est irréversible.')) return;
    Object.values(ADMIN_KEYS).forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k=>localStorage.removeItem(k));
    sessionStorage.removeItem('bm.adminUnlocked');
    location.reload();
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
      <div>
        <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:'0 0 14px' }}>Mot de passe</h2>
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'20px 24px' }}>
          <Field label="Ancien"><input type="password" value={pwOld} onChange={e=>setPwOld(e.target.value)} style={inpStyle}/></Field>
          <Field label="Nouveau"><input type="password" value={pwNew} onChange={e=>setPwNew(e.target.value)} style={inpStyle}/></Field>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:14 }}>
            <button onClick={changePw} style={{ padding:'10px 18px', background:T.ink, color:T.paper, border:'none', fontFamily:T.mono, fontSize:11, letterSpacing:'0.12em', cursor:'pointer' }}>METTRE À JOUR</button>
            {msg && <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color: msg[0]==='✓' ? T.green : T.red }}>{msg}</span>}
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:'0 0 14px' }}>Réinitialisation</h2>
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'20px 24px' }}>
          <div style={{ fontFamily:T.serif, fontSize:14, color:T.ink2, lineHeight:1.55, marginBottom:14 }}>
            Efface toutes les modifications administratives (palette, contenu des fiches, images, ordre des chapitres) et restaure les valeurs par défaut.
          </div>
          <button onClick={wipeAll} style={{ padding:'10px 18px', background:T.red, color:T.paper, border:'none', fontFamily:T.mono, fontSize:11, letterSpacing:'0.12em', cursor:'pointer' }}>
            TOUT EFFACER
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// EXPORT / IMPORT
function ExportButton() {
  const onExport = () => {
    const dump = {};
    Object.entries(ADMIN_KEYS).forEach(([k, sk]) => {
      const v = localStorage.getItem(sk);
      if (v) dump[k] = JSON.parse(v);
    });
    // images
    const imgs = {};
    Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k => { imgs[k.slice(7)] = localStorage.getItem(k); });
    if (Object.keys(imgs).length) dump.images = imgs;

    const blob = new Blob([JSON.stringify(dump, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bacteriomap-config.json'; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={onExport} style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.12em', color:T.ink2, cursor:'pointer' }}>
      ⇩ EXPORTER
    </button>
  );
}
function ImportButton() {
  const ref = React.useRef(null);
  const onPick = () => ref.current && ref.current.click();
  const onFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('Importer cette configuration ? Les modifications actuelles seront remplacées.')) return;
        Object.entries(ADMIN_KEYS).forEach(([k, sk]) => {
          if (data[k] !== undefined) localStorage.setItem(sk, JSON.stringify(data[k]));
        });
        if (data.images) {
          Object.entries(data.images).forEach(([name, url]) => localStorage.setItem('bm-img:' + name, url));
        }
        location.reload();
      } catch (err) {
        alert('Fichier invalide.');
      }
    };
    r.readAsText(f);
    e.target.value = '';
  };
  return (
    <>
      <button onClick={onPick} style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.12em', color:T.ink2, cursor:'pointer' }}>
        ⇪ IMPORTER
      </button>
      <input ref={ref} type="file" accept="application/json" onChange={onFile} style={{ display:'none' }}/>
    </>
  );
}

Object.assign(window, { AdminScreen });
