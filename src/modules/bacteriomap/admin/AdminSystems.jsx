import React from 'react'
import { T } from '../data.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'
import { supabase } from '../../../lib/supabase.js'

const primaryBtn = {
  padding: '8px 16px', background: 'var(--accent)', color: 'var(--paper)', border: 'none',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
}
const ghostBtn = {
  padding: '8px 16px', background: 'transparent', border: '1px solid var(--rule)',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink2)', cursor: 'pointer',
}
const dangerBtn = {
  padding: '8px 16px', background: 'transparent', border: '1px solid var(--red)',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--red)', cursor: 'pointer',
}
const inpStyle = {
  width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--rule)',
  fontFamily: '"Newsreader", serif', fontSize: 14, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
}
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

function Toast({ success, error }) {
  return (
    <>
      {success && (
        <div style={{ padding: '8px 12px', background: '#e8f5e9', border: '1px solid #81c784', fontFamily: 'var(--mono)', fontSize: 11, color: '#2e7d32', marginBottom: 12, letterSpacing: '0.04em' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: 'var(--mono)', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>
          ✗ {error}
        </div>
      )}
    </>
  )
}

export default function AdminSystems() {
  const { systems, loading, updateSystem, insertSystem, upsertZone, removeZone, removeSystem } = useAdminSystems()

  const [activeSys, setActiveSys]     = React.useState(() => {
    const v = sessionStorage.getItem('admin_systems_id')
    return v ? Number(v) : null
  })
  const [sysName, setSysName]         = React.useState('')
  const [sysShort, setSysShort]       = React.useState('')
  const [sysSubtitle, setSysSubtitle] = React.useState('')
  const [success, setSuccess]         = React.useState(null)
  const [error, setError]             = React.useState(null)
  const [zoneEdits, setZoneEdits]     = React.useState({})
  const [newZoneName, setNewZoneName] = React.useState('')
  const [showAddZone, setShowAddZone] = React.useState(false)

  // New system form
  const [showAddSys, setShowAddSys]   = React.useState(false)
  const [newSysName, setNewSysName]   = React.useState('')
  const [newSysShort, setNewSysShort] = React.useState('')
  const [newSysSub, setNewSysSub]     = React.useState('')

  // Image upload
  const [uploading, setUploading] = React.useState(false)
  const imgInputRef = React.useRef(null)

  const setAndPersistSys = (id) => {
    sessionStorage.setItem('admin_systems_id', id)
    setActiveSys(id)
  }

  React.useEffect(() => {
    if (systems.length === 0) return
    if (activeSys && systems.find(s => s.id === activeSys)) return
    setAndPersistSys(systems[0].id)
  }, [systems.length]) // eslint-disable-line

  const active = systems.find(s => s.id === activeSys) || null

  React.useEffect(() => {
    if (active) {
      setSysName(active.name || '')
      setSysShort(active.short || '')
      setSysSubtitle(active.subtitle || '')
      setZoneEdits({})
    }
  }, [activeSys]) // eslint-disable-line

  const sysSubs = React.useMemo(() => {
    return [...(active?.bacterio_zones || [])].sort((a, b) => a.position - b.position)
  }, [active])

  const flash = (msg) => {
    setError(null)
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const saveSys = async () => {
    if (!activeSys) return
    setError(null)
    try {
      await updateSystem(activeSys, { name: sysName, short: sysShort, subtitle: sysSubtitle })
      flash('Modifications enregistrées')
    } catch (err) { setError(err.message) }
  }

  const addSys = async () => {
    if (!newSysName.trim()) return
    setError(null)
    try {
      await insertSystem({ name: newSysName.trim(), short: newSysShort.trim(), subtitle: newSysSub.trim() })
      const created = systems.find(s => s.name === newSysName.trim())
      if (created) setAndPersistSys(created.id)
      setShowAddSys(false)
      setNewSysName(''); setNewSysShort(''); setNewSysSub('')
      flash('Système créé')
    } catch (err) { setError(err.message) }
  }

  const deleteSys = async () => {
    if (!active) return
    if (!confirm(`Êtes-vous sûr ? Toutes les zones associées seront supprimées. Cette action est irréversible.`)) return
    setError(null)
    try {
      await removeSystem(active.id)
      setActiveSys(null)
      flash('Système supprimé')
    } catch (err) { setError(err.message) }
  }

  const zoneVal = (zone, key) => {
    const e = zoneEdits[zone.id]
    if (e && e[key] !== undefined) return e[key]
    if (key === 'label') return zone.label ?? zone.name ?? ''
    return zone[key] ?? ''
  }

  const patchZoneEdit = (zoneId, key, val) => {
    setZoneEdits(e => ({ ...e, [zoneId]: { ...(e[zoneId] || {}), [key]: val } }))
  }

  const saveZone = async (zone) => {
    const edits = zoneEdits[zone.id] || {}
    const label = edits.label !== undefined ? edits.label : (zone.label ?? zone.name ?? '')
    setError(null)
    try {
      await upsertZone({ ...zone, label })
      flash('Zone enregistrée')
    } catch (err) { setError(err.message) }
  }

  // Drag & drop zone reordering
  const dragZoneFrom = React.useRef(null)
  const [dragOverZoneIdx, setDragOverZoneIdx] = React.useState(null)

  const dropZone = async () => {
    const from = dragZoneFrom.current
    const to = dragOverZoneIdx
    setDragOverZoneIdx(null)
    dragZoneFrom.current = null
    if (from === null || to === null || from === to) return
    const reordered = [...sysSubs]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setError(null)
    try {
      await Promise.all(reordered.map((z, idx) => upsertZone({ ...z, position: idx })))
    } catch (err) { setError(err.message) }
  }

  const removeSub = async (zone) => {
    if (!confirm('Supprimer cette zone ?')) return
    setError(null)
    try {
      await removeZone(zone.id)
      flash('Zone supprimée')
    } catch (err) { setError(err.message) }
  }

  const addZone = async () => {
    if (!active || !newZoneName.trim()) return
    const slug = `${active.slug || active.id}-${Date.now().toString(36)}`
    setError(null)
    try {
      await upsertZone({ system_id: activeSys, name: newZoneName.trim(), label: newZoneName.trim(), slug, position: sysSubs.length, n: 0, flora: 0, descr: '' })
      setNewZoneName('')
      setShowAddZone(false)
      flash('Zone ajoutée')
    } catch (err) { setError(err.message) }
  }

  const uploadImage = async (file) => {
    if (!active || !file) return
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `systems/${active.slug}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('bacteriomap-images').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('bacteriomap-images').getPublicUrl(path)
      await updateSystem(active.id, { image_url: publicUrl })
      flash('Image enregistrée')
    } catch (err) { setError(err.message) }
    setUploading(false)
  }

  const removeImage = async () => {
    if (!active?.image_url) return
    setError(null)
    try {
      await updateSystem(active.id, { image_url: null })
      flash('Image supprimée')
    } catch (err) { setError(err.message) }
  }

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  return (
    <div>
      <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, fontStyle: 'italic', margin: '0 0 24px' }}>Systèmes &amp; Zones</h2>
      <Toast success={success} error={error}/>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left: system list */}
        <div>
          <button onClick={() => setShowAddSys(v => !v)} style={{ ...ghostBtn, width: '100%', marginBottom: 10, textAlign: 'left' }}>
            {showAddSys ? '— Annuler' : '+ Nouveau système'}
          </button>

          {showAddSys && (
            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '16px 18px', marginBottom: 10 }}>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: T.ink3, letterSpacing: '0.14em', marginBottom: 12 }}>NOUVEAU SYSTÈME</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" placeholder="Nom complet…" value={newSysName} onChange={e => setNewSysName(e.target.value)} style={inpStyle}/>
                <input type="text" placeholder="Nom court…" value={newSysShort} onChange={e => setNewSysShort(e.target.value)} style={{ ...inpStyle, maxWidth: 160 }}/>
                <input type="text" placeholder="Sous-titre (optionnel)…" value={newSysSub} onChange={e => setNewSysSub(e.target.value)} style={inpStyle}/>
                <button onClick={addSys} style={primaryBtn}>Créer</button>
              </div>
            </div>
          )}

          <div style={{ background: T.paper, border: `0.5px solid ${T.rule}` }}>
            {systems.map((sys, i) => {
              const isSel = activeSys === sys.id
              const accent = sys.color || 'var(--accent)'
              return (
                <div
                  key={sys.id}
                  onClick={() => setAndPersistSys(sys.id)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: i < systems.length - 1 ? `1px solid var(--ruleSoft)` : 'none',
                    cursor: 'pointer',
                    background: isSel ? T.bg : 'transparent',
                    borderLeft: isSel ? `3px solid ${accent}` : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sys.name}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em' }}>
                      {(sys.bacterio_zones || []).length} zones
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: system form + zones */}
        {active ? (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>SYSTÈME ANATOMIQUE</div>
            <h3 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 500, fontStyle: 'italic', margin: '0 0 20px', color: T.ink }}>{active.name}</h3>

            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)', display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) 1fr', gap: 12, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Nom complet</div>
                <input type="text" value={sysName} onChange={e => setSysName(e.target.value)} style={inpStyle}/>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)', display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) 1fr', gap: 12, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Nom court</div>
                <input type="text" value={sysShort} onChange={e => setSysShort(e.target.value)} style={{ ...inpStyle, maxWidth: 160 }}/>
              </div>
              <div style={{ padding: '8px 0', display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) 1fr', gap: 12, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Sous-titre</div>
                <input type="text" value={sysSubtitle} onChange={e => setSysSubtitle(e.target.value)} style={inpStyle}/>
              </div>
              <div style={{ padding: '8px 0', borderTop: '1px dotted var(--ruleSoft)', marginTop: 8, display: 'grid', gridTemplateColumns: 'minmax(90px, 130px) 1fr', gap: 12, alignItems: 'center' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Image chapitre</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {active.image_url && (
                    <div style={{ position: 'relative', width: 72, height: 52, overflow: 'hidden', flexShrink: 0, border: `1px solid var(--ruleSoft)` }}>
                      <img src={active.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: active.color || '#8b7355', mixBlendMode: 'multiply', opacity: 0.55 }} />
                    </div>
                  )}
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]) }}
                  />
                  <button onClick={() => imgInputRef.current?.click()} disabled={uploading} style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10 }}>
                    {uploading ? 'Envoi…' : active.image_url ? 'Remplacer' : '+ Importer'}
                  </button>
                  {active.image_url && (
                    <button onClick={removeImage} style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10, color: 'var(--red)', borderColor: 'var(--red)' }}>Retirer</button>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={saveSys} style={primaryBtn}>Enregistrer les modifications</button>
              </div>
            </div>

            <SectionTitle>SOUS-ZONES</SectionTitle>

            {sysSubs.length === 0 ? (
              <div style={{ background: T.paper, border: `0.5px dashed ${T.rule}`, padding: '24px 20px', textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, marginBottom: 16 }}>
                Aucune sous-zone. Ajoutez-en une ci-dessous.
              </div>
            ) : (
              <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, marginBottom: 16 }}>
                {sysSubs.map((z, i) => (
                  <div
                    key={z.id}
                    draggable
                    onDragStart={() => { dragZoneFrom.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverZoneIdx(i) }}
                    onDrop={dropZone}
                    onDragEnd={() => { setDragOverZoneIdx(null); dragZoneFrom.current = null }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < sysSubs.length - 1 ? `1px solid var(--ruleSoft)` : 'none',
                      borderTop: dragOverZoneIdx === i && dragZoneFrom.current !== null && dragZoneFrom.current !== i ? `2px solid var(--accent)` : '2px solid transparent',
                      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center',
                    }}
                  >
                    <span style={{ cursor: 'grab', color: T.ink3, fontSize: 16, userSelect: 'none', lineHeight: 1, paddingRight: 2 }}>⠿</span>
                    <input
                      type="text"
                      value={zoneVal(z, 'label')}
                      onChange={e => patchZoneEdit(z.id, 'label', e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontFamily: T.serif, fontSize: 15, fontWeight: 500, color: T.ink, outline: 'none', width: '100%' }}
                    />
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button onClick={() => saveZone(z)} style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10 }}>Enregistrer</button>
                      <button onClick={() => removeSub(z)} style={{ ...arrowBtn, color: 'var(--red)' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddZone ? (
              <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em', marginBottom: 10 }}>NOUVELLE ZONE</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={e => setNewZoneName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addZone() }}
                    placeholder="Nom de la zone…"
                    autoFocus
                    style={{ ...inpStyle, flex: 1 }}
                  />
                  <button onClick={addZone} style={primaryBtn}>Confirmer</button>
                  <button onClick={() => { setShowAddZone(false); setNewZoneName('') }} style={ghostBtn}>Annuler</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddZone(true)} style={{ ...ghostBtn, marginBottom: 32 }}>+ Ajouter une zone</button>
            )}

            <div style={{ borderTop: `1px solid var(--ruleSoft)`, paddingTop: 24, marginTop: 8 }}>
              <button onClick={deleteSys} style={dangerBtn}>Supprimer ce système</button>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.06em', marginTop: 6 }}>
                Supprime aussi toutes les zones. Irréversible.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40, textAlign: 'center' }}>
            Sélectionner un système.
          </div>
        )}
      </div>
    </div>
  )
}
