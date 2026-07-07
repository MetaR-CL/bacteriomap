import React from 'react'
import { T } from '../data.js'
import { useAdminBacteria } from '../../../hooks/useAdminBacteria.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'
import { useAdminMilieux } from '../../../hooks/useAdminMilieux.js'
import { gramColor } from '../shared.jsx'
import { supabase } from '../../../lib/supabase.js'
import { SheetView } from '../SheetScreen.jsx'

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

const LIST_MIN = 160; const LIST_MAX = 360; const LIST_DEFAULT = 220
const PREVIEW_MIN = 260; const PREVIEW_MAX = 600; const PREVIEW_DEFAULT = 380

function EyeOpen() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOff() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// Resizable column drag handle
function DragHandle({ onDelta }) {
  const [active, setActive] = React.useState(false)

  const onMouseDown = (e) => {
    e.preventDefault()
    let lastX = e.clientX
    setActive(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev) => {
      onDelta(ev.clientX - lastX)
      lastX = ev.clientX
    }
    const onUp = () => {
      setActive(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      style={{ width: 8, flexShrink: 0, cursor: 'col-resize', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ width: active ? 2 : 1, height: '100%', background: active ? 'var(--accent)' : 'var(--ruleSoft)' }}/>
    </div>
  )
}

// Section title with optional visibility toggle (eye) and collapse accordion toggle
function SectionTitle({ children, fieldKey, isHidden, onToggle, sectionKey, collapsed, onCollapse }) {
  return (
    <div
      onClick={sectionKey ? () => onCollapse(sectionKey) : undefined}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em',
        marginTop: 28, marginBottom: collapsed ? 0 : 12, paddingTop: 20, borderTop: '1px solid var(--ruleSoft)',
        cursor: sectionKey ? 'pointer' : 'default',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {sectionKey && (
          <span style={{ fontSize: 8, opacity: 0.5, display: 'inline-block', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
        )}
        {children}
      </span>
      {fieldKey && onToggle && (
        <button
          onClick={e => { e.stopPropagation(); onToggle(fieldKey) }}
          title={isHidden ? 'Afficher sur la fiche publique' : 'Masquer sur la fiche publique'}
          style={{ background: 'transparent', border: `1px solid ${isHidden ? 'var(--red)' : 'var(--rule)'}`, color: isHidden ? 'var(--red)' : 'var(--ink3)', padding: '2px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, lineHeight: 1, flexShrink: 0 }}
        >
          {isHidden ? <EyeOff /> : <EyeOpen />}
        </button>
      )}
    </div>
  )
}

function Field({ label, hint, wide, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: wide ? '1fr' : 'minmax(90px, 140px) 1fr', gap: wide ? 6 : 12, alignItems: 'baseline', padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)' }}>
      <div>
        <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'var(--ink2)', letterSpacing: '0.08em' }}>{label}</div>
        {hint && <div style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontSize: 11, color: 'var(--ink3)' }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
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
  const { bacteria, loading: bactLoading, upsert, duplicate, remove, uploadImage, deleteImage } = useAdminBacteria()
  const { systems, loading: sysLoading } = useAdminSystems()
  const { milieux } = useAdminMilieux()

  const [selectedId, setSelectedId] = React.useState(() => {
    const v = sessionStorage.getItem('admin_bacteria_id')
    return v ? Number(v) : null
  })
  const [previewOpen, setPreviewOpen] = React.useState(() => window.innerWidth >= 1200)
  const [draft, setDraft]           = React.useState(null)
  const draftRef                    = React.useRef(null)
  const [search, setSearch]         = React.useState('')

  // Column widths — persisted to localStorage (survive tab close and admin navigation)
  const [listWidth, setListWidth] = React.useState(() => {
    const v = localStorage.getItem('admin_bacteria_list_w')
    return v ? Math.max(LIST_MIN, Math.min(LIST_MAX, Number(v))) : LIST_DEFAULT
  })
  const [previewWidth, setPreviewWidth] = React.useState(() => {
    const v = localStorage.getItem('admin_bacteria_preview_w')
    return v ? Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, Number(v))) : PREVIEW_DEFAULT
  })
  React.useEffect(() => { localStorage.setItem('admin_bacteria_list_w', listWidth) }, [listWidth])
  React.useEffect(() => { localStorage.setItem('admin_bacteria_preview_w', previewWidth) }, [previewWidth])

  // Collapsible form sections — persisted to localStorage
  const [collapsedSections, setCollapsedSections] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('admin_bacteria_collapsed') || '[]')) }
    catch { return new Set() }
  })
  const toggleSection = (key) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      localStorage.setItem('admin_bacteria_collapsed', JSON.stringify([...next]))
      return next
    })
  }
  const isCollapsed = (key) => collapsedSections.has(key)

  // Autosave state
  const [saveStatus, setSaveStatus] = React.useState('idle') // 'idle'|'pending'|'saving'|'saved'|'error'
  const [savedTime,  setSavedTime]  = React.useState('')
  const [saveError,  setSaveError]  = React.useState('')
  const debounceRef   = React.useRef(null)
  const pendingRef    = React.useRef(false)
  const isLoadingRef  = React.useRef(false)

  // Image upload busy
  const [imgBusy, setImgBusy] = React.useState(false)
  const [duplicating, setDuplicating] = React.useState(null) // id being duplicated

  // Zone memberships — from junction table (not draft.zone_ids)
  const [zoneLinkedIds, setZoneLinkedIds] = React.useState(new Set())

  // Drag & drop for inline arrays
  const dragArrayRef = React.useRef({ from: null, to: null, field: null })
  const [dragOverArray, setDragOverArray] = React.useState({ field: null, idx: null })

  const makeArrayDrag = (field) => ({
    onDragStart: (i) => { dragArrayRef.current = { from: i, to: i, field } },
    onDragOver: (e, i) => { e.preventDefault(); setDragOverArray({ field, idx: i }); dragArrayRef.current.to = i },
    onDrop: () => {
      const { from, to, field: f } = dragArrayRef.current
      setDragOverArray({ field: null, idx: null })
      dragArrayRef.current = { from: null, to: null, field: null }
      if (from === null || to === null || from === to || f !== field) return
      setDraft(p => {
        const arr = [...(p[f] || [])]
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        return { ...p, [f]: arr }
      })
    },
    onDragEnd: () => {
      setDragOverArray({ field: null, idx: null })
      dragArrayRef.current = { from: null, to: null, field: null }
    },
  })

  React.useEffect(() => { draftRef.current = draft }, [draft])

  // ── Core save function (via ref to always get latest upsert) ──────────────
  const saveImplRef = React.useRef(null)
  saveImplRef.current = async (data) => {
    if (!data?.id) return
    setSaveStatus('saving')
    try {
      await upsert(data)
      const now = new Date()
      setSavedTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`)
      setSaveStatus('saved')
      pendingRef.current = false
    } catch (err) {
      setSaveError(err.message || 'Erreur réseau')
      setSaveStatus('error')
    }
  }

  const flushSave = React.useCallback((data) => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
    return saveImplRef.current(data)
  }, [])

  const scheduleSave = React.useCallback((data) => {
    if (!data?.id) return
    pendingRef.current = true
    setSaveStatus('pending')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveImplRef.current(data), 800)
  }, [])

  React.useEffect(() => {
    if (isLoadingRef.current) { isLoadingRef.current = false; return }
    scheduleSave(draft)
  }, [draft]) // eslint-disable-line

  React.useEffect(() => {
    const handler = () => { if (pendingRef.current && draftRef.current) flushSave(draftRef.current) }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [flushSave])

  const filtered = bacteria.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  React.useEffect(() => {
    if (bacteria.length === 0) return
    if (selectedId) {
      const found = bacteria.find(b => b.id === selectedId)
      if (found && !draft) selectBact(found)
      else if (!found) selectBact(bacteria[0])
    } else {
      selectBact(bacteria[0])
    }
  }, [bacteria.length]) // eslint-disable-line

  const selectBact = (b) => {
    if (pendingRef.current && draftRef.current) flushSave(draftRef.current)
    isLoadingRef.current = true
    const { bacterio_images: _, ...fields } = b
    sessionStorage.setItem('admin_bacteria_id', b.id)
    setSelectedId(b.id)
    setDraft(fields)
    setSaveStatus('idle')
    setSaveError('')
  }

  React.useEffect(() => {
    if (!selectedId) { setZoneLinkedIds(new Set()); return }
    supabase
      .from('bacterio_zone_bacteria')
      .select('zone_id')
      .eq('bacteria_id', selectedId)
      .then(({ data }) => setZoneLinkedIds(new Set((data || []).map(r => Number(r.zone_id)))))
  }, [selectedId])

  const current = bacteria.find(b => b.id === selectedId) || null
  const images  = current?.bacterio_images || []
  const d       = draft || {}

  const isHiddenField = (key) => (d.hidden_fields || []).includes(key)

  const toggleHidden = async (key) => {
    const cur = draftRef.current?.hidden_fields || []
    const next = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]
    setDraft(p => ({ ...p, hidden_fields: next }))
    if (draftRef.current?.id) {
      await supabase.from('bacterio_bacteria').update({ hidden_fields: next }).eq('id', draftRef.current.id)
    }
  }

  const addBact = async () => {
    const row = { name: `Nouvelle bactérie ${bacteria.length + 1}`, type: 'bacterie', gram: 'positif', morphology: 'cocci-cluster', shape: 'cocci en amas' }
    setSaveStatus('saving')
    try {
      const id = await upsert(row)
      if (id) {
        isLoadingRef.current = true
        setSelectedId(id)
        setDraft({ ...row, id })
        setSaveStatus('saved')
        const now = new Date()
        setSavedTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`)
      }
    } catch (err) {
      setSaveError(err.message)
      setSaveStatus('error')
    }
  }

  const handleDuplicate = async (b, e) => {
    e.stopPropagation()
    setDuplicating(b.id)
    try {
      const newId = await duplicate(b)
      // bacteria state will update via the hook's load(); store the id and
      // let the useEffect below open it once the list refreshes
      if (newId) {
        sessionStorage.setItem('admin_bacteria_id', newId)
        setSelectedId(newId)
        setDraft(null) // will be filled by the useEffect when list reloads
      }
    } catch (err) {
      setSaveError(err.message); setSaveStatus('error')
    } finally {
      setDuplicating(null)
    }
  }

  const deleteBact = async () => {
    if (!current) return
    if (!confirm(`Êtes-vous sûr ? La fiche « ${current.name} » sera définitivement supprimée.`)) return
    try { await remove(current.id); setSelectedId(null); setDraft(null); setSaveStatus('idle') }
    catch (err) { setSaveError(err.message); setSaveStatus('error') }
  }

  // ── Status bar ──────────────────────────────────────────────────────────────
  const statusBar = (
    <div style={{ height: 20, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {saveStatus === 'pending'  && <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: T.ink3 }}>EN ATTENTE…</span>}
      {saveStatus === 'saving'   && <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: T.ink3 }}>ENREGISTREMENT…</span>}
      {saveStatus === 'saved'    && <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: T.ink3 }}>ENREGISTRÉ · {savedTime}</span>}
      {saveStatus === 'error'    && (
        <>
          <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--red)' }}>ERREUR —</span>
          <button onClick={() => flushSave(draftRef.current)} style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>RÉESSAYER</button>
          {saveError && <span style={{ fontFamily: T.mono, fontSize: 8, color: 'var(--red)', opacity: 0.7 }}>({saveError})</span>}
        </>
      )}
    </div>
  )

  // ── List panel ──────────────────────────────────────────────────────────────
  const listPanel = (
    <div style={{ width: listWidth, flexShrink: 0, minWidth: LIST_MIN }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Bactéries</h2>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.1em', flex: 1, textAlign: 'right' }}>{filtered.length}/{bacteria.length}</span>
      </div>
      <button onClick={addBact} style={{ ...primaryBtn, width: '100%', padding: '9px 12px', marginBottom: 10 }}>
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
        <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, maxHeight: 'min(calc(100vh - 280px), 600px)', overflowY: 'auto' }}>
          {filtered.map((b, i) => {
            const c = gramColor(b.gram)
            const isSel = current?.id === b.id
            return (
              <div key={b.id} onClick={() => selectBact(b)} style={{ padding: '10px 14px', borderBottom: i < filtered.length - 1 ? `1px solid var(--ruleSoft)` : 'none', cursor: 'pointer', background: isSel ? T.bg : 'transparent', borderLeft: isSel ? `3px solid ${c.stroke}` : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.stroke, flexShrink: 0 }}/>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, fontWeight: 500, color: T.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                <button
                  onClick={(e) => handleDuplicate(b, e)}
                  disabled={duplicating === b.id}
                  title="Dupliquer cette fiche"
                  style={{ background: 'none', border: `1px solid var(--ruleSoft)`, color: T.ink3, cursor: 'pointer', padding: '1px 5px', fontFamily: T.mono, fontSize: 10, flexShrink: 0, opacity: duplicating === b.id ? 0.4 : 1 }}
                >⧉</button>
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
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic', margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</h2>
      </div>

      {statusBar}

      <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '24px 28px' }}>

        {/* IDENTITÉ */}
        <SectionTitle sectionKey="s_identite" collapsed={isCollapsed('s_identite')} onCollapse={toggleSection}>IDENTITÉ</SectionTitle>
        {!isCollapsed('s_identite') && (
          <>
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
          </>
        )}

        {/* MICROSCOPIE & CULTURE */}
        <SectionTitle fieldKey="microscopie" isHidden={isHiddenField('microscopie')} onToggle={toggleHidden} sectionKey="s_microscopie" collapsed={isCollapsed('s_microscopie')} onCollapse={toggleSection}>MICROSCOPIE &amp; CULTURE</SectionTitle>
        {!isCollapsed('s_microscopie') && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[['catalase','Catalase'],['oxydase','Oxydase'],['coagulase','Coagulase'],['sporulation','Sporulation']].map(([k,l]) => (
                <Field key={k} label={l}>
                  <BoolSelect value={d[k]} onChange={v => setDraft(p => ({ ...p, [k]: v }))}/>
                </Field>
              ))}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 10 }}>TESTS SUPPLÉMENTAIRES</div>
            {(d.tests_rapides || []).map((t, i) => {
              const drag = makeArrayDrag('tests_rapides')
              const isOver = dragOverArray.field === 'tests_rapides' && dragOverArray.idx === i && dragArrayRef.current.from !== i
              return (
                <div key={i} draggable onDragStart={() => drag.onDragStart(i)} onDragOver={e => drag.onDragOver(e, i)} onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
                  style={{ display: 'grid', gridTemplateColumns: 'auto 1fr minmax(70px, 120px) auto', gap: 8, marginBottom: 8, alignItems: 'center', borderTop: isOver ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none' }}>⠿</span>
                  <input type="text" placeholder="Nom du test" value={t.name || ''} onChange={e => { const n = (d.tests_rapides || []).map((x,j) => j===i ? {...x,name:e.target.value} : x); setDraft(p => ({...p,tests_rapides:n})) }} style={{...inpStyle, minWidth: 0}}/>
                  <input type="text" placeholder="Valeur" value={t.value || ''} onChange={e => { const n = (d.tests_rapides || []).map((x,j) => j===i ? {...x,value:e.target.value} : x); setDraft(p => ({...p,tests_rapides:n})) }} style={{...inpStyle, minWidth: 0, width: 100}}/>
                  <button onClick={() => setDraft(p => ({...p, tests_rapides: (p.tests_rapides||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
                </div>
              )
            })}
            <button onClick={() => setDraft(p => ({...p, tests_rapides: [...(p.tests_rapides||[]),{name:'',value:''}]}))} style={{...ghostBtn, fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter un test</button>
          </>
        )}

        {/* MILIEUX */}
        <SectionTitle fieldKey="milieux" isHidden={isHiddenField('milieux')} onToggle={toggleHidden} sectionKey="s_milieux" collapsed={isCollapsed('s_milieux')} onCollapse={toggleSection}>MILIEUX</SectionTitle>
        {!isCollapsed('s_milieux') && (
          milieux.length === 0 ? (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 13 }}>Aucun milieu configuré.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Checked milieux — draggable ordered list */}
              {(d.milieux || []).map((m, i) => {
                const drag = makeArrayDrag('milieux')
                const isOver = dragOverArray.field === 'milieux' && dragOverArray.idx === i && dragArrayRef.current.from !== i
                return (
                  <div key={m.name} draggable onDragStart={() => drag.onDragStart(i)} onDragOver={e => drag.onDragOver(e, i)} onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px dotted var(--ruleSoft)`, borderTop: isOver ? '2px solid var(--accent)' : '2px solid transparent' }}>
                    <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none', flexShrink: 0 }}>⠿</span>
                    <input type="checkbox" checked onChange={() => setDraft(p => ({...p, milieux: (p.milieux||[]).filter(x => x.name !== m.name)}))}/>
                    <span style={{ fontFamily: T.serif, fontSize: 14, color: T.ink, minWidth: 120, flexShrink: 0 }}>{m.name}</span>
                    <input type="text" placeholder="Note…" value={m.note || ''} onChange={e => setDraft(p => ({...p, milieux: (p.milieux||[]).map(x => x.name===m.name ? {...x, note:e.target.value} : x)}))} style={{ ...inpStyle, flex: 1, padding: '4px 8px', fontSize: 12 }}/>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.mono, fontSize: 10, color: T.ink2, cursor: 'pointer', flexShrink: 0 }}>
                      <input type="checkbox" checked={!!m.primary} onChange={e => setDraft(p => ({...p, milieux: (p.milieux||[]).map(x => x.name===m.name ? {...x, primary:e.target.checked} : x)}))}/>
                      Primaire
                    </label>
                  </div>
                )
              })}
              {/* Unchecked milieux — just checkboxes to add */}
              {milieux.filter(m => !(d.milieux||[]).find(x => x.name === m.name)).map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: `1px dotted var(--ruleSoft)`, opacity: 0.6 }}>
                  <span style={{ width: 14, flexShrink: 0 }}/>
                  <input type="checkbox" checked={false} onChange={() => setDraft(p => ({...p, milieux: [...(p.milieux||[]), {name: m.name, note: '', primary: false}]}))}/>
                  <span style={{ fontFamily: T.serif, fontSize: 14, color: T.ink, minWidth: 120 }}>{m.name}</span>
                </div>
              ))}
            </div>
          )
        )}

        {/* IDENTIFICATION */}
        <SectionTitle fieldKey="identif" isHidden={isHiddenField('identif')} onToggle={toggleHidden} sectionKey="s_identif" collapsed={isCollapsed('s_identif')} onCollapse={toggleSection}>IDENTIFICATION</SectionTitle>
        {!isCollapsed('s_identif') && (
          <>
            <textarea value={d.identif || ''} onChange={e => setDraft(p => ({...p, identif: e.target.value}))} rows={3} placeholder="Méthodes d'identification…" style={taStyle}/>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
          </>
        )}

        {/* SIGNIFICATION CLINIQUE */}
        <SectionTitle fieldKey="clinique" isHidden={isHiddenField('clinique')} onToggle={toggleHidden} sectionKey="s_clinique" collapsed={isCollapsed('s_clinique')} onCollapse={toggleSection}>SIGNIFICATION CLINIQUE</SectionTitle>
        {!isCollapsed('s_clinique') && (
          <>
            <textarea value={d.clinical_info || ''} onChange={e => setDraft(p=>({...p,clinical_info:e.target.value}))} rows={3} style={taStyle}/>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
          </>
        )}

        {/* TRAITEMENT ANTIBIOTIQUE */}
        <SectionTitle fieldKey="antibio" isHidden={isHiddenField('antibio')} onToggle={toggleHidden} sectionKey="s_antibio" collapsed={isCollapsed('s_antibio')} onCollapse={toggleSection}>TRAITEMENT ANTIBIOTIQUE</SectionTitle>
        {!isCollapsed('s_antibio') && (
          <>
            <textarea value={d.antibio || ''} onChange={e => setDraft(p=>({...p,antibio:e.target.value}))} rows={3} style={taStyle}/>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
          </>
        )}

        {/* ANTIBIOGRAMME */}
        <SectionTitle fieldKey="antibiogramme" isHidden={isHiddenField('antibiogramme')} onToggle={toggleHidden} sectionKey="s_antibiogramme" collapsed={isCollapsed('s_antibiogramme')} onCollapse={toggleSection}>ANTIBIOGRAMME</SectionTitle>
        {!isCollapsed('s_antibiogramme') && (
          <>
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
          </>
        )}

        {/* RÉSISTANCES NATURELLES */}
        <SectionTitle fieldKey="resist_nat" isHidden={isHiddenField('resist_nat')} onToggle={toggleHidden} sectionKey="s_resist_nat" collapsed={isCollapsed('s_resist_nat')} onCollapse={toggleSection}>RÉSISTANCES NATURELLES</SectionTitle>
        {!isCollapsed('s_resist_nat') && (
          <>
            {(d.resist_nat || []).map((item, i) => {
              const drag = makeArrayDrag('resist_nat')
              const isOver = dragOverArray.field === 'resist_nat' && dragOverArray.idx === i && dragArrayRef.current.from !== i
              return (
                <div key={i} draggable onDragStart={() => drag.onDragStart(i)} onDragOver={e => drag.onDragOver(e, i)} onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
                  style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', borderTop: isOver ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none', flexShrink: 0 }}>⠿</span>
                  <input type="text" value={item} onChange={e => { const n = (d.resist_nat||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_nat:n})) }} style={{...inpStyle,flex:1}}/>
                  <button onClick={() => setDraft(p=>({...p,resist_nat:(p.resist_nat||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
                </div>
              )
            })}
            <button onClick={() => setDraft(p=>({...p,resist_nat:[...(p.resist_nat||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>
          </>
        )}

        {/* RÉSISTANCES ACQUISES */}
        <SectionTitle fieldKey="resist_acq" isHidden={isHiddenField('resist_acq')} onToggle={toggleHidden} sectionKey="s_resist_acq" collapsed={isCollapsed('s_resist_acq')} onCollapse={toggleSection}>RÉSISTANCES ACQUISES</SectionTitle>
        {!isCollapsed('s_resist_acq') && (
          <>
            {(d.resist_acq || []).map((item, i) => {
              const drag = makeArrayDrag('resist_acq')
              const isOver = dragOverArray.field === 'resist_acq' && dragOverArray.idx === i && dragArrayRef.current.from !== i
              return (
                <div key={i} draggable onDragStart={() => drag.onDragStart(i)} onDragOver={e => drag.onDragOver(e, i)} onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
                  style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', borderTop: isOver ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none', flexShrink: 0 }}>⠿</span>
                  <input type="text" value={item} onChange={e => { const n = (d.resist_acq||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,resist_acq:n})) }} style={{...inpStyle,flex:1}}/>
                  <button onClick={() => setDraft(p=>({...p,resist_acq:(p.resist_acq||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
                </div>
              )
            })}
            <button onClick={() => setDraft(p=>({...p,resist_acq:[...(p.resist_acq||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>
          </>
        )}

        {/* FACTEURS DE VIRULENCE */}
        <SectionTitle fieldKey="virulence" isHidden={isHiddenField('virulence')} onToggle={toggleHidden} sectionKey="s_virulence" collapsed={isCollapsed('s_virulence')} onCollapse={toggleSection}>FACTEURS DE VIRULENCE</SectionTitle>
        {!isCollapsed('s_virulence') && (
          <>
            {(d.virulence || []).map((item, i) => {
              const drag = makeArrayDrag('virulence')
              const isOver = dragOverArray.field === 'virulence' && dragOverArray.idx === i && dragArrayRef.current.from !== i
              return (
                <div key={i} draggable onDragStart={() => drag.onDragStart(i)} onDragOver={e => drag.onDragOver(e, i)} onDrop={drag.onDrop} onDragEnd={drag.onDragEnd}
                  style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center', borderTop: isOver ? '2px solid var(--accent)' : '2px solid transparent' }}>
                  <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none', flexShrink: 0 }}>⠿</span>
                  <input type="text" value={item} onChange={e => { const n = (d.virulence||[]).map((x,j)=>j===i?e.target.value:x); setDraft(p=>({...p,virulence:n})) }} style={{...inpStyle,flex:1}}/>
                  <button onClick={() => setDraft(p=>({...p,virulence:(p.virulence||[]).filter((_,j)=>j!==i)}))} style={{...arrowBtn,color:'var(--red)'}}>×</button>
                </div>
              )
            })}
            <button onClick={() => setDraft(p=>({...p,virulence:[...(p.virulence||[]),'']}))} style={{...ghostBtn,fontSize:10,letterSpacing:'0.1em'}}>+ Ajouter</button>
          </>
        )}

        {/* REMARQUES */}
        <SectionTitle fieldKey="commentaire" isHidden={isHiddenField('commentaire')} onToggle={toggleHidden} sectionKey="s_commentaire" collapsed={isCollapsed('s_commentaire')} onCollapse={toggleSection}>REMARQUES</SectionTitle>
        {!isCollapsed('s_commentaire') && (
          <>
            <textarea value={d.commentaire || ''} onChange={e => setDraft(p=>({...p,commentaire:e.target.value}))} rows={3} placeholder="Notes libres…" style={taStyle}/>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
          </>
        )}

        {/* ZONES ASSOCIÉES */}
        <SectionTitle sectionKey="s_zones" collapsed={isCollapsed('s_zones')} onCollapse={toggleSection}>ZONES ASSOCIÉES</SectionTitle>
        {!isCollapsed('s_zones') && (
          sysLoading ? (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des zones…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {systems.map(sys => {
                const zones = [...(sys.bacterio_zones || [])].sort((a, b) => a.position - b.position)
                if (!zones.length) return null
                return (
                  <div key={sys.id}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: sys.color || T.ink2, letterSpacing: '0.1em', marginBottom: 8 }}>{sys.name.toUpperCase()}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {zones.map(z => {
                        const zid = Number(z.id)
                        const checked = zoneLinkedIds.has(zid)
                        return (
                          <label key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.serif, fontSize: 13, color: T.ink2, cursor: 'pointer' }}>
                            <input type="checkbox" checked={checked} onChange={async () => {
                              if (checked) {
                                setZoneLinkedIds(s => { const n = new Set(s); n.delete(zid); return n })
                                await supabase.from('bacterio_zone_bacteria').delete().eq('zone_id', zid).eq('bacteria_id', selectedId)
                              } else {
                                const { data: ex } = await supabase.from('bacterio_zone_bacteria').select('ordre').eq('zone_id', zid).order('ordre', { ascending: false }).limit(1)
                                const ordre = ex?.length ? (ex[0].ordre + 1) : 0
                                setZoneLinkedIds(s => new Set([...s, zid]))
                                await supabase.from('bacterio_zone_bacteria').insert({ zone_id: zid, bacteria_id: selectedId, ordre })
                              }
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
          )
        )}

        {/* FLORE COMMENSALE */}
        <SectionTitle sectionKey="s_flora" collapsed={isCollapsed('s_flora')} onCollapse={toggleSection}>FLORE COMMENSALE</SectionTitle>
        {!isCollapsed('s_flora') && (
          sysLoading ? (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des zones…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
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
                              const next = e.target.checked ? [...cur, Number(z.id)] : cur.filter(id => id !== Number(z.id))
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
          )
        )}

        {/* IMAGES */}
        <SectionTitle fieldKey="images" isHidden={isHiddenField('images')} onToggle={toggleHidden} sectionKey="s_images" collapsed={isCollapsed('s_images')} onCollapse={toggleSection}>IMAGES</SectionTitle>
        {!isCollapsed('s_images') && (
          <>
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                {images.map(img => (
                  <div key={img.id} style={{ background: T.paper, border: `0.5px solid ${T.rule}`, overflow: 'hidden', position: 'relative' }}>
                    <img src={img.url} alt={img.caption || ''} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}/>
                    <div style={{ padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{img.caption || '—'}</span>
                      <button onClick={async () => {
                        if (!confirm('Supprimer cette image ?')) return
                        setImgBusy(true)
                        try { await deleteImage(img.id, img.url) }
                        catch (err) { setSaveError(err.message); setSaveStatus('error') }
                        finally { setImgBusy(false) }
                      }} style={{ ...arrowBtn, color: 'var(--red)', marginLeft: 4 }}>×</button>
                    </div>
                    <div style={{ padding: '0 8px 6px' }}>
                      <input type="text" placeholder="Source (auteur, site, licence…)" defaultValue={img.source || ''} onBlur={async e => {
                        const val = e.target.value.trim()
                        if (val === (img.source || '')) return
                        await supabase.from('bacterio_images').update({ source: val || null }).eq('id', img.id)
                      }} style={{ width: '100%', fontFamily: T.mono, fontSize: 11, color: T.ink2, background: 'transparent', border: 'none', borderBottom: `1px solid var(--ruleSoft)`, outline: 'none', padding: '3px 0', boxSizing: 'border-box' }}/>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginTop: 6, marginBottom: 2 }}>LÉGENDE</div>
                      <input type="text" placeholder="ex. PL.1, Image 1…" defaultValue={img.legend || ''} onBlur={async e => {
                        const val = e.target.value.trim()
                        if (val === (img.legend || '')) return
                        await supabase.from('bacterio_images').update({ legend: val || null }).eq('id', img.id)
                      }} style={{ width: '100%', fontFamily: T.mono, fontSize: 11, color: T.ink2, background: 'transparent', border: 'none', borderBottom: `1px solid var(--ruleSoft)`, outline: 'none', padding: '3px 0', boxSizing: 'border-box' }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {d.id ? (
              <label style={{ display: 'inline-block', padding: '8px 14px', background: 'var(--accent)', color: 'var(--paper)', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', cursor: imgBusy ? 'wait' : 'pointer', opacity: imgBusy ? 0.6 : 1 }}>
                + Ajouter une image
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setImgBusy(true)
                  try { await uploadImage(d.id, file) }
                  catch (err) { setSaveError(err.message); setSaveStatus('error') }
                  finally { setImgBusy(false) }
                  e.target.value = ''
                }} style={{ display: 'none' }}/>
              </label>
            ) : (
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ink3 }}>Enregistrez d'abord la fiche pour pouvoir ajouter des images.</div>
            )}
          </>
        )}

        {/* DELETE */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid var(--ruleSoft)`, display: 'flex', alignItems: 'center' }}>
          <button onClick={deleteBact} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--red)', cursor: 'pointer' }}>
            Supprimer cette fiche
          </button>
        </div>

      </div>
    </div>
  ) : (
    <div style={{ flex: 1, minWidth: 280, fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40, textAlign: 'center' }}>
      Sélectionner une bactérie dans la liste, ou cliquer <strong>+ NOUVELLE BACTÉRIE</strong>.
    </div>
  )

  // ── Preview toggle button ────────────────────────────────────────────────
  const previewToggle = draft ? (
    <button
      onClick={() => setPreviewOpen(v => !v)}
      title={previewOpen ? 'Masquer la prévisualisation' : 'Afficher la prévisualisation'}
      style={{
        position: 'sticky', top: 20,
        alignSelf: 'flex-start',
        padding: '6px 10px',
        background: 'transparent',
        border: `1px solid ${T.rule}`,
        fontFamily: T.mono, fontSize: 9, letterSpacing: '0.12em', color: T.ink3,
        cursor: 'pointer', writingMode: 'vertical-rl', textOrientation: 'mixed', whiteSpace: 'nowrap',
      }}
    >
      {previewOpen ? '◂ PREVIEW' : '▸ PREVIEW'}
    </button>
  ) : null

  // ── Preview panel ────────────────────────────────────────────────────────
  const previewPanel = draft && previewOpen ? (
    <div style={{
      width: previewWidth, flexShrink: 0,
      border: `0.5px solid ${T.rule}`,
      background: T.bg,
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 120px)',
      position: 'sticky',
      top: 20,
    }}>
      <div style={{ padding: '8px 14px', background: T.paper, borderBottom: `0.5px solid ${T.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', color: T.ink3 }}>PRÉVISUALISATION</span>
        <span style={{ fontFamily: T.mono, fontSize: 8, color: T.ink3, opacity: 0.6 }}>live · non enregistré</span>
      </div>
      <SheetView b={draft} images={images} systemId="orl" compact />
    </div>
  ) : null

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* List column */}
      {listPanel}

      {/* Drag handle: list ↔ form */}
      <DragHandle onDelta={dx => setListWidth(w => Math.max(LIST_MIN, Math.min(LIST_MAX, w + dx)))} />

      {/* Form column */}
      <div style={{ flex: 1, minWidth: 280, paddingLeft: 12 }}>
        {formPanel}
      </div>

      {/* Drag handle: form ↔ preview (only when preview open) */}
      {draft && previewOpen && (
        <DragHandle onDelta={dx => setPreviewWidth(w => Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, w - dx)))} />
      )}

      {/* Preview toggle (always when editing) */}
      {previewToggle}

      {/* Preview panel */}
      {previewPanel}
    </div>
  )
}
