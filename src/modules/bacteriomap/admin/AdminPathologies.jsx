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
  const [bacteria, setBacteria] = React.useState([])
  const [pathologies, setPathologies] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [activeZoneId, setActiveZoneId] = React.useState(null)
  const [activePatho, setActivePatho] = React.useState(null) // full pathologie object being edited
  const [linkedIds, setLinkedIds] = React.useState(new Set()) // bacteria linked to activePatho
  const [success, setSuccess] = React.useState(null)
  const [error, setError] = React.useState(null)

  // New pathologie form
  const [showAdd, setShowAdd] = React.useState(false)
  const [newNom, setNewNom] = React.useState('')
  const [newDesc, setNewDesc] = React.useState('')
  const [newOrdre, setNewOrdre] = React.useState(0)

  // Edit form state
  const [editNom, setEditNom] = React.useState('')
  const [editDesc, setEditDesc] = React.useState('')
  const [editOrdre, setEditOrdre] = React.useState(0)

  // Bacteria search filter
  const [bacteriaSearch, setBacteriaSearch] = React.useState('')

  const flash = (msg) => { setError(null); setSuccess(msg); setTimeout(() => setSuccess(null), 3000) }
  const flashErr = (msg) => { setSuccess(null); setError(msg) }

  // Load zones + all bacteria once
  React.useEffect(() => {
    async function load() {
      const [{ data: zData }, { data: bData }] = await Promise.all([
        supabase.from('bacterio_zones').select('id, label, name').order('id'),
        supabase.from('bacterio_bacteria').select('id, name').order('name'),
      ])
      setZones(zData || [])
      setBacteria(bData || [])
      if (zData?.length) setActiveZoneId(zData[0].id)
      setLoading(false)
    }
    load()
  }, [])

  // Load pathologies for active zone
  React.useEffect(() => {
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
  }, [activeZoneId])

  // Load linked bacteria when editing a pathologie
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

  const addPathologie = async () => {
    if (!newNom.trim()) return
    const { data, error: err } = await supabase
      .from('bacterio_pathologies')
      .insert({ zone_id: activeZoneId, nom: newNom.trim(), description: newDesc.trim() || null, ordre: Number(newOrdre) || 0 })
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

  const activeZone = zones.find(z => z.id === activeZoneId)

  return (
    <div>
      <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, fontStyle: 'italic', margin: '0 0 24px' }}>Pathologies</h2>
      <Toast success={success} error={error} />

      {/* Zone selector */}
      <div style={{ marginBottom: 24 }}>
        <Label>ZONE</Label>
        <select
          value={activeZoneId ?? ''}
          onChange={e => setActiveZoneId(Number(e.target.value))}
          style={{ ...monoInp, width: 'auto', minWidth: 280 }}
        >
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.label || z.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

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
                Aucune pathologie pour cette zone.
              </div>
            ) : (
              pathologies.map((p, i) => {
                const isSel = activePatho?.id === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => { setShowAdd(false); setActivePatho(p) }}
                    style={{
                      padding: '10px 14px',
                      borderBottom: i < pathologies.length - 1 ? '1px solid var(--ruleSoft)' : 'none',
                      cursor: 'pointer',
                      background: isSel ? T.bg : 'transparent',
                      borderLeft: isSel ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                  >
                    <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 500, color: T.ink }}>{p.nom}</div>
                    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, color: T.ink3, marginTop: 2 }}>ordre {p.ordre}</div>
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

            {/* Edit fields */}
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
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={savePathologie} style={primaryBtn}>Enregistrer</button>
              </div>
            </div>

            {/* Germes linked */}
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
