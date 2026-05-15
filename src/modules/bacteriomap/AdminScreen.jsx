// AdminScreen.jsx — Admin panel (Supabase for bacteria/systems/zones/quiz, localStorage for meta)
import React from 'react';
import { T, ORL_PATHO, ORL_FLORA } from './data.js';
import { LCR_PATHO, gramColor, MorphoSVG, SYSTEM_PALETTES } from './shared.jsx';
import { useAdminBacteria } from '../../hooks/useAdminBacteria.js';
import { useAdminSystems } from '../../hooks/useAdminSystems.js';
import { useQuizAdmin } from '../../hooks/useQuizAdmin.js';

const ADMIN_PASSWORD = 'admin';
const ADMIN_KEYS = {
  quizPool: 'bm.quizPool',
  meta:     'bm.meta',
  password: 'bm.adminPassword',
};
function adminLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEYS[key]) || 'null') ?? fallback; }
  catch (e) { return fallback; }
}
function adminSave(key, value) {
  localStorage.setItem(ADMIN_KEYS[key], JSON.stringify(value));
  window.dispatchEvent(new Event('bm-admin-updated'));
}

// ── Style constants ──────────────────────────────────────────────────────────
const arrowBtn = {
  width:26, height:26, padding:0, border:'1px solid var(--rule)', background:'var(--paper)',
  fontFamily:'inherit', fontSize:12, color:'var(--ink2)', cursor:'pointer', flexShrink:0,
};
const primaryBtn = {
  padding:'5px 12px', background:'var(--accent)', color:'var(--paper)', border:'none',
  fontFamily:'"IBM Plex Mono", monospace', fontSize:10, letterSpacing:'0.1em', cursor:'pointer',
};
const ghostBtn = {
  padding:'5px 12px', background:'transparent', border:'1px solid var(--rule)',
  fontFamily:'"IBM Plex Mono", monospace', fontSize:10, letterSpacing:'0.1em', color:'var(--ink2)', cursor:'pointer',
};
const inpStyle = {
  width:'100%', padding:'8px 10px', background:'var(--bg)', border:'1px solid var(--rule)',
  fontFamily:'"Newsreader", serif', fontSize:14, color:'var(--ink)', outline:'none', boxSizing:'border-box',
};
const selStyle = { ...inpStyle, fontFamily:'"IBM Plex Mono", monospace', fontSize:12 };
const chkLbl = { fontFamily:'"Newsreader", serif', fontSize:14, color:'var(--ink2)', display:'flex', alignItems:'center', gap:6, cursor:'pointer' };
const taStyle = { ...inpStyle, fontFamily:'"Newsreader", serif', lineHeight:1.55, resize:'vertical' };

// ── Shared helper components ─────────────────────────────────────────────────
function Field({ label, hint, wide, children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr' : '180px 1fr', gap: wide ? 6 : 16, alignItems:'baseline', padding:'10px 0', borderBottom:'1px dotted var(--ruleSoft)' }}>
      <div>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink2, letterSpacing:'0.08em' }}>{label}</div>
        {hint && <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:11, color:T.ink3 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  const [local, setLocal] = React.useState(value || '#888888');
  React.useEffect(() => setLocal(value || '#888888'), [value]);
  return (
    <div>
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:5 }}>{label.toUpperCase()}</div>
      <div style={{ display:'flex', gap:6, alignItems:'center', border:`1px solid ${T.rule}`, padding:'4px 6px 4px 4px', background:T.bg }}>
        <input type="color" value={local} onChange={e => { setLocal(e.target.value); onChange(e.target.value); }}
               style={{ width:30, height:26, border:'none', padding:0, background:'transparent', cursor:'pointer' }}/>
        <input type="text" value={local} onChange={e => setLocal(e.target.value)}
               onBlur={() => onChange(local)} onKeyDown={e => { if (e.key === 'Enter') onChange(local); }}
               style={{ flex:1, border:'none', background:'transparent', fontFamily:T.mono, fontSize:11, color:T.ink2, outline:'none', minWidth:0 }}/>
      </div>
    </div>
  );
}

function ErrorBanner({ msg }) {
  if (!msg) return null;
  return <div style={{ padding:'8px 12px', background:'#fde8e8', border:'1px solid #e87070', fontFamily:T.mono, fontSize:11, color:'#c00', marginBottom:12, letterSpacing:'0.04em' }}>✗ {msg}</div>;
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.18em', marginTop:28, marginBottom:14, paddingTop:20, borderTop:`1px solid ${T.ruleSoft}` }}>
      {children}
    </div>
  );
}

// 3-state boolean select (null / true / false)
function BoolSelect({ value, onChange }) {
  const v = value === true ? 'true' : value === false ? 'false' : 'null';
  return (
    <select value={v} onChange={e => onChange(e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)} style={selStyle}>
      <option value="null">— (inconnu)</option>
      <option value="true">+ (positif)</option>
      <option value="false">− (négatif)</option>
    </select>
  );
}

