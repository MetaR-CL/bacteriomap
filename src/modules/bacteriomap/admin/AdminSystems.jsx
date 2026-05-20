import React from 'react'
import { T } from '../data.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'

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

function ErrorBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {msg}</div>
}

function SuccessBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: '#e8f5e9', border: '1px solid #66bb6a', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#2e7d32', marginBottom: 12, letterSpacing: '0.04em' }}>✓ {msg}</div>
}

export default function AdminSystems() {
  const { systems, loading, updateSystem, upsertZone, removeZone } = useAdminSystems()

  const [activeSys, setActiveSys]     = React.useState(null)
  const [sysName, setSysName]         = React.useState('')
  const [sysShort, setSysShort]       = React.useState('')
  const [sysSubtitle, setSysSubtitle] = React.useState('')
  const [error, setError]             = React.useState(null)
  const [successMsg, setSuccessMsg]   = React.useState(null)
  const [zoneEdits, setZoneEdits]     = React.useState({})
  const [newZoneName, setNewZoneName] = React.useState('')
  const [showAddZone, setShowAddZone] = React.useState(false)

  // Auto-select first system
  React.useEffect(() => {
    if (!activeSys && systems.length > 0) setActiveSys(systems[0].id)
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

  const flashSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const saveSys = async () => {
    if (!activeSys) return
    setError(null)
    try {
      await updateSystem(activeSys, { name: sysName, short: sysShort, subtitle: sysSubtitle })
      flashSuccess('Modifications enregistrées')
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
    try { await upsertZone({ ...zone, label }) }
    catch (err) { setError(err.message) }
  }

  const moveSub = async (idx, dir) => {
    const tgt = idx + dir
    if (tgt < 0 || tgt >= sysSubs.length) return
    setError(null)
    try {
      await upsertZone({ ...sysSubs[idx], position: sysSubs[tgt].position })
      await upsertZone({ ...sysSubs[tgt], position: sysSubs[idx].position })
    } catch (err) { setError(err.message) }
  }

  const removeSub = async (zone) => {
    if (!confirm('Supprimer cette zone ?')) return
    setError(null)
    try { await removeZone(zone.id) }
    catch (err) { setError(err.message) }
  }

  const addZone = async () => {
    if (!active || !newZoneName.trim()) return
    const slug = `${active.slug || active.id}-${Date.now().toString(36)}`
    setError(null)
    try {
      await upsertZone({ system_id: activeSys, name: newZoneName.trim(), label: newZoneName.trim(), slug, position: sysSubs.length, n: 0, flora: 0, descr: '' })
      setNewZoneName('')
      setShowAddZone(false)
    } catch (err) { setError(err.message) }
  }

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  return (
    <div>
      <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, fontStyle: 'italic', margin: '0 0 24px' }}>Systèmes &amp; Zones</h2>
      <ErrorBanner msg={error}/>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'start' }}>

        {/* Left: system list */}
        <div style={{ background: T.paper, border: `0.5px solid ${T.rule}` }}>
          {systems.map((sys, i) => {
            const isSel = activeSys === sys.id
            const accent = sys.color || 'var(--accent)'
            return (
              <div
                key={sys.id}
                onClick={() => setActiveSys(sys.id)}
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

        {/* Right: system form + zones */}
        {active ? (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>SYSTÈME ANATOMIQUE</div>
            <h3 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 500, fontStyle: 'italic', margin: '0 0 20px', color: T.ink }}>{active.name}</h3>

            <SuccessBanner msg={successMsg}/>

            <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)', display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Nom complet</div>
                <input type="text" value={sysName} onChange={e => setSysName(e.target.value)} style={inpStyle}/>
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px dotted var(--ruleSoft)', display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Nom court</div>
                <input type="text" value={sysShort} onChange={e => setSysShort(e.target.value)} style={{ ...inpStyle, maxWidth: 160 }}/>
              </div>
              <div style={{ padding: '8px 0', display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.08em' }}>Sous-titre</div>
                <input type="text" value={sysSubtitle} onChange={e => setSysSubtitle(e.target.value)} style={inpStyle}/>
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
                  <div key={z.id} style={{ padding: '12px 16px', borderBottom: i < sysSubs.length - 1 ? `1px solid var(--ruleSoft)` : 'none', display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={zoneVal(z, 'label')}
                      onChange={e => patchZoneEdit(z.id, 'label', e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontFamily: T.serif, fontSize: 15, fontWeight: 500, color: T.ink, outline: 'none', width: '100%' }}
                    />
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button onClick={() => saveZone(z)} style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10 }}>Enregistrer</button>
                      <button onClick={() => moveSub(i, -1)} style={arrowBtn} disabled={i === 0}>↑</button>
                      <button onClick={() => moveSub(i, +1)} style={arrowBtn} disabled={i === sysSubs.length - 1}>↓</button>
                      <button onClick={() => removeSub(z)} style={{ ...arrowBtn, color: 'var(--red)' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddZone ? (
              <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '16px 18px' }}>
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
              <button onClick={() => setShowAddZone(true)} style={ghostBtn}>+ Ajouter une zone</button>
            )}
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
