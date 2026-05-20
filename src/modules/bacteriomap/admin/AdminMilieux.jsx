import React from 'react'
import { T } from '../data.js'
import { useAdminMilieux } from '../../../hooks/useAdminMilieux.js'

const primaryBtn = {
  padding: '8px 16px', background: 'var(--accent)', color: 'var(--paper)', border: 'none',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
}
const ghostBtn = {
  padding: '8px 16px', background: 'transparent', border: '1px solid var(--rule)',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink2)', cursor: 'pointer',
}
const inpStyle = {
  width: '100%', padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--rule)',
  fontFamily: '"Newsreader", serif', fontSize: 14, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
}
const selStyle = { ...inpStyle, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }

const CATEGORIES = ['Gélose', 'Bouillon', 'Sélectif', 'Chromogène', 'Enrichissement', 'Transport', 'Autre']

function ErrorBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {msg}</div>
}

export default function AdminMilieux() {
  const { milieux, loading, upsert, remove } = useAdminMilieux()
  const [edits, setEdits]   = React.useState({})
  const [error, setError]   = React.useState(null)
  const [newRow, setNewRow] = React.useState({ name: '', category: 'Gélose', selective: false })

  const getEdit = (m) => edits[m.id] ?? { name: m.name, category: m.category || 'Gélose', selective: !!m.selective }
  const patchEdit = (id, patch) => setEdits(e => ({ ...e, [id]: { ...(e[id] || {}), ...patch } }))

  const saveRow = async (m) => {
    const e = getEdit(m)
    setError(null)
    try { await upsert({ id: m.id, name: e.name, category: e.category, selective: e.selective }) }
    catch (err) { setError(err.message) }
  }

  const deleteRow = async (m) => {
    if (!confirm(`Supprimer le milieu « ${m.name} » ?`)) return
    setError(null)
    try { await remove(m.id) }
    catch (err) { setError(err.message) }
  }

  const addRow = async () => {
    if (!newRow.name.trim()) return
    setError(null)
    try {
      await upsert({ name: newRow.name.trim(), category: newRow.category, selective: newRow.selective })
      setNewRow({ name: '', category: 'Gélose', selective: false })
    } catch (err) { setError(err.message) }
  }

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  return (
    <div>
      <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, fontStyle: 'italic', margin: '0 0 20px' }}>Milieux de culture</h2>
      <ErrorBanner msg={error}/>

      <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, overflow: 'hidden', marginBottom: 24 }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px auto', gap: 0, background: T.bg, borderBottom: `1px solid ${T.rule}`, padding: '8px 16px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em' }}>NOM</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em' }}>CATÉGORIE</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em', textAlign: 'center' }}>SÉLECTIF</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.14em', textAlign: 'right' }}>ACTIONS</div>
        </div>

        {/* Rows */}
        {milieux.length === 0 ? (
          <div style={{ padding: '24px 16px', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, textAlign: 'center' }}>Aucun milieu. Ajoutez-en un ci-dessous.</div>
        ) : milieux.map((m, i) => {
          const e = getEdit(m)
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px auto', gap: 0, alignItems: 'center', padding: '8px 16px', borderBottom: i < milieux.length - 1 ? `1px solid var(--ruleSoft)` : 'none' }}>
              <input
                type="text"
                value={e.name}
                onChange={ev => patchEdit(m.id, { name: ev.target.value })}
                style={{ ...inpStyle, marginRight: 8 }}
              />
              <select
                value={e.category}
                onChange={ev => patchEdit(m.id, { category: ev.target.value })}
                style={{ ...selStyle, marginRight: 8 }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={!!e.selective}
                  onChange={ev => patchEdit(m.id, { selective: ev.target.checked })}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => saveRow(m)} style={{ ...ghostBtn, padding: '4px 10px', fontSize: 10 }}>Enregistrer</button>
                <button onClick={() => deleteRow(m)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--red)', fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: 'var(--red)', cursor: 'pointer' }}>Supprimer</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add new */}
      <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '20px 20px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.16em', marginBottom: 14 }}>NOUVEAU MILIEU</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px auto', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nom du milieu…"
            value={newRow.name}
            onChange={e => setNewRow(p => ({...p, name: e.target.value}))}
            onKeyDown={e => { if (e.key === 'Enter') addRow() }}
            style={inpStyle}
          />
          <select
            value={newRow.category}
            onChange={e => setNewRow(p => ({...p, category: e.target.value}))}
            style={selStyle}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 11, color: T.ink2, cursor: 'pointer', justifyContent: 'center' }}>
            <input type="checkbox" checked={!!newRow.selective} onChange={e => setNewRow(p => ({...p, selective: e.target.checked}))}/>
            Sélectif
          </label>
          <button onClick={addRow} style={primaryBtn}>Ajouter</button>
        </div>
      </div>
    </div>
  )
}