// ── PALETTE EDITOR ──────────────────────────────────────────────────────────
function PaletteEditor() {
  const { systems, loading, updateSystem } = useAdminSystems();
  const [error, setError] = React.useState(null);

  const setColor = async (sysId, key, value) => {
    const col = key === 'accent' ? 'color' : key;
    setError(null);
    try { await updateSystem(sysId, { [col]: value }); }
    catch (err) { setError(err.message); }
  };
  const resetSystem = async (sysId) => {
    if (!confirm('Réinitialiser les couleurs de ce système ?')) return;
    const sys = systems.find(s => s.id === sysId);
    const def = SYSTEM_PALETTES[sys?.slug];
    if (!def) return;
    setError(null);
    try { await updateSystem(sysId, { color: def.accent, tint: def.tint, deep: def.deep }); }
    catch (err) { setError(err.message); }
  };
  const resetAll = async () => {
    if (!confirm('Réinitialiser toutes les couleurs ?')) return;
    setError(null);
    try {
      for (const sys of systems) {
        const def = SYSTEM_PALETTES[sys.slug];
        if (def) await updateSystem(sys.id, { color: def.accent, tint: def.tint, deep: def.deep });
      }
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40 }}>Chargement…</div>;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Palette par système</h2>
        <span style={{ flex:1 }}/>
        <button onClick={resetAll} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.1em', color:T.ink2, cursor:'pointer' }}>TOUT RÉINITIALISER</button>
      </div>
      <ErrorBanner msg={error}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
        {systems.map(sys => {
          const accent = sys.color || '#888', tint = sys.tint || '#eee', deep = sys.deep || '#333';
          const def = SYSTEM_PALETTES[sys.slug] || {};
          const isCustom = sys.color !== def.accent || sys.tint !== def.tint || sys.deep !== def.deep;
          return (
            <div key={sys.id} style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'18px 20px', borderLeft:`4px solid ${accent}` }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:500 }}>{sys.name}</div>
                  <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.1em', marginTop:2 }}>{(def.name || sys.slug).toUpperCase()}</div>
                </div>
                {isCustom && <button onClick={() => resetSystem(sys.id)} style={{ padding:'3px 8px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', cursor:'pointer' }}>RÉINIT.</button>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
                <ColorField label="Accent" value={accent} onChange={v => setColor(sys.id, 'accent', v)}/>
                <ColorField label="Teinte" value={tint}   onChange={v => setColor(sys.id, 'tint',   v)}/>
                <ColorField label="Profond" value={deep}  onChange={v => setColor(sys.id, 'deep',   v)}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CHAPTERS EDITOR ─────────────────────────────────────────────────────────
function ChaptersEditor() {
  const { systems, loading, updateSystem, insertSystem, upsertZone, removeZone } = useAdminSystems();
  const [activeSys, setActiveSys]   = React.useState(null);
  const [error, setError]           = React.useState(null);
  const [showAdd, setShowAdd]       = React.useState(false);
  const [newSys, setNewSys]         = React.useState({ name:'', short:'', subtitle:'' });
  const [sysName, setSysName]       = React.useState('');
  const [sysSubtitle, setSysSubtitle] = React.useState('');
  const [sysShort, setSysShort]     = React.useState('');
  const [zoneEdits, setZoneEdits]   = React.useState({});

  React.useEffect(() => {
    if (!activeSys && systems.length > 0) setActiveSys(systems[0].id);
  }, [systems.length]); // eslint-disable-line

  const active = systems.find(s => s.id === activeSys) || null;
  React.useEffect(() => {
    if (active) {
      setSysName(active.name || '');
      setSysSubtitle(active.subtitle || '');
      setSysShort(active.short || '');
      setZoneEdits({});
    }
  }, [activeSys]); // eslint-disable-line

  const sysSubs = React.useMemo(() => {
    return [...(active?.bacterio_zones || [])].sort((a, b) => a.position - b.position);
  }, [active]);

  const saveSysField = async (key, value) => {
    if (!activeSys) return;
    setError(null);
    try { await updateSystem(activeSys, { [key]: value }); }
    catch (err) { setError(err.message); }
  };

  const move = async (sysId, dir) => {
    const idx = systems.findIndex(s => s.id === sysId);
    if (idx < 0) return;
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= systems.length) return;
    setError(null);
    try {
      await updateSystem(systems[idx].id, { position: systems[tgt].position });
      await updateSystem(systems[tgt].id, { position: systems[idx].position });
    } catch (err) { setError(err.message); }
  };

  const handleAddSystem = async () => {
    if (!newSys.name.trim()) return;
    setError(null);
    try {
      await insertSystem(newSys);
      setShowAdd(false);
      setNewSys({ name:'', short:'', subtitle:'' });
    } catch (err) { setError(err.message); }
  };

  const zoneVal = (zone, key) => {
    const e = zoneEdits[zone.id];
    if (e && e[key] !== undefined) return e[key];
    // For label: fall back to name if label not set
    if (key === 'label') return e?.[key] ?? zone.label ?? zone.name ?? '';
    return zone[key] ?? '';
  };
  const patchZoneEdit = (zoneId, key, val) => {
    setZoneEdits(e => ({ ...e, [zoneId]: { ...(e[zoneId] || {}), [key]: val } }));
  };
  const saveZoneField = async (zone, key) => {
    const val = zoneEdits[zone.id]?.[key];
    if (val === undefined) return;
    setError(null);
    try { await upsertZone({ ...zone, [key]: val }); }
    catch (err) { setError(err.message); }
  };
  const addSub = async () => {
    if (!active) return;
    const slug = `${active.slug}-${Date.now().toString(36)}`;
    setError(null);
    try { await upsertZone({ system_id: activeSys, name: 'Nouvelle sous-zone', slug, position: sysSubs.length, n: 0, flora: 0, descr: '' }); }
    catch (err) { setError(err.message); }
  };
  const removeSub = async (zone) => {
    if (!confirm('Supprimer cette sous-zone ?')) return;
    setError(null);
    try { await removeZone(zone.id); }
    catch (err) { setError(err.message); }
  };
  const moveSub = async (idx, dir) => {
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= sysSubs.length) return;
    setError(null);
    try {
      await upsertZone({ ...sysSubs[idx], position: sysSubs[tgt].position });
      await upsertZone({ ...sysSubs[tgt], position: sysSubs[idx].position });
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40 }}>Chargement…</div>;

  return (
    <div>
      <ErrorBanner msg={error}/>
      <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:32 }}>
        {/* Left: system list */}
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
            <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>Chapitres</h2>
            <span style={{ flex:1 }}/>
            <button onClick={() => setShowAdd(s => !s)} style={primaryBtn}>+ NOUVEAU</button>
          </div>

          {showAdd && (
            <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'16px 18px', marginBottom:14 }}>
              <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.16em', marginBottom:12 }}>NOUVEAU SYSTÈME</div>
              <Field label="Titre">
                <input type="text" value={newSys.name} onChange={e => setNewSys(p => ({...p, name:e.target.value}))} placeholder="ex. Système lymphatique" style={inpStyle}/>
              </Field>
              <Field label="Étiquette courte">
                <input type="text" value={newSys.short} onChange={e => setNewSys(p => ({...p, short:e.target.value}))} placeholder="ex. Lymphe" style={{...inpStyle, fontFamily:T.mono, textTransform:'uppercase', maxWidth:140}}/>
              </Field>
              <Field label="Sous-titre">
                <input type="text" value={newSys.subtitle} onChange={e => setNewSys(p => ({...p, subtitle:e.target.value}))} placeholder="ex. Ganglions · Rate" style={inpStyle}/>
              </Field>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={handleAddSystem} style={primaryBtn}>CRÉER</button>
                <button onClick={() => { setShowAdd(false); setNewSys({ name:'', short:'', subtitle:'' }); }} style={ghostBtn}>ANNULER</button>
              </div>
            </div>
          )}

          <div style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
            {systems.map((sys, idx) => {
              const accent = sys.color || '#888', tint = sys.tint || '#eee';
              const sel = activeSys === sys.id;
              return (
                <div key={sys.id} onClick={() => setActiveSys(sys.id)} style={{
                  padding:'12px 14px', borderBottom: idx < systems.length-1 ? `1px solid ${T.ruleSoft}` : 'none',
                  display:'grid', gridTemplateColumns:'10px 1fr auto', gap:12, alignItems:'center',
                  cursor:'pointer', background: sel ? tint : 'transparent',
                  borderLeft: sel ? `3px solid ${accent}` : '3px solid transparent',
                }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:accent }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:T.serif, fontSize:15, fontWeight:500, lineHeight:1.2, color:T.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sys.name}</div>
                    <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.08em' }}>{(sys.short||sys.slug).toUpperCase()} · {(sys.bacterio_zones||[]).length} zone(s)</div>
                  </div>
                  <div style={{ display:'flex', gap:3 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => move(sys.id,-1)} style={arrowBtn} disabled={idx===0}>↑</button>
                    <button onClick={() => move(sys.id,+1)} style={arrowBtn} disabled={idx===systems.length-1}>↓</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: detail + zones */}
        <div>
          {active ? (
            <>
              <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:'0 0 14px' }}>Détails du chapitre</h2>
              <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'22px 26px', marginBottom:24 }}>
                <Field label="Titre">
                  <input type="text" value={sysName} onChange={e => setSysName(e.target.value)} onBlur={e => saveSysField('name', e.target.value)} style={inpStyle}/>
                </Field>
                <Field label="Sous-titre éditorial" hint="Phrase sous le titre">
                  <input type="text" value={sysSubtitle} onChange={e => setSysSubtitle(e.target.value)} onBlur={e => saveSysField('subtitle', e.target.value)} style={inpStyle}/>
                </Field>
                <Field label="Étiquette courte" hint="Tag à l'accueil">
                  <input type="text" value={sysShort} onChange={e => setSysShort(e.target.value)} onBlur={e => saveSysField('short', e.target.value)} style={{...inpStyle, maxWidth:140, fontFamily:T.mono, textTransform:'uppercase'}}/>
                </Field>
              </div>

              <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14 }}>
                <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:0 }}>
                  Sous-zones <span style={{ color:T.ink3, fontStyle:'normal', fontSize:12, fontFamily:T.mono, letterSpacing:'0.1em', marginLeft:10 }}>· {(active.short||active.slug).toUpperCase()}</span>
                </h2>
                <span style={{ flex:1 }}/>
                <button onClick={addSub} style={primaryBtn}>+ AJOUTER</button>
              </div>
              {sysSubs.length === 0 ? (
                <div style={{ background:T.paper, border:`0.5px dashed ${T.rule}`, padding:'30px 20px', textAlign:'center', fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Aucune sous-zone. Cliquer + AJOUTER.</div>
              ) : (
                <div style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
                  {sysSubs.map((z, i) => (
                    <div key={z.id} style={{ padding:'14px 16px', borderBottom: i < sysSubs.length-1 ? `1px solid ${T.ruleSoft}` : 'none' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 80px auto', gap:10, alignItems:'center' }}>
                        <input type="text"
                               value={zoneVal(z, 'label')}
                               onChange={e => patchZoneEdit(z.id, 'label', e.target.value)}
                               onBlur={() => saveZoneField(z, 'label')}
                               style={{ border:'none', background:'transparent', fontFamily:T.serif, fontSize:16, fontWeight:500, color:T.ink, outline:'none' }}/>
                        <input type="number" value={zoneVal(z, 'n')}
                               onChange={e => patchZoneEdit(z.id, 'n', parseInt(e.target.value)||0)}
                               onBlur={() => saveZoneField(z, 'n')}
                               style={{ border:`1px solid ${T.rule}`, background:T.bg, padding:'4px 8px', fontFamily:T.mono, fontSize:11, color:T.ink2, width:60, textAlign:'right' }}/>
                        <div style={{ display:'flex', gap:3 }}>
                          <button onClick={() => moveSub(i,-1)} style={arrowBtn} disabled={i===0}>↑</button>
                          <button onClick={() => moveSub(i,+1)} style={arrowBtn} disabled={i===sysSubs.length-1}>↓</button>
                          <button onClick={() => removeSub(z)} style={{...arrowBtn, color:T.red}}>×</button>
                        </div>
                      </div>
                      <input type="text" placeholder="Description (optionnel)" value={zoneVal(z, 'descr')}
                             onChange={e => patchZoneEdit(z.id, 'descr', e.target.value)}
                             onBlur={() => saveZoneField(z, 'descr')}
                             style={{ marginTop:6, width:'100%', border:'none', background:'transparent', fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:T.ink3, outline:'none' }}/>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40, textAlign:'center' }}>Sélectionner un chapitre.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BACTERIA EDITOR ─────────────────────────────────────────────────────────
function BacteriaEditor() {
  const { bacteria, loading: bactLoading, upsert, remove, uploadImage, deleteImage } = useAdminBacteria();
  const { systems, loading: sysLoading } = useAdminSystems();

  const [selectedId, setSelectedId] = React.useState(null);
  const [draft, setDraft]           = React.useState(null);
  const draftRef                    = React.useRef(null);
  const [search, setSearch]         = React.useState('');
  const [gramFilter, setGramFilter] = React.useState('all');
  const [saving, setSaving]         = React.useState(false);
  const [error, setError]           = React.useState(null);

  // Keep ref in sync with state to avoid stale closures in callbacks
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  const filtered = bacteria.filter(b => {
    if (gramFilter !== 'all' && b.gram !== gramFilter) return false;
    return b.name.toLowerCase().includes(search.toLowerCase());
  });

  // Auto-select first item on initial load
  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) selectBact(filtered[0]);
  }, [bacteria.length]); // eslint-disable-line

  const selectBact = (b) => {
    const { bacterio_images: _, ...fields } = b;
    setSelectedId(b.id);
    setDraft(fields);
    setError(null);
  };

  const current = bacteria.find(b => b.id === selectedId) || null;
  const images  = current?.bacterio_images || [];
  const d       = draft || {};

  // Core save — reads from ref to avoid stale closure
  const saveDraftWith = React.useCallback(async (updates) => {
    if (!draftRef.current) return;
    const updated = { ...draftRef.current, ...updates };
    setDraft(updated);
    setSaving(true);
    setError(null);
    try {
      await upsert(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [upsert]); // eslint-disable-line

  const addBact = async () => {
    const row = { name:`Nouvelle bactérie ${bacteria.length+1}`, type:'bacterie', gram:'positif', morphology:'cocci-cluster', shape:'cocci en amas', freq:'fréquent', atmosphere:'aéro-anaérobie facultatif', urgence:false, declaration:false, bsl3:false };
    setSaving(true); setError(null);
    try {
      const id = await upsert(row);
      if (id) { setSelectedId(id); setDraft({ ...row, id }); }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const duplicateBact = async () => {
    if (!draftRef.current) return;
    const { id: _, bacterio_images: __, ...rest } = draftRef.current;
    const copy = { ...rest, name: rest.name + ' (copie)' };
    setSaving(true); setError(null);
    try {
      const id = await upsert(copy);
      if (id) { setSelectedId(id); setDraft({ ...copy, id }); }
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const deleteBact = async () => {
    if (!current) return;
    if (!confirm(`Supprimer définitivement « ${current.name} » ?`)) return;
    setError(null);
    try { await remove(current.id); setSelectedId(null); setDraft(null); }
    catch (err) { setError(err.message); }
  };

  // ── Left panel ─────────────────────────────────────────────────────────────
  const listPanel = (
    <div style={{ width:300, flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:20, fontWeight:500, fontStyle:'italic', margin:0 }}>Bactéries</h2>
        <span style={{ flex:1 }}/>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.1em' }}>{filtered.length}/{bacteria.length}</span>
      </div>
      <button onClick={addBact} disabled={saving} style={{...primaryBtn, width:'100%', padding:'9px 12px', fontSize:11, marginBottom:10, opacity:saving?0.6:1}}>+ NOUVELLE BACTÉRIE</button>
      <input type="text" placeholder="Rechercher par nom…" value={search} onChange={e => setSearch(e.target.value)}
             style={{...inpStyle, marginBottom:8}}/>
      <div style={{ display:'flex', gap:3, marginBottom:10 }}>
        {[['all','TOUS'],['positif','G+'],['negatif','G−'],['aucun','F']].map(([k,l]) => (
          <button key={k} onClick={() => setGramFilter(k)} style={{ flex:1, padding:'5px 0', background:gramFilter===k?T.ink:T.paper, color:gramFilter===k?T.paper:T.ink3, border:`1px solid ${gramFilter===k?T.ink:T.rule}`, cursor:'pointer', fontFamily:T.mono, fontSize:9, letterSpacing:'0.06em' }}>{l}</button>
        ))}
      </div>
      {bactLoading ? (
        <div style={{ padding:24, textAlign:'center', fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Chargement…</div>
      ) : (
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, maxHeight:'calc(100vh - 360px)', overflowY:'auto' }}>
          {filtered.map((b,i) => {
            const c = gramColor(b.gram);
            const isSel = current?.id === b.id;
            return (
              <div key={b.id} onClick={() => selectBact(b)} style={{ padding:'10px 14px', borderBottom:i<filtered.length-1?`1px solid ${T.ruleSoft}`:'none', cursor:'pointer', background:isSel?T.bgSoft:'transparent', borderLeft:isSel?`3px solid ${c.stroke}`:'3px solid transparent', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c.stroke, flexShrink:0 }}/>
                <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, fontWeight:500, color:T.ink, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.name}</span>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding:24, textAlign:'center', fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Aucun résultat.</div>}
        </div>
      )}
    </div>
  );

  // ── Form panel ─────────────────────────────────────────────────────────────
  const formPanel = draft ? (
    <div style={{ flex:1, minWidth:0 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:28, fontWeight:500, fontStyle:'italic', margin:0, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</h2>
        <span style={{ flex:1 }}/>
        {saving && <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.1em', flexShrink:0 }}>SAUVEGARDE…</span>}
        <button onClick={duplicateBact} disabled={saving} style={ghostBtn}>⎘ DUPLIQUER</button>
        <button onClick={deleteBact} style={{...ghostBtn, color:T.red, borderColor:T.red}}>× SUPPRIMER</button>
      </div>

      <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'24px 28px' }}>

        {/* ── IDENTITÉ ──────────────────────────────────────────────────── */}
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.18em', marginBottom:14 }}>IDENTITÉ</div>
        <Field label="Nom">
          <input type="text" value={d.name||''} onChange={e => setDraft(p => ({...p, name:e.target.value}))} onBlur={e => saveDraftWith({name:e.target.value})} style={{...inpStyle, fontStyle:'italic'}}/>
        </Field>
        <Field label="Gram">
          <select value={d.gram||'positif'} onChange={e => saveDraftWith({gram:e.target.value})} style={selStyle}>
            <option value="positif">positif (Gram +)</option>
            <option value="negatif">négatif (Gram −)</option>
            <option value="aucun">aucun (fongique)</option>
            <option value="variable">variable</option>
          </select>
        </Field>
        <Field label="Type">
          <select value={d.type||'bacterie'} onChange={e => saveDraftWith({type:e.target.value})} style={selStyle}>
            <option value="bacterie">Bactérie</option>
            <option value="levure">Levure</option>
            <option value="moisissure">Moisissure</option>
          </select>
        </Field>
        <Field label="Morphologie">
          <select value={d.morphology||'cocci-cluster'} onChange={e => saveDraftWith({morphology:e.target.value})} style={selStyle}>
            {[['cocci-pairs','Cocci en paires'],['cocci-chains','Cocci en chaînettes'],['cocci-cluster','Cocci en amas'],['rod','Bacille'],['rod-bar','Bacille BAAR'],['coccobacillus','Coccobacille'],['spiral','Spirale'],['yeast','Levure']].map(([k,l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label="Forme courte">
          <input type="text" value={d.shape||''} onChange={e => setDraft(p=>({...p,shape:e.target.value}))} onBlur={e => saveDraftWith({shape:e.target.value})} style={inpStyle}/>
        </Field>
        <Field label="Fréquence">
          <select value={d.freq||'fréquent'} onChange={e => saveDraftWith({freq:e.target.value})} style={selStyle}>
            {['fréquent','occasionnel','rare'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Atmosphère">
          <select value={d.atmosphere||'aéro-anaérobie facultatif'} onChange={e => saveDraftWith({atmosphere:e.target.value})} style={selStyle}>
            {['aérobie strict','anaérobie strict','aéro-anaérobie facultatif','micro-aérophile'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Drapeaux">
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', paddingTop:6 }}>
            <label style={chkLbl}><input type="checkbox" checked={!!d.urgence} onChange={e => saveDraftWith({urgence:e.target.checked})}/> Urgence †</label>
            <label style={chkLbl}><input type="checkbox" checked={!!d.declaration} onChange={e => saveDraftWith({declaration:e.target.checked})}/> DO</label>
            <label style={chkLbl}><input type="checkbox" checked={!!d.bsl3} onChange={e => saveDraftWith({bsl3:e.target.checked})}/> BSL-3</label>
          </div>
        </Field>

        {/* ── TESTS RAPIDES ─────────────────────────────────────────────── */}
        <SectionTitle>TESTS RAPIDES</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:16 }}>
          {[['catalase','Catalase'],['oxydase','Oxydase'],['coagulase','Coagulase'],['sporulation','Sporulation']].map(([k,l]) => (
            <Field key={k} label={l}>
              <BoolSelect value={d[k]} onChange={v => saveDraftWith({[k]:v})}/>
            </Field>
          ))}
        </div>
        <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:10 }}>TESTS SUPPLÉMENTAIRES</div>
        {(d.tests_rapides||[]).map((t, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 140px auto', gap:8, marginBottom:8, alignItems:'center' }}>
            <input type="text" placeholder="Nom du test" value={t.name||''} onChange={e => { const n=(d.tests_rapides||[]).map((x,j)=>j===i?{...x,name:e.target.value}:x); setDraft(p=>({...p,tests_rapides:n})); }} onBlur={() => saveDraftWith({tests_rapides:draftRef.current?.tests_rapides})} style={inpStyle}/>
            <input type="text" placeholder="Valeur" value={t.value||''} onChange={e => { const n=(d.tests_rapides||[]).map((x,j)=>j===i?{...x,value:e.target.value}:x); setDraft(p=>({...p,tests_rapides:n})); }} onBlur={() => saveDraftWith({tests_rapides:draftRef.current?.tests_rapides})} style={inpStyle}/>
            <button onClick={() => saveDraftWith({tests_rapides:(draftRef.current?.tests_rapides||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,tests_rapides:[...(p?.tests_rapides||[]),{name:'',value:''}]}))} style={{...ghostBtn, fontSize:10, letterSpacing:'0.1em'}}>+ AJOUTER UN TEST</button>

        {/* ── MILIEUX ───────────────────────────────────────────────────── */}
        <SectionTitle>MILIEUX DE CULTURE</SectionTitle>
        {(d.milieux||[]).map((m, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:8, marginBottom:8, alignItems:'center' }}>
            <input type="text" placeholder="Milieu" value={m.name||''} onChange={e => { const n=(d.milieux||[]).map((x,j)=>j===i?{...x,name:e.target.value}:x); setDraft(p=>({...p,milieux:n})); }} onBlur={() => saveDraftWith({milieux:draftRef.current?.milieux})} style={inpStyle}/>
            <input type="text" placeholder="Note (optionnel)" value={m.note||''} onChange={e => { const n=(d.milieux||[]).map((x,j)=>j===i?{...x,note:e.target.value}:x); setDraft(p=>({...p,milieux:n})); }} onBlur={() => saveDraftWith({milieux:draftRef.current?.milieux})} style={inpStyle}/>
            <label style={chkLbl}><input type="checkbox" checked={!!m.primary} onChange={e => saveDraftWith({milieux:(draftRef.current?.milieux||[]).map((x,j)=>j===i?{...x,primary:e.target.checked}:x)})}/> Primaire</label>
            <button onClick={() => saveDraftWith({milieux:(draftRef.current?.milieux||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,milieux:[...(p?.milieux||[]),{name:'',note:'',primary:false}]}))} style={{...ghostBtn, fontSize:10, letterSpacing:'0.1em'}}>+ AJOUTER UN MILIEU</button>

        {/* ── IDENTIFICATION ────────────────────────────────────────────── */}
        <SectionTitle>IDENTIFICATION</SectionTitle>
        <textarea value={d.identif||''} onChange={e => setDraft(p=>({...p,identif:e.target.value}))} onBlur={e => saveDraftWith({identif:e.target.value})} rows={3} placeholder="Méthodes d'identification…" style={taStyle}/>

        {/* ── RÉSISTANCES ───────────────────────────────────────────────── */}
        <SectionTitle>RÉSISTANCES</SectionTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:10 }}>NATURELLES</div>
            {(d.resist_nat||[]).map((item, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <input type="text" value={item} onChange={e => { const n=(d.resist_nat||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_nat:n})); }} onBlur={() => saveDraftWith({resist_nat:draftRef.current?.resist_nat})} style={{...inpStyle,flex:1}}/>
                <button onClick={() => saveDraftWith({resist_nat:(draftRef.current?.resist_nat||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
              </div>
            ))}
            <button onClick={() => setDraft(p=>({...p,resist_nat:[...(p?.resist_nat||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ AJOUTER</button>
          </div>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:10 }}>ACQUISES</div>
            {(d.resist_acq||[]).map((item, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                <input type="text" value={item} onChange={e => { const n=(d.resist_acq||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_acq:n})); }} onBlur={() => saveDraftWith({resist_acq:draftRef.current?.resist_acq})} style={{...inpStyle,flex:1}}/>
                <button onClick={() => saveDraftWith({resist_acq:(draftRef.current?.resist_acq||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
              </div>
            ))}
            <button onClick={() => setDraft(p=>({...p,resist_acq:[...(p?.resist_acq||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ AJOUTER</button>
          </div>
        </div>

        {/* ── VIRULENCE ─────────────────────────────────────────────────── */}
        <SectionTitle>VIRULENCE</SectionTitle>
        {(d.virulence||[]).map((item, i) => (
          <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
            <input type="text" value={item} onChange={e => { const n=(d.virulence||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,virulence:n})); }} onBlur={() => saveDraftWith({virulence:draftRef.current?.virulence})} style={{...inpStyle,flex:1}}/>
            <button onClick={() => saveDraftWith({virulence:(draftRef.current?.virulence||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,virulence:[...(p?.virulence||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ AJOUTER</button>

        {/* ── CLINIQUE ──────────────────────────────────────────────────── */}
        <SectionTitle>CLINIQUE</SectionTitle>
        <Field label="Description clinique" wide>
          <textarea value={d.clinical_info||''} onChange={e => setDraft(p=>({...p,clinical_info:e.target.value}))} onBlur={e => saveDraftWith({clinical_info:e.target.value})} rows={3} style={taStyle}/>
        </Field>
        <Field label="Traitement antibiotique" wide>
          <textarea value={d.antibio||''} onChange={e => setDraft(p=>({...p,antibio:e.target.value}))} onBlur={e => saveDraftWith({antibio:e.target.value})} rows={3} style={taStyle}/>
        </Field>

        {/* ── ANTIBIOGRAMME ─────────────────────────────────────────────── */}
        <SectionTitle>ANTIBIOGRAMME</SectionTitle>
        {(d.antibiogramme||[]).length > 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:12 }}>
            <thead>
              <tr>
                <th style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', textAlign:'left', padding:'6px 8px', borderBottom:`1px solid ${T.rule}` }}>ANTIBIOTIQUE</th>
                <th style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', textAlign:'left', padding:'6px 8px', borderBottom:`1px solid ${T.rule}`, width:160 }}>SENSIBILITÉ</th>
                <th style={{ width:34, borderBottom:`1px solid ${T.rule}` }}/>
              </tr>
            </thead>
            <tbody>
              {(d.antibiogramme||[]).map((row, i) => {
                const sensColor = row.sens==='S' ? '#2d6a4f' : row.sens==='R' ? '#c00' : '#9a6b1f';
                return (
                  <tr key={i} style={{ borderBottom:`0.5px solid ${T.ruleSoft}` }}>
                    <td style={{ padding:'4px 8px' }}>
                      <input type="text" value={row.ab||''} onChange={e => { const n=(d.antibiogramme||[]).map((x,j)=>j===i?{...x,ab:e.target.value}:x); setDraft(p=>({...p,antibiogramme:n})); }} onBlur={() => saveDraftWith({antibiogramme:draftRef.current?.antibiogramme})} style={{ border:'none', background:'transparent', fontFamily:T.serif, fontSize:14, color:T.ink, outline:'none', width:'100%' }}/>
                    </td>
                    <td style={{ padding:'4px 8px' }}>
                      <select value={row.sens||'S'} onChange={e => saveDraftWith({antibiogramme:(draftRef.current?.antibiogramme||[]).map((x,j)=>j===i?{...x,sens:e.target.value}:x)})} style={{...selStyle, color:sensColor}}>
                        <option value="S">S — Sensible</option>
                        <option value="I">I — Intermédiaire</option>
                        <option value="R">R — Résistant</option>
                      </select>
                    </td>
                    <td style={{ padding:'4px 8px', textAlign:'center' }}>
                      <button onClick={() => saveDraftWith({antibiogramme:(draftRef.current?.antibiogramme||[]).filter((_,j)=>j!==i)})} style={{...arrowBtn,color:T.red}}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <button onClick={() => setDraft(p=>({...p,antibiogramme:[...(p?.antibiogramme||[]),{ab:'',sens:'S'}]}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ AJOUTER UNE LIGNE</button>

        {/* ── COMMENTAIRE ───────────────────────────────────────────────── */}
        <SectionTitle>COMMENTAIRE</SectionTitle>
        <textarea value={d.commentaire||''} onChange={e => setDraft(p=>({...p,commentaire:e.target.value}))} onBlur={e => saveDraftWith({commentaire:e.target.value})} rows={3} placeholder="Notes libres…" style={taStyle}/>

        {/* ── ZONES ASSOCIÉES ───────────────────────────────────────────── */}
        <SectionTitle>ZONES ASSOCIÉES</SectionTitle>
        {sysLoading ? (
          <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Chargement des zones…</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
            {systems.map(sys => {
              const zones = [...(sys.bacterio_zones||[])].sort((a,b)=>a.position-b.position);
              if (!zones.length) return null;
              return (
                <div key={sys.id}>
                  <div style={{ fontFamily:T.mono, fontSize:9, color:sys.color||T.ink2, letterSpacing:'0.1em', marginBottom:8 }}>{sys.name.toUpperCase()}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {zones.map(z => {
                      const checked = (d.zone_ids||[]).includes(z.id);
                      return (
                        <label key={z.id} style={{ ...chkLbl, fontSize:13 }}>
                          <input type="checkbox" checked={checked} onChange={e => {
                            const cur = draftRef.current?.zone_ids||[];
                            const next = e.target.checked ? [...cur, z.id] : cur.filter(id=>id!==z.id);
                            saveDraftWith({zone_ids:next});
                          }}/>
                          {z.label||z.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── IMAGES ────────────────────────────────────────────────────── */}
        <SectionTitle>IMAGES</SectionTitle>
        {images.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
            {images.map(img => (
              <div key={img.id} style={{ background:T.paper, border:`0.5px solid ${T.rule}`, overflow:'hidden' }}>
                <img src={img.url} alt={img.caption||''} style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' }}/>
                <div style={{ padding:'6px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{img.caption||'—'}</span>
                  <button onClick={async () => {
                    if (!confirm('Supprimer cette image ?')) return;
                    setSaving(true); setError(null);
                    try { await deleteImage(img.id, img.url); }
                    catch (err) { setError(err.message); }
                    finally { setSaving(false); }
                  }} style={{...arrowBtn, color:T.red, marginLeft:6}}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {d.id && (
          <label style={{ display:'inline-block', padding:'8px 14px', background:T.ocre, color:T.paper, fontFamily:T.mono, fontSize:10, letterSpacing:'0.1em', cursor:'pointer' }}>
            + TÉLÉVERSER UNE IMAGE
            <input type="file" accept="image/*" onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setSaving(true); setError(null);
              try { await uploadImage(d.id, file); }
              catch (err) { setError(err.message); }
              finally { setSaving(false); }
              e.target.value = '';
            }} style={{ display:'none' }}/>
          </label>
        )}

      </div>
    </div>
  ) : (
    <div style={{ flex:1, fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40, textAlign:'center' }}>
      Sélectionner une bactérie dans la liste, ou cliquer <strong style={{ color:T.ocre }}>+ NOUVELLE BACTÉRIE</strong>.
    </div>
  );

  return (
    <div>
      <ErrorBanner msg={error}/>
      <div style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
        {listPanel}
        {formPanel}
      </div>
    </div>
  );
}

// ── QUIZ EDITOR ─────────────────────────────────────────────────────────────
function QuizEditor() {
  const { questions, loading, upsert, remove, toggle } = useQuizAdmin();
  const { systems } = useAdminSystems();
  const [selectedId, setSelectedId] = React.useState(null);
  const [draft, setDraft]           = React.useState(null);
  const [saving, setSaving]         = React.useState(false);
  const [error, setError]           = React.useState(null);
  const draftRef = React.useRef(null);
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  React.useEffect(() => {
    if (selectedId === null && questions.length > 0) selectQ(questions[0]);
  }, [questions.length]); // eslint-disable-line

  const emptyQ = () => ({ question:'', options:['','','',''], correct_index:0, feedback:'', difficulty:1, system_id:null, active:true, title:'', scenario:'' });

  const selectQ = (q) => {
    setSelectedId(q.id);
    setDraft({ ...q, options: Array.isArray(q.options) ? q.options : [] });
    setError(null);
  };

  const newQuestion = () => { setSelectedId(null); setDraft(emptyQ()); setError(null); };

  const saveQ = async () => {
    const d = draftRef.current;
    if (!d) return;
    setSaving(true); setError(null);
    try {
      const saved = await upsert(d);
      setSelectedId(saved.id);
      setDraft({ ...saved, options: Array.isArray(saved.options) ? saved.options : [] });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const saveField = async (patch) => {
    const d = draftRef.current;
    if (!d) return;
    const merged = { ...d, ...patch };
    setDraft(merged);
    if (merged.id) {
      setError(null);
      try { await upsert(merged); } catch (err) { setError(err.message); }
    }
  };

  const deleteQ = async (id) => {
    if (!confirm('Supprimer cette question ?')) return;
    setError(null);
    try {
      await remove(id);
      if (selectedId === id) { setSelectedId(null); setDraft(null); }
    } catch (err) { setError(err.message); }
  };

  const setOption = (i, value) => setDraft(p => ({ ...p, options: (p.options||[]).map((o, j) => j === i ? value : o) }));
  const addOption = () => setDraft(p => ({ ...p, options: [...(p.options||[]), ''] }));
  const removeOption = (i) => setDraft(p => {
    const opts = (p.options||[]).filter((_, j) => j !== i);
    return { ...p, options: opts, correct_index: Math.max(0, p.correct_index >= opts.length ? opts.length - 1 : p.correct_index) };
  });

  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★';

  if (loading) return <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3, padding:40 }}>Chargement…</div>;

  const d = draft;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Questions QCM</h2>
        <span style={{ flex:1 }}/>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink2, letterSpacing:'0.12em' }}>{questions.length} QUESTION{questions.length !== 1 ? 'S' : ''}</span>
        <button onClick={newQuestion} style={primaryBtn}>+ NOUVELLE QUESTION</button>
      </div>
      <ErrorBanner msg={error}/>
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, alignItems:'start' }}>

        {/* Left: list */}
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
          {questions.length === 0 && (
            <div style={{ padding:'20px 16px', fontFamily:T.serif, fontStyle:'italic', color:T.ink3, fontSize:13 }}>Aucune question.</div>
          )}
          {questions.map((q, i) => {
            const isSel = q.id === selectedId;
            return (
              <div key={q.id} onClick={() => selectQ(q)} style={{ padding:'11px 13px', cursor:'pointer', borderBottom:`1px solid ${T.ruleSoft}`, background:isSel ? T.bg : 'transparent', borderLeft:`3px solid ${isSel ? T.ink : 'transparent'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, flexShrink:0 }}>#{i+1}</span>
                  <span style={{ fontFamily:T.mono, fontSize:9, color:T.ocre, flexShrink:0 }}>{diffLabel(q.difficulty||1)}</span>
                  <span style={{ fontFamily:T.serif, fontSize:11, color:q.active?T.ink2:T.ink3, fontStyle:q.active?'normal':'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                    {(q.question||'').slice(0, 48) || '(sans texte)'}
                  </span>
                  <span onClick={e => { e.stopPropagation(); toggle(q.id, !q.active); }} style={{ fontFamily:T.mono, fontSize:8, padding:'2px 5px', border:`1px solid ${T.rule}`, background:q.active?'#e8f5e9':T.bg, color:q.active?'#388e3c':T.ink3, cursor:'pointer', flexShrink:0, letterSpacing:'0.06em' }}>
                    {q.active ? 'ON' : 'OFF'}
                  </span>
                  <span onClick={e => { e.stopPropagation(); deleteQ(q.id); }} style={{ fontFamily:T.mono, fontSize:11, color:T.red, cursor:'pointer', padding:'0 3px', flexShrink:0 }}>×</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: form */}
        {d ? (
          <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'24px 28px' }}>
            <Field label="Question" wide>
              <textarea value={d.question||''} rows={4}
                onChange={e => setDraft(p => ({ ...p, question:e.target.value }))}
                onBlur={e => saveField({ question:e.target.value })}
                placeholder="Texte de la question…" style={taStyle}/>
            </Field>

            <SectionTitle>OPTIONS</SectionTitle>
            {(d.options||[]).map((opt, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <input type="radio" name={`correct-${d.id||'new'}`} checked={d.correct_index === i}
                  onChange={() => saveField({ correct_index:i })} style={{ flexShrink:0 }}/>
                <span style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, width:16, flexShrink:0 }}>{String.fromCharCode(65+i)}</span>
                <input type="text" value={opt} placeholder={`Option ${String.fromCharCode(65+i)}…`}
                  onChange={e => setOption(i, e.target.value)}
                  onBlur={() => saveField({ options:draftRef.current?.options })}
                  style={{ ...inpStyle, flex:1 }}/>
                {(d.options||[]).length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ ...arrowBtn, color:T.red }}>×</button>
                )}
              </div>
            ))}
            {(d.options||[]).length < 6 && (
              <button onClick={addOption} style={{ ...ghostBtn, fontSize:10, letterSpacing:'0.1em', marginTop:4 }}>+ AJOUTER UNE OPTION</button>
            )}
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, marginTop:6, letterSpacing:'0.08em' }}>
              Le bouton radio marque la bonne réponse.
            </div>

            <SectionTitle>FEEDBACK</SectionTitle>
            <textarea value={d.feedback||''} rows={3}
              onChange={e => setDraft(p => ({ ...p, feedback:e.target.value }))}
              onBlur={e => saveField({ feedback:e.target.value })}
              placeholder="Explication affichée après la réponse…" style={taStyle}/>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginTop:20 }}>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:6 }}>DIFFICULTÉ</div>
                <select value={d.difficulty||1} onChange={e => saveField({ difficulty:Number(e.target.value) })} style={selStyle}>
                  <option value={1}>★ Facile</option>
                  <option value={2}>★★ Moyen</option>
                  <option value={3}>★★★ Difficile</option>
                </select>
              </div>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:6 }}>SYSTÈME</div>
                <select value={d.system_id||''} onChange={e => saveField({ system_id:e.target.value ? Number(e.target.value) : null })} style={selStyle}>
                  <option value="">— Tous systèmes</option>
                  {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:9, color:T.ink3, letterSpacing:'0.1em', marginBottom:6 }}>STATUT</div>
                <select value={d.active ? 'true' : 'false'} onChange={e => saveField({ active:e.target.value === 'true' })} style={selStyle}>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop:24 }}>
              <button onClick={saveQ} disabled={saving} style={{ ...primaryBtn, opacity:saving?0.6:1 }}>
                {saving ? 'ENREGISTREMENT…' : d.id ? 'ENREGISTRER' : 'CRÉER LA QUESTION'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', color:T.ink3 }}>Sélectionnez une question ou créez-en une nouvelle.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── META EDITOR ─────────────────────────────────────────────────────────────
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
      <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'24px 28px' }}>
        <Field label="Titre"><input type="text" value={meta.title||'Bacteriomap'} onChange={e=>set('title',e.target.value)} style={inpStyle}/></Field>
        <Field label="Surtitre"><input type="text" value={meta.kicker||'Atlas de microbiologie clinique'} onChange={e=>set('kicker',e.target.value)} style={inpStyle}/></Field>
        <Field label="Sous-titre éditorial" wide><textarea value={meta.subtitle||"Un atlas par site anatomique — pathogènes, commensaux, antibiogrammes."} onChange={e=>set('subtitle',e.target.value)} rows={3} style={taStyle}/></Field>
        <Field label="Auteur·trice"><input type="text" value={meta.author||''} onChange={e=>set('author',e.target.value)} style={inpStyle}/></Field>
        <Field label="Édition"><input type="text" value={meta.edition||'Édition 2026'} onChange={e=>set('edition',e.target.value)} style={{...inpStyle, maxWidth:240}}/></Field>
      </div>
    </div>
  );
}

// ── IMAGES EDITOR ────────────────────────────────────────────────────────────
function ImagesEditor() {
  const [, force] = React.useReducer(x=>x+1, 0);
  const allBact = React.useMemo(() => {
    const seen = new Set();
    return [...LCR_PATHO, ...ORL_PATHO, ...ORL_FLORA].filter(b => { if (seen.has(b.name)) return false; seen.add(b.name); return true; });
  }, []);
  const onUpload = (name, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => { localStorage.setItem('bm-img:'+name, ev.target.result); window.dispatchEvent(new Event('bm-img-updated')); force(); };
    r.readAsDataURL(file);
  };
  const onClear = (name) => { if (!confirm('Retirer l\'image ?')) return; localStorage.removeItem('bm-img:'+name); window.dispatchEvent(new Event('bm-img-updated')); force(); };
  const clearAll = () => {
    if (!confirm('Supprimer toutes les images téléversées ?')) return;
    Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k=>localStorage.removeItem(k));
    window.dispatchEvent(new Event('bm-img-updated')); force();
  };
  return (
    <div>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:18 }}>
        <h2 style={{ fontFamily:T.serif, fontSize:26, fontWeight:500, fontStyle:'italic', margin:0 }}>Images de bactéries</h2>
        <span style={{ flex:1 }}/>
        <button onClick={clearAll} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.1em', color:T.red, cursor:'pointer' }}>TOUT SUPPRIMER</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
        {allBact.map(b => {
          const img = localStorage.getItem('bm-img:'+b.name);
          const c = gramColor(b.gram);
          return (
            <div key={b.name} style={{ background:T.paper, border:`0.5px solid ${T.rule}` }}>
              <div style={{ height:140, background:T.bgSoft, position:'relative', overflow:'hidden', borderBottom:`0.5px solid ${T.rule}` }}>
                {img ? <img src={img} alt={b.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg viewBox="0 0 100 100" width={80} height={80}><MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.22} strokeWidth={1.6} vivid={false}/></svg>
                  </div>
                )}
              </div>
              <div style={{ padding:'10px 12px' }}>
                <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, fontWeight:500, color:T.ink, lineHeight:1.2, marginBottom:8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.name}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <label style={{ flex:1, padding:'5px 8px', background:T.ocre, color:T.paper, fontFamily:T.mono, fontSize:9, letterSpacing:'0.1em', cursor:'pointer', textAlign:'center' }}>
                    {img?'REMPLACER':'TÉLÉVERSER'}
                    <input type="file" accept="image/*" onChange={e=>onUpload(b.name, e.target.files[0])} style={{ display:'none' }}/>
                  </label>
                  {img && <button onClick={()=>onClear(b.name)} style={{ width:30, padding:'5px', background:'transparent', border:`1px solid ${T.rule}`, color:T.red, fontFamily:T.mono, fontSize:11, cursor:'pointer' }}>×</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SETTINGS EDITOR ─────────────────────────────────────────────────────────
function SettingsEditor() {
  const [pwOld, setPwOld] = React.useState('');
  const [pwNew, setPwNew] = React.useState('');
  const [msg, setMsg]     = React.useState('');
  const changePw = () => {
    const stored = adminLoad('password', ADMIN_PASSWORD);
    if (pwOld !== stored) { setMsg('✗ Ancien mot de passe incorrect.'); return; }
    if (pwNew.length < 3) { setMsg('✗ Trop court (min. 3 caractères).'); return; }
    adminSave('password', pwNew); setMsg('✓ Mot de passe modifié.'); setPwOld(''); setPwNew('');
  };
  const wipeAll = () => {
    if (!confirm('Effacer TOUTES les modifications admin ?')) return;
    Object.values(ADMIN_KEYS).forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k=>localStorage.removeItem(k));
    sessionStorage.removeItem('bm.adminUnlocked'); location.reload();
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
            {msg && <span style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:13, color:msg[0]==='✓'?T.green:T.red }}>{msg}</span>}
          </div>
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily:T.serif, fontSize:22, fontWeight:500, fontStyle:'italic', margin:'0 0 14px' }}>Réinitialisation</h2>
        <div style={{ background:T.paper, border:`0.5px solid ${T.rule}`, padding:'20px 24px' }}>
          <div style={{ fontFamily:T.serif, fontSize:14, color:T.ink2, lineHeight:1.55, marginBottom:14 }}>Efface les préférences locales (quiz, meta, mot de passe). Les données Supabase ne sont pas affectées.</div>
          <button onClick={wipeAll} style={{ padding:'10px 18px', background:T.red, color:T.paper, border:'none', fontFamily:T.mono, fontSize:11, letterSpacing:'0.12em', cursor:'pointer' }}>TOUT EFFACER</button>
        </div>
      </div>
    </div>
  );
}

// ── EXPORT / IMPORT ──────────────────────────────────────────────────────────
function ExportButton() {
  const onExport = () => {
    const dump = {};
    Object.entries(ADMIN_KEYS).forEach(([k,sk]) => { const v=localStorage.getItem(sk); if(v) dump[k]=JSON.parse(v); });
    const imgs = {};
    Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k => { imgs[k.slice(7)]=localStorage.getItem(k); });
    if (Object.keys(imgs).length) dump.images = imgs;
    const blob = new Blob([JSON.stringify(dump,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='bacteriomap-config.json'; a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={onExport} style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.12em', color:T.ink2, cursor:'pointer' }}>⇩ EXPORTER</button>;
}
function ImportButton() {
  const ref = React.useRef(null);
  const onFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('Importer ? Les modifications actuelles seront remplacées.')) return;
        Object.entries(ADMIN_KEYS).forEach(([k,sk]) => { if(data[k]!==undefined) localStorage.setItem(sk,JSON.stringify(data[k])); });
        if (data.images) Object.entries(data.images).forEach(([name,url]) => localStorage.setItem('bm-img:'+name,url));
        location.reload();
      } catch { alert('Fichier invalide.'); }
    };
    r.readAsText(f); e.target.value='';
  };
  return (
    <>
      <button onClick={() => ref.current?.click()} style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:10, letterSpacing:'0.12em', color:T.ink2, cursor:'pointer' }}>⇪ IMPORTER</button>
      <input ref={ref} type="file" accept="application/json" onChange={onFile} style={{ display:'none' }}/>
    </>
  );
}

// ── AdminScreen ──────────────────────────────────────────────────────────────
export default function AdminScreen({ navigate }) {
  const [unlocked, setUnlocked] = React.useState(() => sessionStorage.getItem('bm.adminUnlocked') === '1');
  const [pwInput, setPwInput]   = React.useState('');
  const [pwError, setPwError]   = React.useState('');
  const [tab, setTab] = React.useState('chapters');

  const tryUnlock = () => {
    const stored = adminLoad('password', ADMIN_PASSWORD);
    if (pwInput === stored) { sessionStorage.setItem('bm.adminUnlocked','1'); setUnlocked(true); setPwError(''); }
    else setPwError('Mot de passe incorrect.');
  };

  if (!unlocked) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, background:T.bg }}>
        <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
          <span style={{ cursor:'pointer', color:T.ink2 }} onClick={() => navigate('home')}>← TABLE DES MATIÈRES</span>
          <span style={{ flex:1 }}/><span>Admin · accès restreint</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          <div style={{ maxWidth:420, width:'100%', background:T.paper, border:`0.5px solid ${T.rule}`, padding:'40px 36px' }}>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:18, color:T.ocre, marginBottom:6 }}>Annexe administrative</div>
            <h1 style={{ fontFamily:T.serif, fontSize:44, fontWeight:500, letterSpacing:'-0.02em', lineHeight:1, fontStyle:'italic', margin:0 }}>Atelier</h1>
            <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, marginTop:14, lineHeight:1.5 }}>L'accès est protégé. Indiquez votre mot de passe.</div>
            <div style={{ marginTop:28 }}>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.16em', marginBottom:8 }}>MOT DE PASSE</div>
              <input type="password" value={pwInput} onChange={e=>setPwInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')tryUnlock();}} autoFocus style={{ width:'100%', padding:'10px 12px', background:T.bg, border:`1px solid ${T.rule}`, fontFamily:T.mono, fontSize:14, color:T.ink, outline:'none', boxSizing:'border-box' }}/>
              {pwError && <div style={{ fontFamily:T.mono, fontSize:10, color:T.red, marginTop:8, letterSpacing:'0.06em' }}>{pwError}</div>}
              <button onClick={tryUnlock} style={{ marginTop:14, width:'100%', padding:'12px 18px', background:T.ink, color:T.paper, border:'none', fontFamily:T.mono, fontSize:11, letterSpacing:'0.16em', cursor:'pointer' }}>ENTRER</button>
              <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:12, color:T.ink3, marginTop:14 }}>Mot de passe par défaut : <code style={{ fontFamily:T.mono, fontSize:11, color:T.ink2 }}>admin</code>.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:T.serif, background:T.bg }}>
      <div style={{ padding:'13px 56px', borderBottom:`0.5px solid ${T.rule}`, display:'flex', alignItems:'center', fontFamily:T.mono, fontSize:10, color:T.ink3, letterSpacing:'0.14em', background:T.paper }}>
        <span style={{ cursor:'pointer', color:T.ink2 }} onClick={() => navigate('home')}>← TABLE DES MATIÈRES</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontStyle:'italic', fontFamily:T.serif, letterSpacing:0, fontSize:12, color:T.ink2 }}>Atelier · session ouverte</span>
        <span style={{ margin:'0 12px', opacity:0.4 }}>·</span>
        <span style={{ cursor:'pointer', color:T.red }} onClick={() => { sessionStorage.removeItem('bm.adminUnlocked'); setUnlocked(false); }}>VERROUILLER</span>
      </div>

      <div style={{ padding:'34px 56px 22px', borderBottom:`1.5px double ${T.rule}`, background:T.paper, display:'flex', alignItems:'flex-end', gap:24 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:16, color:T.ocre, marginBottom:4 }}>Annexe administrative</div>
          <h1 style={{ fontFamily:T.serif, fontSize:64, fontWeight:500, letterSpacing:'-0.025em', lineHeight:0.95, fontStyle:'italic', margin:0 }}>Atelier</h1>
          <div style={{ fontFamily:T.serif, fontStyle:'italic', fontSize:15, color:T.ink2, marginTop:8, maxWidth:700, lineHeight:1.5 }}>Données Supabase pour systèmes, zones et bactéries. Préférences locales (quiz, meta) en localStorage.</div>
        </div>
        <div style={{ display:'flex', gap:10 }}><ExportButton/><ImportButton/></div>
      </div>

      <div style={{ padding:'0 56px', background:T.paper, borderBottom:`1px solid ${T.rule}`, display:'flex', gap:0, flexWrap:'wrap' }}>
        {[['chapters','Chapitres & sous-zones'],['bacteria','Bactéries & fiches'],['quiz','Quiz « Qui suis-je »'],['palette','Couleurs par système'],['images','Images'],['meta','Identité de l\'atlas'],['settings','Paramètres']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding:'14px 0', marginRight:32, background:'transparent', border:'none', borderBottom:tab===k?`2px solid ${T.ocre}`:'2px solid transparent', color:tab===k?T.ink:T.ink3, fontFamily:tab===k?T.serif:T.mono, fontSize:tab===k?15:11, fontStyle:tab===k?'italic':'normal', letterSpacing:tab===k?0:'0.12em', cursor:'pointer' }}>{tab===k?l:l.toUpperCase()}</button>
        ))}
      </div>

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
