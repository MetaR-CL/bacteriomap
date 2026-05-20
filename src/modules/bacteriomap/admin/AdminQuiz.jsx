import React from 'react'
import { T } from '../data.js'
import { useQuizAdmin } from '../../../hooks/useQuizAdmin.js'
import { useAdminSystems } from '../../../hooks/useAdminSystems.js'

// ── Style helpers ────────────────────────────────────────────────────────────
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

function ErrorBanner({ msg }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {msg}</div>
}

export default function AdminQuiz() {
  const { questions, loading, upsert, remove, toggle } = useQuizAdmin()
  const { systems } = useAdminSystems()
  const [selectedId, setSelectedId] = React.useState(null)
  const [draft, setDraft]           = React.useState(null)
  const [saving, setSaving]         = React.useState(false)
  const [error, setError]           = React.useState(null)
  const draftRef = React.useRef(null)
  React.useEffect(() => { draftRef.current = draft }, [draft])

  React.useEffect(() => {
    if (selectedId === null && questions.length > 0) selectQ(questions[0])
  }, [questions.length]) // eslint-disable-line

  const emptyQ = () => ({ question: '', options: ['', '', '', ''], correct_index: 0, feedback: '', difficulty: 1, system_id: null, active: true, title: '', scenario: '' })

  const selectQ = (q) => {
    setSelectedId(q.id)
    setDraft({ ...q, options: Array.isArray(q.options) ? q.options : [] })
    setError(null)
  }

  const newQuestion = () => { setSelectedId(null); setDraft(emptyQ()); setError(null) }

  const saveQ = async () => {
    const d = draftRef.current
    if (!d) return
    setSaving(true); setError(null)
    try {
      const saved = await upsert(d)
      setSelectedId(saved.id)
      setDraft({ ...saved, options: Array.isArray(saved.options) ? saved.options : [] })
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const saveField = async (patch) => {
    const d = draftRef.current
    if (!d) return
    const merged = { ...d, ...patch }
    setDraft(merged)
    if (merged.id) {
      setError(null)
      try { await upsert(merged) } catch (err) { setError(err.message) }
    }
  }

  const deleteQ = async (id) => {
    if (!confirm('Supprimer cette question ?')) return
    setError(null)
    try {
      await remove(id)
      if (selectedId === id) { setSelectedId(null); setDraft(null) }
    } catch (err) { setError(err.message) }
  }

  const setOption = (i, value) => setDraft(p => ({ ...p, options: (p.options || []).map((o, j) => j === i ? value : o) }))
  const addOption = () => setDraft(p => ({ ...p, options: [...(p.options || []), ''] }))
  const removeOption = (i) => setDraft(p => {
    const opts = (p.options || []).filter((_, j) => j !== i)
    return { ...p, options: opts, correct_index: Math.max(0, p.correct_index >= opts.length ? opts.length - 1 : p.correct_index) }
  })

  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★'

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  const d = draft
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Questions QCM</h2>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.12em' }}>{questions.length} QUESTION{questions.length !== 1 ? 'S' : ''}</span>
        <button onClick={newQuestion} style={primaryBtn}>+ NOUVELLE QUESTION</button>
      </div>
      <ErrorBanner msg={error}/>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left: list */}
        <div style={{ background: T.paper, border: `0.5px solid ${T.rule}` }}>
          {questions.length === 0 && (
            <div style={{ padding: '20px 16px', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 13 }}>Aucune question.</div>
          )}
          {questions.map((q, i) => {
            const isSel = q.id === selectedId
            return (
              <div key={q.id} onClick={() => selectQ(q)} style={{ padding: '11px 13px', cursor: 'pointer', borderBottom: `1px solid ${T.ruleSoft}`, background: isSel ? T.bg : 'transparent', borderLeft: `3px solid ${isSel ? T.ink : 'transparent'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ocre, flexShrink: 0 }}>{diffLabel(q.difficulty || 1)}</span>
                  <span style={{ fontFamily: T.serif, fontSize: 11, color: q.active ? T.ink2 : T.ink3, fontStyle: q.active ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {(q.question || '').slice(0, 48) || '(sans texte)'}
                  </span>
                  <span onClick={e => { e.stopPropagation(); toggle(q.id, !q.active) }} style={{ fontFamily: T.mono, fontSize: 8, padding: '2px 5px', border: `1px solid ${T.rule}`, background: q.active ? '#e8f5e9' : T.bg, color: q.active ? '#388e3c' : T.ink3, cursor: 'pointer', flexShrink: 0, letterSpacing: '0.06em' }}>
                    {q.active ? 'ON' : 'OFF'}
                  </span>
                  <span onClick={e => { e.stopPropagation(); deleteQ(q.id) }} style={{ fontFamily: T.mono, fontSize: 11, color: T.red, cursor: 'pointer', padding: '0 3px', flexShrink: 0 }}>×</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: form */}
        {d ? (
          <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: '24px 28px' }}>
            <Field label="Question" wide>
              <textarea value={d.question || ''} rows={4}
                onChange={e => setDraft(p => ({ ...p, question: e.target.value }))}
                onBlur={e => saveField({ question: e.target.value })}
                placeholder="Texte de la question…" style={taStyle}/>
            </Field>

            <SectionTitle>OPTIONS</SectionTitle>
            {(d.options || []).map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input type="radio" name={`correct-${d.id || 'new'}`} checked={d.correct_index === i}
                  onChange={() => saveField({ correct_index: i })} style={{ flexShrink: 0 }}/>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, width: 16, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</span>
                <input type="text" value={opt} placeholder={`Option ${String.fromCharCode(65 + i)}…`}
                  onChange={e => setOption(i, e.target.value)}
                  onBlur={() => saveField({ options: draftRef.current?.options })}
                  style={{ ...inpStyle, flex: 1 }}/>
                {(d.options || []).length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ ...arrowBtn, color: T.red }}>×</button>
                )}
              </div>
            ))}
            {(d.options || []).length < 6 && (
              <button onClick={addOption} style={{ ...ghostBtn, fontSize: 10, letterSpacing: '0.1em', marginTop: 4 }}>+ AJOUTER UNE OPTION</button>
            )}
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, marginTop: 6, letterSpacing: '0.08em' }}>
              Le bouton radio marque la bonne réponse.
            </div>

            <SectionTitle>FEEDBACK</SectionTitle>
            <textarea value={d.feedback || ''} rows={3}
              onChange={e => setDraft(p => ({ ...p, feedback: e.target.value }))}
              onBlur={e => saveField({ feedback: e.target.value })}
              placeholder="Explication affichée après la réponse…" style={taStyle}/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 6 }}>DIFFICULTÉ</div>
                <select value={d.difficulty || 1} onChange={e => saveField({ difficulty: Number(e.target.value) })} style={selStyle}>
                  <option value={1}>★ Facile</option>
                  <option value={2}>★★ Moyen</option>
                  <option value={3}>★★★ Difficile</option>
                </select>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 6 }}>SYSTÈME</div>
                <select value={d.system_id || ''} onChange={e => saveField({ system_id: e.target.value ? Number(e.target.value) : null })} style={selStyle}>
                  <option value="">— Tous systèmes</option>
                  {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 6 }}>STATUT</div>
                <select value={d.active ? 'true' : 'false'} onChange={e => saveField({ active: e.target.value === 'true' })} style={selStyle}>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button onClick={saveQ} disabled={saving} style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'ENREGISTREMENT…' : d.id ? 'ENREGISTRER' : 'CRÉER LA QUESTION'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: T.paper, border: `0.5px solid ${T.rule}`, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Sélectionnez une question ou créez-en une nouvelle.</div>
          </div>
        )}
      </div>
    </div>
  )
}
