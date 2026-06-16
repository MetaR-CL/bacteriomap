import React from 'react'
import { T } from '../data.js'
import { useAdminBacteria } from '../../../hooks/useAdminBacteria.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'
import { useAdminMilieux } from '../../../hooks/useAdminMilieux.js'
import { gramColor } from '../shared.jsx'
import { supabase } from '../../../lib/supabase.js'

const primaryBtn = {
  padding: '8px 16px', background: 'var(--accent)', color: 'var(--paper)', border: 'none',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
}
const ghostBtn = {
  padding: '8px 16px', background: 'transparent', border: '1px solid var(--rule)',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink2)', cursor: 'pointer',
}
const inpStyle = {
  width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--rule)',
  fontFamily: '"Newsreader", serif', fontSize: 14, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
}
const selStyle = { ...inpStyle, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }
const taStyle = { ...inpStyle, fontFamily: '"Newsreader", serif', lineHeight: 1.55, resize: 'vertical' }
const arrowBtn = {
  width: 26, height: 26, padding: 0, border: '1px solid var(--rule)', background: 'var(--paper)',
  fontFamily: 'inherit', fontSize: 12, color: 'var(--ink2)', cursor: 'pointer', flexShrink: 0,
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', marginTop: 28, marginBottom: 12, paddingTop: 20, borderTop: '1px solid var(--ruleSoft)' }}>
      {children}
    </div>
  )
}

function Field({ label, hint, wide, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: wide ? '1fr' : '160px 1fr', gap: wide ? 6 : 14, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)' }}>
      <div>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'var(--ink2)', letterSpacing: '0.08em' }}>{label}</div>
        {hint && <div style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 11, color: 'var(--ink3)' }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toast({ success, error }) {
  return (
    <>
      {success && <div style={{ padding: '8px 12px', background: '#e8f5e9', border: '1px solid #81c784', fontFamily: 'var(--mono)', fontSize: 11, color: '#2e7d32', marginBottom: 12, letterSpacing: '0.04em' }}>✓ {success}</div>}
      {error && <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: 'var(--mono)', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {error}</div>}
    </>
  )
}

function BoolSelect({ value, onChange }) {
  const v = value === true ? 'true' : value === false ? 'false' : 'null'
  return (
    <select value={v} onChange={e => onChange(e.target.value === 'true' ? true : e.target.value === 'false' ? false : null)} style={selStyle}>
      <option value="null">— Inconnu</option>
      <option value="true">+ Positif</option>
      <option value="false">− Négatif</option>
    </select>
  )
}

