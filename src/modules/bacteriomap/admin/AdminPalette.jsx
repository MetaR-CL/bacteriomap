import React from 'react'
import { T } from '../data.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'
import { SYSTEM_PALETTES } from '../shared.jsx'

function ColorField({ label, value, onChange }) {
  const [local, setLocal] = React.useState(value || '#888888')
  React.useEffect(() => setLocal(value || '#888888'), [value])
  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 5 }}>{label.toUpperCase()}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', border: `1px solid ${T.rule}`, padding: '4px 6px 4px 4px', background: T.bg }}>
        <input type="color" value={local} onChange={e => { setLocal(e.target.value); onChange(e.target.value) }}
               style={{ width: 30, height: 26, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}/>
        <input type="text" value={local} onChange={e => setLocal(e.target.value)}
               onBlur={() => onChange(local)} onKeyDown={e => { if (e.key === 'Enter') onChange(local) }}
               style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: T.mono, fontSize: 11, color: T.ink2, outline: 'none', minWidth: 0 }}/>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: T.mono, fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {msg}</div>
}

export default function AdminPalette() {
  const { systems, loading, updateSystem } = useAdminSystems()
  const [error, setError] = React.useState(null)

  const setColor = async (sysId, key, value) => {
    const col = key === 'accent' ? 'color' : key
    setError(null)
    try { await updateSystem(sysId, { [col]: value }) }
    catch (err) { setError(err.message) }
  }

  const resetSystem = async (sysId) => {
    if (!confirm('Réinitialiser les couleurs de ce système ?')) return
    const sys = systems.find(s => s.id === sysId)
    const def = SYSTEM_PALETTES[sys?.slug]
    if (!def) return
    setError(null)
    try { await updateSystem(sysId, { color: def.accent, tint: def.tint, deep: def.deep }) }
    catch (err) { setError(err.message) }
  }

  const resetAll = async () => {
    if (!confirm('Réinitialiser toutes les couleurs ?')) return
    setError(null)
    try {
      for (const sys of systems) {
        const def = SYSTEM_PALETTES[sys.slug]
        if (def) await updateSystem(sys.id, { color: def.accent, tint: def.tint, deep: def.deep })
      }
    } catch (err) { setError(err.message) }
  }

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Palette par système</h2>
        <span style={{ flex: 1 }}/>
        <button onClick={resetAll} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', color: T.ink2, cursor: 'pointer' }}>TOUT RÉINITIALISER</button>
      </div>
      <ErrorBanner msg={error}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {systems.map(sys => {
          const accent = sys.color || '#888', tint = sys.tint || '#eee', deep = sys.deep || '#333'
          const def = SYSTEM_PALETTES[sys.slug] || {}
          const isCustom = sys.color !== def.accent || sys.tint !== def.tint || sys.deep !== def.deep
          return (
            <div key={sys.id} style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '18px 20px', borderLeft: `4px solid ${accent}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500 }}>{sys.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.1em', marginTop: 2 }}>{(def.name || sys.slug).toUpperCase()}</div>
                </div>
                {isCustom && <button onClick={() => resetSystem(sys.id)} style={{ padding: '3px 8px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', cursor: 'pointer' }}>RÉINIT.</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <ColorField label="Accent" value={accent} onChange={v => setColor(sys.id, 'accent', v)}/>
                <ColorField label="Teinte" value={tint}   onChange={v => setColor(sys.id, 'tint',   v)}/>
                <ColorField label="Profond" value={deep}  onChange={v => setColor(sys.id, 'deep',   v)}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
