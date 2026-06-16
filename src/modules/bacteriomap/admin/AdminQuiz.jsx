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

function Toast({ success, error }) {
  return (
    <>
      {success && <div style={{ padding: '8px 12px', background: '#e8f5e9', border: '1px solid #81c784', fontFamily: 'var(--mono)', fontSize: 11, color: '#2e7d32', marginBottom: 12, letterSpacing: '0.04em' }}>✓ {success}</div>}
      {error && <div style={{ padding: '8px 12px', background: '#fde8e8', border: '1px solid #e87070', fontFamily: 'var(--mono)', fontSize: 11, color: '#c00', marginBottom: 12, letterSpacing: '0.04em' }}>✗ {error}</div>}
    </>
  )
}

const TYPE_BADGE = {
  qcm:         { label: 'QCM',           color: T.ink3 },
  theorique:   { label: 'THÉORIQUE',     color: 'var(--accent)' },
  cas_clinique:{ label: 'CAS CLINIQUE',  color: T.ocre },
}

function TypeBadge({ type }) {
  const b = TYPE_BADGE[type] || TYPE_BADGE.qcm
  return (
    <span style={{ fontFamily: T.mono, fontSize: 8, padding: '2px 5px', border: `1px solid ${b.color}`, color: b.color, letterSpacing: '0.06em', flexShrink: 0 }}>
      {b.label}
    </span>
  )
}

function MdHint() {
  return <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.08em', marginTop: 4 }}>Markdown supporté : **gras**, *italique*, - liste</div>
}