export default function AdminBacteria() {
  const { bacteria, loading: bactLoading, upsert, remove, uploadImage, deleteImage } = useAdminBacteria()
  const { systems, loading: sysLoading } = useAdminSystems()
  const { milieux } = useAdminMilieux()

  const [selectedId, setSelectedId] = React.useState(null)
  const [draft, setDraft]           = React.useState(null)
  const draftRef                    = React.useRef(null)
  const [search, setSearch]         = React.useState('')
  const [saving, setSaving]         = React.useState(false)
  const [error, setError]           = React.useState(null)
  const [successMsg, setSuccessMsg] = React.useState(null)

  React.useEffect(() => { draftRef.current = draft }, [draft])

  const filtered = bacteria.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) selectBact(filtered[0])
  }, [bacteria.length]) // eslint-disable-line

  const selectBact = (b) => {
    const { bacterio_images: _, ...fields } = b
    setSelectedId(b.id)
    setDraft(fields)
    setError(null)
    setSuccessMsg(null)
  }

  const current = bacteria.find(b => b.id === selectedId) || null
  const images  = current?.bacterio_images || []
  const d       = draft || {}

  const flash = (msg) => {
    setError(null)
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const addBact = async () => {
    const row = { name: `Nouvelle bactérie ${bacteria.length + 1}`, type: 'bacterie', gram: 'positif', morphology: 'cocci-cluster', shape: 'cocci en amas', freq: 'fréquent', atmosphere: 'aéro-anaérobie facultatif', urgence: false, declaration: false, bsl3: false }
    setSaving(true); setError(null)
    try {
      const id = await upsert(row)
      if (id) { setSelectedId(id); setDraft({ ...row, id }); flash('Fiche créée') }
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleSave = async () => {
    if (!draftRef.current) return
    setSaving(true); setError(null)
    try {
      await upsert(draftRef.current)
      flash('Fiche enregistrée')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const deleteBact = async () => {
    if (!current) return
    if (!confirm(`Êtes-vous sûr ? La fiche « ${current.name} » sera définitivement supprimée.`)) return
    setError(null)
    try { await remove(current.id); setSelectedId(null); setDraft(null) }
    catch (err) { setError(err.message) }
  }

  // ── Left panel ──────────────────────────────────────────────────────────────
  const listPanel = (
    <div style={{ width: 280, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Bactéries</h2>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.1em', flex: 1, textAlign: 'right' }}>{filtered.length}/{bacteria.length}</span>
      </div>
      <button onClick={addBact} disabled={saving} style={{ ...primaryBtn, width: '100%', padding: '9px 12px', marginBottom: 10, opacity: saving ? 0.6 : 1 }}>
        + NOUVELLE BACTÉRIE
      </button>
      <input
        type="text"
        placeholder="Rechercher par nom…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...inpStyle, marginBottom: 10 }}
      />
      {bactLoading ? (
        <div style={{ padding: 24, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement…</div>
      ) : (
        <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
          {filtered.map((b, i) => {
            const c = gramColor(b.gram)
            const isSel = current?.id === b.id
            return (
              <div key={b.id} onClick={() => selectBact(b)} style={{ padding: '10px 14px', borderBottom: i < filtered.length - 1 ? `1px solid var(--ruleSoft)` : 'none', cursor: 'pointer', background: isSel ? T.bg : 'transparent', borderLeft: isSel ? `3px solid ${c.stroke}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.stroke, flexShrink: 0 }}/>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, fontWeight: 500, color: T.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: c.stroke, flexShrink: 0 }}>G{b.gram === 'positif' ? '+' : b.gram === 'negatif' ? '−' : b.gram === 'aucun' ? '*' : '?'}</span>
              </div>
            )
          })}
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Aucun résultat.</div>}
        </div>
      )}
    </div>
  )

  // ── Form panel ──────────────────────────────────────────────────────────────
  const formPanel = draft ? (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic', margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</h2>
      </div>

      <Toast success={successMsg} error={error}/>

      <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '24px 28px' }}>

        {/* IDENTITÉ */}
        <SectionTitle>IDENTITÉ</SectionTitle>
        <Field label="Nom">
          <input type="text" value={d.name || ''} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} style={{ ...inpStyle, fontStyle: 'italic' }}/>
        </Field>
        <Field label="Gram">
          <select value={d.gram || 'positif'} onChange={e => setDraft(p => ({ ...p, gram: e.target.value }))} style={selStyle}>
            <option value="positif">positif (Gram +)</option>
            <option value="negatif">négatif (Gram −)</option>
            <option value="variable">variable</option>
            <option value="aucun">aucun (fongique)</option>
          </select>
        </Field>
        <Field label="Type">
          <select value={d.type || 'bacterie'} onChange={e => setDraft(p => ({ ...p, type: e.target.value }))} style={selStyle}>
            <option value="bacterie">Bactérie</option>
            <option value="levure">Levure</option>
            <option value="moisissure">Moisissure</option>
          </select>
        </Field>
        <Field label="Morphologie">
          <select value={d.morphology || 'cocci-cluster'} onChange={e => setDraft(p => ({ ...p, morphology: e.target.value }))} style={selStyle}>
            {[['cocci-pairs','Cocci en paires'],['cocci-chains','Cocci en chaînettes'],['cocci-cluster','Cocci en amas'],['rod','Bacille'],['coccobacillus','Coccobacille'],['rod-bar','Bacille BAAR'],['yeast','Levure']].map(([k,l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label="Forme courte">
          <input type="text" value={d.shape || ''} onChange={e => setDraft(p => ({ ...p, shape: e.target.value }))} style={inpStyle}/>
        </Field>
        <Field label="Fréquence">
          <select value={d.freq || 'fréquent'} onChange={e => setDraft(p => ({ ...p, freq: e.target.value }))} style={selStyle}>
            {['fréquent','occasionnel','rare'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Atmosphère">
          <select value={d.atmosphere || 'aéro-anaérobie facultatif'} onChange={e => setDraft(p => ({ ...p, atmosphere: e.target.value }))} style={selStyle}>
            {['aérobie strict','anaérobie strict','aéro-anaérobie facultatif','micro-aérophile'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Drapeaux">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', paddingTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 14, color: T.ink2, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!d.urgence} onChange={e => setDraft(p => ({ ...p, urgence: e.target.checked }))}/>
              Urgence
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 14, color: T.ink2, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!d.declaration} onChange={e => setDraft(p => ({ ...p, declaration: e.target.checked }))}/>
              Déclaration obligatoire
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 14, color: T.ink2, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!d.bsl3} onChange={e => setDraft(p => ({ ...p, bsl3: e.target.checked }))}/>
              BSL3
            </label>
          </div>
        </Field>

        {/* TESTS RAPIDES */}
        <SectionTitle>TESTS RAPIDES</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          {[['catalase','Catalase'],['oxydase','Oxydase'],['coagulase','Coagulase'],['sporulation','Sporulation']].map(([k,l]) => (
            <Field key={k} label={l}>
              <BoolSelect value={d[k]} onChange={v => setDraft(p => ({ ...p, [k]: v }))}/>
            </Field>
          ))}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 10 }}>TESTS SUPPLÉMENTAIRES</div>
        {(d.tests_rapides || []).map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input type="text" placeholder="Nom du test" value={t.name || ''} onChange={e => { const n = (d.tests_rapides || []).map((x,j) => j===i ? {...x,name:e.target.value} : x); setDraft(p => ({...p,tests_rapides:n})) }} style={inpStyle}/>
            <input type="text" placeholder="Valeur" value={t.value || ''} onChange={e => { const n = (d.tests_rapides || []).map((x,j) => j===i ? {...x,value:e.target.value} : x); setDraft(p => ({...p,tests_rapides:n})) }} style={inpStyle}/>
            <button onClick={() => setDraft(p => ({...p, tests_rapides: (p.tests_rapides||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p => ({...p, tests_rapides: [...(p.tests_rapides||[]),{name:'',value:''}]}))} style={{...ghostBtn, fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter un test</button>

        {/* MILIEUX */}
        <SectionTitle>MILIEUX UTILISÉS</SectionTitle>
        {milieux.length === 0 ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 13 }}>Aucun milieu configuré.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milieux.map(m => {
              const existing = (d.milieux || []).find(x => x.name === m.name)
              const isChecked = !!existing
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px dotted var(--ruleSoft)` }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => {
                      if (e.target.checked) {
                        setDraft(p => ({...p, milieux: [...(p.milieux||[]), {name: m.name, note: '', primary: false}]}))
                      } else {
                        setDraft(p => ({...p, milieux: (p.milieux||[]).filter(x => x.name !== m.name)}))
                      }
                    }}
                  />
                  <span style={{ fontFamily: T.serif, fontSize: 14, color: T.ink, minWidth: 180 }}>{m.name}</span>
                  {isChecked && (
                    <>
                      <input
                        type="text"
                        placeholder="Note…"
                        value={existing.note || ''}
                        onChange={e => setDraft(p => ({...p, milieux: (p.milieux||[]).map(x => x.name===m.name ? {...x, note:e.target.value} : x)}))}
                        style={{ ...inpStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.mono, fontSize: 10, color: T.ink2, cursor: 'pointer', flexShrink: 0 }}>
                        <input
                          type="checkbox"
                          checked={!!existing.primary}
                          onChange={e => setDraft(p => ({...p, milieux: (p.milieux||[]).map(x => x.name===m.name ? {...x, primary:e.target.checked} : x)}))}
                        />
                        Primaire
                      </label>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* IDENTIFICATION */}
        <SectionTitle>IDENTIFICATION</SectionTitle>
        <textarea
          value={d.identif || ''}
          onChange={e => setDraft(p => ({...p, identif: e.target.value}))}
          rows={3}
          placeholder="Méthodes d'identification…"
          style={taStyle}
        />
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>

        {/* RÉSISTANCES NATURELLES */}
        <SectionTitle>RÉSISTANCES NATURELLES</SectionTitle>
        {(d.resist_nat || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="text" value={item} onChange={e => { const n = (d.resist_nat||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_nat:n})) }} style={{...inpStyle,flex:1}}/>
            <button onClick={() => setDraft(p=>({...p,resist_nat:(p.resist_nat||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,resist_nat:[...(p.resist_nat||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>

        {/* RÉSISTANCES ACQUISES */}
        <SectionTitle>RÉSISTANCES ACQUISES</SectionTitle>
        {(d.resist_acq || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="text" value={item} onChange={e => { const n = (d.resist_acq||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_acq:n})) }} style={{...inpStyle,flex:1}}/>
            <button onClick={() => setDraft(p=>({...p,resist_acq:(p.resist_acq||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,resist_acq:[...(p.resist_acq||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>

        {/* VIRULENCE */}
        <SectionTitle>VIRULENCE</SectionTitle>
        {(d.virulence || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="text" value={item} onChange={e => { const n = (d.virulence||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,virulence:n})) }} style={{...inpStyle,flex:1}}/>
            <button onClick={() => setDraft(p=>({...p,virulence:(p.virulence||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
          </div>
        ))}
        <button onClick={() => setDraft(p=>({...p,virulence:[...(p.virulence||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>

        {/* CLINIQUE & TRAITEMENT */}
        <SectionTitle>CLINIQUE &amp; TRAITEMENT</SectionTitle>
        <Field label="Description clinique" wide>
          <textarea value={d.clinical_info || ''} onChange={e => setDraft(p=>({...p,clinical_info:e.target.value}))} rows={3} style={taStyle}/>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
        </Field>
        <Field label="Traitement antibiotique" wide>
          <textarea value={d.antibio || ''} onChange={e => setDraft(p=>({...p,antibio:e.target.value}))} rows={3} style={taStyle}/>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
        </Field>

        {/* ANTIBIOGRAMME */}
        <SectionTitle>ANTIBIOGRAMME</SectionTitle>
        {(d.antibiogramme || []).length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead>
              <tr>
                <th style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', textAlign: 'left', padding: '6px 8px', borderBottom: `1px solid var(--rule)` }}>ANTIBIOTIQUE</th>
                <th style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', textAlign: 'left', padding: '6px 8px', borderBottom: `1px solid var(--rule)`, width: 160 }}>SENSIBILITÉ</th>
                <th style={{ width: 34, borderBottom: `1px solid var(--rule)` }}/>
              </tr>
            </thead>
            <tbody>
              {(d.antibiogramme || []).map((row, i) => {
                const sensColor = row.sens === 'S' ? '#2d6a4f' : row.sens === 'R' ? '#c00' : '#9a6b1f'
                return (
                  <tr key={i} style={{ borderBottom: `0.5px solid var(--ruleSoft)` }}>
                    <td style={{ padding: '4px 8px' }}>
                      <input type="text" value={row.ab || ''} onChange={e => { const n = (d.antibiogramme||[]).map((x,j)=>j===i?{...x,ab:e.target.value}:x); setDraft(p=>({...p,antibiogramme:n})) }} style={{ border: 'none', background: 'transparent', fontFamily: T.serif, fontSize: 14, color: T.ink, outline: 'none', width: '100%' }}/>
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <select value={row.sens || 'S'} onChange={e => { const n = (d.antibiogramme||[]).map((x,j)=>j===i?{...x,sens:e.target.value}:x); setDraft(p=>({...p,antibiogramme:n})) }} style={{...selStyle, color: sensColor}}>
                        <option value="S">S — Sensible</option>
                        <option value="I">I — Intermédiaire</option>
                        <option value="R">R — Résistant</option>
                      </select>
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                      <button onClick={() => setDraft(p=>({...p,antibiogramme:(p.antibiogramme||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <button onClick={() => setDraft(p=>({...p,antibiogramme:[...(p.antibiogramme||[]),{ab:'',sens:'S'}]}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter une ligne</button>

        {/* COMMENTAIRE */}
        <SectionTitle>COMMENTAIRE</SectionTitle>
        <textarea value={d.commentaire || ''} onChange={e => setDraft(p=>({...p,commentaire:e.target.value}))} rows={3} placeholder="Notes libres…" style={taStyle}/>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>

        {/* ZONES ASSOCIÉES */}
        <SectionTitle>ZONES ASSOCIÉES</SectionTitle>
        {sysLoading ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des zones…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {systems.map(sys => {
              const zones = [...(sys.bacterio_zones || [])].sort((a, b) => a.position - b.position)
              if (!zones.length) return null
              return (
                <div key={sys.id}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: sys.color || T.ink2, letterSpacing: '0.1em', marginBottom: 8 }}>{sys.name.toUpperCase()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {zones.map(z => {
                      const checked = (d.zone_ids || []).map(Number).includes(Number(z.id))
                      return (
                        <label key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 13, color: T.ink2, cursor: 'pointer' }}>
                          <input type="checkbox" checked={checked} onChange={e => {
                            const cur = (draftRef.current?.zone_ids || []).map(Number)
                            const next = e.target.checked
                              ? [...cur, Number(z.id)]
                              : cur.filter(id => id !== Number(z.id))
                            setDraft(p => ({...p, zone_ids: next}))
                          }}/>
                          {z.label || z.name}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FLORE COMMENSALE */}
        <SectionTitle>FLORE COMMENSALE</SectionTitle>
        {sysLoading ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des zones…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {systems.map(sys => {
              const zones = [...(sys.bacterio_zones || [])].sort((a, b) => a.position - b.position)
              if (!zones.length) return null
              return (
                <div key={sys.id}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: sys.color || T.ink2, letterSpacing: '0.1em', marginBottom: 8 }}>{sys.name.toUpperCase()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {zones.map(z => {
                      const checked = (d.flora_zone_ids || []).map(Number).includes(Number(z.id))
                      return (
                        <label key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 13, color: T.ink2, cursor: 'pointer' }}>
                          <input type="checkbox" checked={checked} onChange={e => {
                            const cur = (draftRef.current?.flora_zone_ids || []).map(Number)
                            const next = e.target.checked
                              ? [...cur, Number(z.id)]
                              : cur.filter(id => id !== Number(z.id))
                            setDraft(p => ({...p, flora_zone_ids: next}))
                          }}/>
                          {z.label || z.name}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* IMAGES */}
        <SectionTitle>IMAGES</SectionTitle>
        {images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {images.map(img => (
              <div key={img.id} style={{ background: T.paper, border: `0.5px solid ${T.rule}`, overflow: 'hidden', position: 'relative' }}>
                <img src={img.url} alt={img.caption || ''} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}/>
                <div style={{ padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{img.caption || '—'}</span>
                  <button onClick={async () => {
                    if (!confirm('Supprimer cette image ?')) return
                    setSaving(true); setError(null)
                    try { await deleteImage(img.id, img.url) }
                    catch (err) { setError(err.message) }
                    finally { setSaving(false) }
                  }} style={{ ...arrowBtn, color: 'var(--red)', marginLeft: 4 }}>×</button>
                </div>
                <div style={{ padding: '0 8px 6px' }}>
                  <input
                    type="text"
                    placeholder="Source (auteur, site, licence…)"
                    defaultValue={img.source || ''}
                    onBlur={async e => {
                      const val = e.target.value.trim()
                      if (val === (img.source || '')) return
                      await supabase.from('bacterio_images').update({ source: val || null }).eq('id', img.id)
                    }}
                    style={{ width: '100%', fontFamily: T.mono, fontSize: 11, color: T.ink2, background: 'transparent', border: 'none', borderBottom: `1px solid var(--ruleSoft)`, outline: 'none', padding: '3px 0', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginTop: 6, marginBottom: 2 }}>LÉGENDE</div>
                  <input
                    type="text"
                    placeholder="ex. PL.1, Image 1…"
                    defaultValue={img.legend || ''}
                    onBlur={async e => {
                      const val = e.target.value.trim()
                      if (val === (img.legend || '')) return
                      await supabase.from('bacterio_images').update({ legend: val || null }).eq('id', img.id)
                    }}
                    style={{ width: '100%', fontFamily: T.mono, fontSize: 11, color: T.ink2, background: 'transparent', border: 'none', borderBottom: `1px solid var(--ruleSoft)`, outline: 'none', padding: '3px 0', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {d.id && (
          <label style={{ display: 'inline-block', padding: '8px 14px', background: 'var(--accent)', color: 'var(--paper)', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer' }}>
            + Ajouter une image
            <input type="file" accept="image/*" onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              setSaving(true); setError(null)
              try { await uploadImage(d.id, file) }
              catch (err) { setError(err.message) }
              finally { setSaving(false) }
              e.target.value = ''
            }} style={{ display: 'none' }}/>
          </label>
        )}
        {!d.id && (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ink3 }}>Enregistrez d'abord la fiche pour pouvoir ajouter des images.</div>
        )}

        {/* SAVE + DELETE */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid var(--ruleSoft)`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, padding: '12px 32px', fontSize: 12, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'ENREGISTREMENT…' : 'Enregistrer la fiche'}
          </button>
          <span style={{ flex: 1 }}/>
          <button onClick={deleteBact} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--red)', cursor: 'pointer' }}>
            Supprimer cette fiche
          </button>
        </div>

      </div>
    </div>
  ) : (
    <div style={{ flex: 1, fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40, textAlign: 'center' }}>
      Sélectionner une bactérie dans la liste, ou cliquer <strong>+ NOUVELLE BACTÉRIE</strong>.
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {listPanel}
        {formPanel}
      </div>
    </div>
  )
}
