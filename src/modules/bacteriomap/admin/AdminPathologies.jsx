import React from 'react'
import { T } from '../data.js'
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
const monoInp = {
  ...inpStyle,
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
}

function Toast({ success, error }) {
  return (
    <>
      {success && (
        <div style={{ padding: '8px 12px', background: '#e8f5e9', border: '1px solid #81c784', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#2e7d32', marginBottom: 12, letterSpacing: '0.04em' }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>
          ✗ {error}
        </div>
      )}
    </>
  )
}

function Label({ children }) {
  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'var(--ink2)', letterSpacing: '0.08em', marginBottom: 4 }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', marginTop: 28, marginBottom: 12, paddingTop: 20, borderTop: '1px solid var(--ruleSoft)' }}>
      {children}
    </div>
  )
}

export default function AdminPathologies() {
  const [zones, setZones] = React.useState([])
  const [systems, setSystems] = React.useState([])
  const [bacteria, setBacteria] = React.useState([])
  const [pathologies, setPathologies] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  // Mode: 'zone' or 'system'
  const [mode, setMode] = React.useState('zone')

  const [activeZoneId, setActiveZoneId] = React.useState(null)
  const [activeSystemId, setActiveSystemId] = React.useState(null)

  const [activePatho, setActivePatho] = React.useState(null)
  const [linkedIds, setLinkedIds] = React.useState(new Set())
  const [success, setSuccess] = React.useState(null)
  const [error, setError] = React.useState(null)

  const [showAdd, setShowAdd] = React.useState(false)
  const [newNom, setNewNom] = React.useState('')
  const [newDesc, setNewDesc] = React.useState('')
  const [newOrdre, setNewOrdre] = React.useState(0)

  const [editNom, setEditNom] = React.useState('')
  const [editDesc, setEditDesc] = React.useState('')
  const [editOrdre, setEditOrdre] = React.useState(0)

  const [bacteriaSearch, setBacteriaSearch] = React.useState('')
  const [uploading, setUploading] = React.useState(false)

  // Drag & drop pathologie reordering
  const dragPathoFrom = React.useRef(null)
  const [dragOverPathoIdx, setDragOverPathoIdx] = React.useState(null)

  const dropPatho = async () => {
    const from = dragPathoFrom.current
    const to = dragOverPathoIdx
    setDragOverPathoIdx(null)
    dragPathoFrom.current = null
    if (from === null || to === null || from === to) return
    const reordered = [...pathologies]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const updates = reordered.map((p, idx) => ({ ...p, ordre: idx }))
    setPathologies(updates)
    try {
      await Promise.all(updates.map(p =>
        supabase.from('bacterio_pathologies').update({ ordre: p.ordre }).eq('id', p.id)
      ))
    } catch (err) { flashErr(err.message) }
  }
  const imgInputRef = React.useRef(null)

  const flash = (msg) => { setError(null); setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }
  const flashErr = (msg) => { setSuccess(null); setError(msg) }

  React.useEffect(() => {
    async function load() {
      const [{ data: zData }, { data: sData }, { data: bData }] = await Promise.all([
        supabase.from('bacterio_zones').select('id, label, name').order('id'),
        supabase.from('bacterio_systems').select('id, name, slug').order('position'),
        supabase.from('bacterio_bacteria').select('id, name').order('name'),
      ])
      setZones(zData || [])
      setSystems(sData || [])
      setBacteria(bData || [])
      if (zData?.length) setActiveZoneId(zData[0].id)
      if (sData?.length) setActiveSystemId(sData[0].id)
      setLoading(false)
    }
    load()
  }, [])

  // Load pathologies when mode/active selection changes
  React.useEffect(() => {
    if (mode === 'zone') {
      if (!activeZoneId) return
      supabase
        .from('bacterio_pathologies')
        .select('*')
        .eq('zone_id', activeZoneId)
        .order('ordre')
        .then(({ data }) => {
          setPathologies(data || [])
          setActivePatho(null)
          setLinkedIds(new Set())
        })
    } else {
      if (!activeSystemId) return
      supabase
        .from('bacterio_pathologies')
        .select('*')
        .eq('system_id', activeSystemId)
        .order('ordre')
        .then(({ data }) => {
          setPathologies(data || [])
          setActivePatho(null)
          setLinkedIds(new Set())
        })
    }
  }, [mode, activeZoneId, activeSystemId])

  React.useEffect(() => {
    if (!activePatho) { setLinkedIds(new Set()); return }
    setEditNom(activePatho.nom)
    setEditDesc(activePatho.description || '')
    setEditOrdre(activePatho.ordre ?? 0)
    supabase
      .from('bacterio_pathologie_germes')
      .select('bacteria_id')
      .eq('pathologie_id', activePatho.id)
      .then(({ data }) => setLinkedIds(new Set((data || []).map(r => r.bacteria_id))))
  }, [activePatho?.id])

  const uploadImage = async (file) => {
    if (!activePatho || !file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `pathologies/${activePatho.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('bacteriomap-images').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('bacteriomap-images').getPublicUrl(path)
      await supabase.from('bacterio_pathologies').update({ image_url: publicUrl }).eq('id', activePatho.id)
      setActivePatho(prev => ({ ...prev, image_url: publicUrl }))
      setPathologies(ps => ps.map(p => p.id === activePatho.id ? { ...p, image_url: publicUrl } : p))
      flash('Image enregistrée')
    } catch (err) { flashErr(err.message) }
    setUploading(false)
  }

  const removeImage = async () => {
    if (!activePatho?.image_url) return
    try {
      await supabase.from('bacterio_pathologies').update({ image_url: null }).eq('id', activePatho.id)
      setActivePatho(prev => ({ ...prev, image_url: null }))
      setPathologies(ps => ps.map(p => p.id === activePatho.id ? { ...p, image_url: null } : p))
      flash('Image retirée')
    } catch (err) { flashErr(err.message) }
  }

  const addPathologie = async () => {
    if (!newNom.trim()) return
    const insertData = {
      nom: newNom.trim(),
      description: newDesc.trim() || null,
      ordre: Number(newOrdre) || 0,
    }
    if (mode === 'zone') {
      insertData.zone_id = activeZoneId
    } else {
      insertData.system_id = activeSystemId
    }
    const { data, error: err } = await supabase
      .from('bacterio_pathologies')
      .insert(insertData)
      .select()
      .single()
    if (err) { flashErr(err.message); return }
    setPathologies(p => [...p, data].sort((a, b) => a.ordre - b.ordre))
    setNewNom(''); setNewDesc(''); setNewOrdre(0); setShowAdd(false)
    flash('Pathologie ajoutée')
  }

  const savePathologie = async () => {
    if (!activePatho || !editNom.trim()) return
    const { error: err } = await supabase
      .from('bacterio_pathologies')
      .update({ nom: editNom.trim(), description: editDesc.trim() || null, ordre: Number(editOrdre) || 0 })
      .eq('id', activePatho.id)
    if (err) { flashErr(err.message); return }
    setPathologies(p => p.map(x => x.id === activePatho.id ? { ...x, nom: editNom.trim(), description: editDesc.trim() || null, ordre: Number(editOrdre) || 0 } : x).sort((a, b) => a.ordre - b.ordre))
    setActivePatho(prev => ({ ...prev, nom: editNom.trim(), description: editDesc.trim() || null, ordre: Number(editOrdre) || 0 }))
    flash('Pathologie enregistrée')
  }

  const deletePathologie = async () => {
    if (!activePatho) return
    if (!confirm(`Supprimer « ${activePatho.nom} » ? Les liens avec les germes seront supprimés.`)) return
    const { error: err } = await supabase.from('bacterio_pathologies').delete().eq('id', activePatho.id)
    if (err) { flashErr(err.message); return }
    setPathologies(p => p.filter(x => x.id !== activePatho.id))
    setActivePatho(null)
    flash('Pathologie supprimée')
  }

  const toggleGerme = async (bacteriaId) => {
    if (!activePatho) return
    const isLinked = linkedIds.has(bacteriaId)
    if (isLinked) {
      const { error: err } = await supabase
        .from('bacterio_pathologie_germes')
        .delete()
        .eq('pathologie_id', activePatho.id)
        .eq('bacteria_id', bacteriaId)
      if (err) { flashErr(err.message); return }
      setLinkedIds(s => { const n = new Set(s); n.delete(bacteriaId); return n })
    } else {
      const { error: err } = await supabase
        .from('bacterio_pathologie_germes')
        .insert({ pathologie_id: activePatho.id, bacteria_id: bacteriaId })
      if (err) { flashErr(err.message); return }
      setLinkedIds(s => new Set([...s, bacteriaId]))
    }
  }

  const filteredBacteria = bacteria.filter(b =>
    b.name.toLowerCase().includes(bacteriaSearch.toLowerCase())
  )

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  return (
    <div>
      <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, fontStyle: 'italic', margin: '0 0 24px' }}>Pathologies</h2>
      <Toast success={success} error={error} />

      {/* Mode toggle + selector */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <Label>TYPE</Label>
          <div style={{ display: 'flex', gap: 0 }}>
            {[{ val: 'zone', label: 'Par zone' }, { val: 'system', label: 'Par système' }].map(opt => (
              <button
                key={opt.val}
                onClick={() => { setMode(opt.val); setShowAdd(false); setActivePatho(null) }}
                style={{
                  ...ghostBtn,
                  padding: '6px 14px',
                  background: mode === opt.val ? T.ink : 'transparent',
                  color: mode === opt.val ? T.paper : 'var(--ink2)',
                  borderRight: opt.val === 'zone' ? 'none' : '1px solid var(--rule)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'zone' ? (
          <div>
            <Label>ZONE</Label>
            <select
              value={activeZoneId ?? ''}
              onChange={e => setActiveZoneId(Number(e.target.value))}
              style={{ ...monoInp, width: 'auto', minWidth: 260 }}
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.label || z.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <Label>SYSTÈME</Label>
            <select
              value={activeSystemId ?? ''}
              onChange={e => setActiveSystemId(Number(e.target.value))}
              style={{ ...monoInp, width: 'auto', minWidth: 260 }}
            >
              {systems.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.slug}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left: pathologie list */}
        <div>
          <button onClick={() => { setShowAdd(v => !v); setActivePatho(null) }} style={{ ...ghostBtn, width: '100%', marginBottom: 10, textAlign: 'left' }}>
            {showAdd ? '— Annuler' : '+ Nouvelle pathologie'}
          </button>

          {showAdd && (
            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '16px 18px', marginBottom: 10 }}>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: T.ink3, letterSpacing: '0.14em', marginBottom: 12 }}>NOUVELLE PATHOLOGIE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" placeholder="Nom…" value={newNom} onChange={e => setNewNom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addPathologie() }} autoFocus style={inpStyle} />
                <textarea placeholder="Description (optionnel)…" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} style={{ ...inpStyle, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: T.ink3, flexShrink: 0 }}>Ordre</div>
                  <input type="number" value={newOrdre} onChange={e => setNewOrdre(e.target.value)} style={{ ...monoInp, width: 70 }} />
                </div>
                <button onClick={addPathologie} style={primaryBtn}>Créer</button>
              </div>
            </div>
          )}

          <div style={{ background: T.paper, border: `0.5px solid ${T.rule}` }}>
            {pathologies.length === 0 ? (
              <div style={{ padding: '20px 16px', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 13 }}>
                Aucune pathologie ici.
              </div>
            ) : (
              pathologies.map((p, i) => {
                const isSel = activePatho?.id === p.id
                return (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => { dragPathoFrom.current = i }}
                    onDragOver={e => { e.preventDefault(); setDragOverPathoIdx(i) }}
                    onDrop={dropPatho}
                    onDragEnd={() => { setDragOverPathoIdx(null); dragPathoFrom.current = null }}
                    onClick={() => { setShowAdd(false); setActivePatho(p) }}
                    style={{
                      padding: '10px 14px',
                      borderBottom: i < pathologies.length - 1 ? '1px solid var(--ruleSoft)' : 'none',
                      borderTop: dragOverPathoIdx === i && dragPathoFrom.current !== null && dragPathoFrom.current !== i ? '2px solid var(--accent)' : '2px solid transparent',
                      cursor: 'pointer',
                      background: isSel ? T.bg : 'transparent',
                      borderLeft: isSel ? '3px solid var(--accent)' : '3px solid transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{ cursor: 'grab', color: T.ink3, fontSize: 14, userSelect: 'none', lineHeight: 1, flexShrink: 0 }}>⠿</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 500, color: T.ink }}>{p.nom}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: edit panel */}
        {activePatho ? (
          <div>
            <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>PATHOLOGIE</div>
            <h3 style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, fontStyle: 'italic', margin: '0 0 20px', color: T.ink }}>{activePatho.nom}</h3>

            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <Label>NOM</Label>
                  <input type="text" value={editNom} onChange={e => setEditNom(e.target.value)} style={inpStyle} />
                </div>
                <div>
                  <Label>DESCRIPTION</Label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} style={{ ...inpStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <Label>ORDRE</Label>
                  <input type="number" value={editOrdre} onChange={e => setEditOrdre(e.target.value)} style={{ ...monoInp, width: 100 }} />
                </div>
                <div>
                  <Label>IMAGE</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {activePatho.image_url && (
                      <div style={{ width: 72, height: 52, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--ruleSoft)' }}>
                        <img src={activePatho.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); e.target.value = '' }} />
                    <button onClick={() => imgInputRef.current?.click()} disabled={uploading}
                      style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10 }}>
                      {uploading ? 'Envoi…' : activePatho.image_url ? 'Remplacer' : '+ Importer'}
                    </button>
                    {activePatho.image_url && (
                      <button onClick={removeImage}
                        style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10, color: 'var(--red)', borderColor: 'var(--red)' }}>
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={savePathologie} style={primaryBtn}>Enregistrer</button>
              </div>
            </div>

            <SectionTitle>GERMES ASSOCIÉS ({linkedIds.size})</SectionTitle>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Rechercher un germe…"
                value={bacteriaSearch}
                onChange={e => setBacteriaSearch(e.target.value)}
                style={{ ...inpStyle, maxWidth: 320 }}
              />
            </div>
            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, maxHeight: 360, overflowY: 'auto' }}>
              {filteredBacteria.length === 0 ? (
                <div style={{ padding: '16px', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 13 }}>Aucun résultat.</div>
              ) : (
                filteredBacteria.map((b, i) => {
                  const checked = linkedIds.has(b.id)
                  return (
                    <label
                      key={b.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px',
                        borderBottom: i < filteredBacteria.length - 1 ? '1px solid var(--ruleSoft)' : 'none',
                        cursor: 'pointer',
                        background: checked ? 'rgba(76,175,80,0.06)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGerme(b.id)}
                        style={{ accentColor: 'var(--accent)', width: 14, height: 14, flexShrink: 0 }}
                      />
                      <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ink }}>{b.name}</span>
                    </label>
                  )
                })
              )}
            </div>

            <div style={{ borderTop: `1px solid var(--ruleSoft)`, paddingTop: 24, marginTop: 28 }}>
              <button onClick={deletePathologie} style={dangerBtn}>Supprimer cette pathologie</button>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: T.ink3, letterSpacing: '0.06em', marginTop: 6 }}>
                Supprime aussi les liens avec les germes. Irréversible.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40, textAlign: 'center' }}>
            {showAdd ? '' : 'Sélectionner ou créer une pathologie.'}
          </div>
        )}
      </div>
    </div>
  )
}