export default function AdminQuiz() {
  const { questions, loading, upsert, remove, toggle, uploadImage } = useQuizAdmin()
  const { systems } = useAdminSystems()
  const [selectedId, setSelectedId] = React.useState(null)
  const [draft, setDraft]           = React.useState(null)
  const [saving, setSaving]         = React.useState(false)
  const [error, setError]           = React.useState(null)
  const [success, setSuccess]       = React.useState(null)
  const [newTypeMenu, setNewTypeMenu] = React.useState(false)
  const draftRef = React.useRef(null)
  const fileRef  = React.useRef(null)
  React.useEffect(() => { draftRef.current = draft }, [draft])

  const flash = (msg) => {
    setError(null); setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  React.useEffect(() => {
    if (selectedId === null && questions.length > 0) selectQ(questions[0])
  }, [questions.length]) // eslint-disable-line

  const emptyQ = (type = 'qcm') => ({
    type, question: '', options: ['', '', '', ''], correct_index: 0,
    feedback: '', difficulty: 1, system_id: null, active: true,
    title: '', context: '', answer: '', sub_questions: [], image_url: null,
  })

  const selectQ = (q) => {
    setSelectedId(q.id)
    setDraft({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      sub_questions: Array.isArray(q.sub_questions) ? q.sub_questions : [],
    })
    setError(null)
  }

  const newQuestion = (type) => {
    setSelectedId(null)
    setDraft(emptyQ(type))
    setNewTypeMenu(false)
    setError(null)
  }

  const saveQ = async () => {
    const d = draftRef.current
    if (!d) return
    const isNew = !d.id
    setSaving(true); setError(null)
    try {
      const saved = await upsert(d)
      setSelectedId(saved.id)
      setDraft({
        ...saved,
        options: Array.isArray(saved.options) ? saved.options : [],
        sub_questions: Array.isArray(saved.sub_questions) ? saved.sub_questions : [],
      })
      flash(isNew ? 'Question créée' : 'Question enregistrée')
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
      flash('Question supprimée')
    } catch (err) { setError(err.message) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !draft?.id) return
    setSaving(true); setError(null)
    try {
      const url = await uploadImage(file, draft.id)
      setDraft(p => ({ ...p, image_url: url }))
      flash('Image téléversée')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
    e.target.value = ''
  }

  const clearImage = async () => {
    if (!draft?.id) return
    setError(null)
    try {
      await upsert({ ...draftRef.current, image_url: null })
      setDraft(p => ({ ...p, image_url: null }))
    } catch (err) { setError(err.message) }
  }

  // QCM option helpers
  const setOption = (i, value) => setDraft(p => ({ ...p, options: (p.options || []).map((o, j) => j === i ? value : o) }))
  const addOption = () => setDraft(p => ({ ...p, options: [...(p.options || []), ''] }))
  const removeOption = (i) => setDraft(p => {
    const opts = (p.options || []).filter((_, j) => j !== i)
    return { ...p, options: opts, correct_index: Math.max(0, p.correct_index >= opts.length ? opts.length - 1 : p.correct_index) }
  })

  // Sub-question helpers
  const emptySQ = () => ({ question: '', options: ['', '', '', ''], correct_index: 0, feedback: '' })
  const setSQ = (i, patch) => setDraft(p => {
    const sqs = [...(p.sub_questions || [])]
    sqs[i] = { ...sqs[i], ...patch }
    return { ...p, sub_questions: sqs }
  })
  const setSQOption = (si, oi, val) => setDraft(p => {
    const sqs = [...(p.sub_questions || [])]
    const opts = [...(sqs[si].options || [])]
    opts[oi] = val
    sqs[si] = { ...sqs[si], options: opts }
    return { ...p, sub_questions: sqs }
  })
  const addSQ = () => setDraft(p => ({ ...p, sub_questions: [...(p.sub_questions || []), emptySQ()] }))
  const removeSQ = (i) => setDraft(p => ({ ...p, sub_questions: (p.sub_questions || []).filter((_, j) => j !== i) }))

  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★'

  if (loading) return <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, padding: 40 }}>Chargement…</div>

  const d = draft
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 26, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Questions QCM</h2>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink2, letterSpacing: '0.12em' }}>{questions.length} QUESTION{questions.length !== 1 ? 'S' : ''}</span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNewTypeMenu(m => !m)} style={primaryBtn}>+ NOUVELLE QUESTION</button>
          {newTypeMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: T.paper, border: `1px solid ${T.rule}`, zIndex: 10, minWidth: 180, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
              {[['qcm','QCM'],['theorique','THÉORIQUE'],['cas_clinique','CAS CLINIQUE']].map(([type, label]) => (
                <div key={type} onClick={() => newQuestion(type)}
                  style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.1em', color: TYPE_BADGE[type].color, cursor: 'pointer', borderBottom: `1px solid ${T.ruleSoft}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >{label}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toast success={success} error={error}/>
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
                  <TypeBadge type={q.type || 'qcm'} />
                  <span style={{ fontFamily: T.serif, fontSize: 11, color: q.active ? T.ink2 : T.ink3, fontStyle: q.active ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {(q.title || q.question || q.context || '').slice(0, 40) || '(sans texte)'}
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

            {/* Common fields */}
            <Field label="Type">
              <select value={d.type || 'qcm'} onChange={e => saveField({ type: e.target.value })} style={selStyle}>
                <option value="qcm">QCM</option>
                <option value="theorique">Exercice théorique</option>
                <option value="cas_clinique">Cas clinique</option>
              </select>
            </Field>
            <Field label="Titre" hint="Affiché dans la liste">
              <input type="text" value={d.title || ''} placeholder="Titre court…"
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                onBlur={e => saveField({ title: e.target.value })}
                style={inpStyle}/>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 6 }}>SYSTÈME</div>
                <select value={d.system_id || ''} onChange={e => saveField({ system_id: e.target.value ? Number(e.target.value) : null })} style={selStyle}>
                  <option value="">— Tous</option>
                  {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em', marginBottom: 6 }}>DIFFICULTÉ</div>
                <select value={d.difficulty || 1} onChange={e => saveField({ difficulty: Number(e.target.value) })} style={selStyle}>
                  <option value={1}>★ Facile</option>
                  <option value={2}>★★ Moyen</option>
                  <option value={3}>★★★ Difficile</option>
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

            {/* Image */}
            <SectionTitle>IMAGE</SectionTitle>
            {d.image_url && (
              <div style={{ position: 'relative', marginBottom: 10, display: 'inline-block' }}>
                <img src={d.image_url} alt="" style={{ maxHeight: 120, maxWidth: '100%', display: 'block', border: `0.5px solid ${T.rule}` }}/>
                <button onClick={clearImage} title="Supprimer l'image"
                  style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, padding: 0, border: '0.5px solid rgba(255,255,255,.5)', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 11, cursor: 'pointer' }}>×</button>
              </div>
            )}
            {d.id ? (
              <label style={{ display: 'inline-block', padding: '6px 12px', background: T.bg, border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', color: T.ink2 }}>
                {d.image_url ? 'Remplacer l\'image' : '+ Ajouter une image'}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }}/>
              </label>
            ) : (
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.ink3 }}>Enregistrez d'abord la question pour ajouter une image.</div>
            )}

            {/* ── Type-specific fields ── */}

            {/* QCM */}
            {(d.type === 'qcm' || !d.type) && (
              <>
                <SectionTitle>QUESTION</SectionTitle>
                <textarea value={d.question || ''} rows={4}
                  onChange={e => setDraft(p => ({ ...p, question: e.target.value }))}
                  onBlur={e => saveField({ question: e.target.value })}
                  placeholder="Texte de la question…" style={taStyle}/>

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
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, marginTop: 6, letterSpacing: '0.08em' }}>Le bouton radio marque la bonne réponse.</div>

                <SectionTitle>FEEDBACK</SectionTitle>
                <textarea value={d.feedback || ''} rows={3}
                  onChange={e => setDraft(p => ({ ...p, feedback: e.target.value }))}
                  onBlur={e => saveField({ feedback: e.target.value })}
                  placeholder="Explication affichée après la réponse…" style={taStyle}/>
                <MdHint />
              </>
            )}

            {/* THÉORIQUE */}
            {d.type === 'theorique' && (
              <>
                <SectionTitle>QUESTION</SectionTitle>
                <textarea value={d.question || ''} rows={4}
                  onChange={e => setDraft(p => ({ ...p, question: e.target.value }))}
                  onBlur={e => saveField({ question: e.target.value })}
                  placeholder="Texte de la question…" style={taStyle}/>

                <SectionTitle>RÉPONSE</SectionTitle>
                <textarea value={d.answer || ''} rows={4}
                  onChange={e => setDraft(p => ({ ...p, answer: e.target.value }))}
                  onBlur={e => saveField({ answer: e.target.value })}
                  placeholder="Réponse affichée après révélation…" style={taStyle}/>
                <MdHint />
              </>
            )}

            {/* CAS CLINIQUE */}
            {d.type === 'cas_clinique' && (
              <>
                <SectionTitle>CONTEXTE</SectionTitle>
                <textarea value={d.context || ''} rows={5}
                  onChange={e => setDraft(p => ({ ...p, context: e.target.value }))}
                  onBlur={e => saveField({ context: e.target.value })}
                  placeholder="Description narrative du cas clinique…" style={taStyle}/>
                <MdHint />

                <SectionTitle>SOUS-QUESTIONS</SectionTitle>
                {(d.sub_questions || []).map((sq, si) => (
                  <div key={si} style={{ background: T.bg, border: `0.5px solid ${T.rule}`, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.1em' }}>Q{si + 1}</span>
                      <input type="text" value={sq.question || ''} placeholder="Texte de la sous-question…"
                        onChange={e => setSQ(si, { question: e.target.value })}
                        onBlur={() => saveField({ sub_questions: draftRef.current?.sub_questions })}
                        style={{ ...inpStyle, flex: 1, padding: '5px 8px' }}/>
                      <button onClick={() => { removeSQ(si); saveField({ sub_questions: draftRef.current?.sub_questions }) }}
                        style={{ ...arrowBtn, color: T.red }}>×</button>
                    </div>
                    {(sq.options || []).map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <input type="radio" name={`sq-correct-${si}-${d.id || 'new'}`} checked={sq.correct_index === oi}
                          onChange={() => { setSQ(si, { correct_index: oi }); saveField({ sub_questions: draftRef.current?.sub_questions }) }} style={{ flexShrink: 0 }}/>
                        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, width: 16, flexShrink: 0 }}>{String.fromCharCode(65 + oi)}</span>
                        <input type="text" value={opt} placeholder={`Option ${String.fromCharCode(65 + oi)}…`}
                          onChange={e => setSQOption(si, oi, e.target.value)}
                          onBlur={() => saveField({ sub_questions: draftRef.current?.sub_questions })}
                          style={{ ...inpStyle, flex: 1, padding: '5px 8px' }}/>
                      </div>
                    ))}
                    <input type="text" value={sq.feedback || ''} placeholder="Feedback…"
                      onChange={e => setSQ(si, { feedback: e.target.value })}
                      onBlur={() => saveField({ sub_questions: draftRef.current?.sub_questions })}
                      style={{ ...inpStyle, marginTop: 6, padding: '5px 8px', fontSize: 12 }}/>
                  </div>
                ))}
                <button onClick={addSQ} style={{ ...ghostBtn, fontSize: 10, letterSpacing: '0.1em' }}>+ Ajouter une sous-question</button>
              </>
            )}

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
