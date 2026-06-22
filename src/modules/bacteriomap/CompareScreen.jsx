import React from 'react'
import { T } from './data.js'
import { useCompare } from '../../context/CompareContext.jsx'
import TopBar from './TopBar.jsx'

function parseJSONField(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') { try { return JSON.parse(val) } catch { return [] } }
  return []
}

const GRAM_MAP = { positif: '+', négatif: '−', negatif: '−', aucun: 'F' }
const BOOL = (v) => v == null ? null : (v ? '+' : '−')

function getFields(b) {
  const milieux = parseJSONField(b.milieux)
  const primary = milieux.filter(m => typeof m === 'object' && m.primary).map(m => m.name)
  const milieuxStr = (primary.length ? primary : milieux.slice(0, 2).map(m => typeof m === 'string' ? m : m?.name)).join(', ')

  const resistNat = Array.isArray(b.resist_nat) ? b.resist_nat : []
  const resistAcq = Array.isArray(b.resist_acq) ? b.resist_acq : []

  return [
    { key: 'GRAM',                  val: GRAM_MAP[b.gram] || b.gram || null },
    { key: 'MORPHOLOGIE',           val: b.morphology || b.morpho || null },
    { key: 'CATALASE',              val: BOOL(b.catalase) },
    { key: 'OXYDASE',               val: BOOL(b.oxydase) },
    { key: 'COAGULASE',             val: BOOL(b.coagulase) },
    { key: 'SPORULATION',           val: BOOL(b.sporulation) },
    { key: 'ATMOSPHÈRE',            val: b.atmosphere || null },
    { key: 'FRÉQUENCE',             val: b.freq || null },
    { key: 'BSL',                   val: b.bsl3 ? '3' : '2' },
    { key: 'MILIEUX PRINCIPAUX',    val: milieuxStr || null },
    { key: 'RÉSISTANCES NAT.',      val: resistNat.length ? resistNat.join(', ') : null },
    { key: 'RÉSISTANCES ACQ.',      val: resistAcq.length ? resistAcq.join(', ') : null },
  ]
}

export default function CompareScreen({ navigate }) {
  const { basket, remove } = useCompare()

  if (basket.length < 2) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
        <TopBar navigate={navigate} center="COMPARAISON" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.ink3, textAlign: 'center' }}>
            Sélectionnez au moins 2 germes pour comparer.
          </div>
          <button onClick={() => navigate('home')} style={{
            padding: '10px 20px', background: 'transparent', border: `1px solid ${T.rule}`,
            fontFamily: T.mono, fontSize: 11, letterSpacing: '0.12em', color: T.ink2, cursor: 'pointer',
          }}>← Retour</button>
        </div>
      </div>
    )
  }

  const numCols = basket.length
  const rowsPerBact = basket.map(b => getFields(b))
  const numRows = rowsPerBact[0].length

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.serif }}>
      <TopBar navigate={navigate} center="COMPARAISON" />

      {/* Header */}
      <div style={{ padding: '28px 48px 20px', background: T.paper, borderBottom: `1px solid ${T.rule}` }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.2em', marginBottom: 6 }}>COMPARAISON DE GERMES</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>Comparaison</h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink2, marginTop: 6 }}>
          {basket.length} germes sélectionnés
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: '32px 48px 80px', overflowX: 'auto' }}>
        <div style={{ minWidth: 480 }}>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${numCols}, 1fr)`, borderBottom: `1.5px solid ${T.rule}` }}>
            <div style={{ padding: '10px 14px', background: T.bgSoft }} />
            {basket.map(b => (
              <div key={b.id} style={{ padding: '10px 14px', background: T.paper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                <button onClick={() => remove(b.id)} style={{
                  background: 'none', border: `1px solid ${T.ruleSoft}`, color: T.ink3,
                  cursor: 'pointer', fontSize: 12, width: 20, height: 20, padding: 0, flexShrink: 0,
                }}>×</button>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {Array.from({ length: numRows }).map((_, ri) => {
            const vals = basket.map(b => rowsPerBact[basket.indexOf(b)][ri].val)
            const nonNull = vals.filter(v => v != null)
            const allSame = nonNull.length > 0 && nonNull.every(v => v === nonNull[0])
            const rowBg = ri % 2 === 0 ? T.paper : T.bg
            const sameBg = 'rgba(76,175,80,0.08)'
            const diffBg = 'rgba(255,152,0,0.12)'

            return (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: `160px repeat(${numCols}, 1fr)`, borderBottom: `1px solid ${T.ruleSoft}` }}>
                {/* Label */}
                <div style={{ padding: '10px 14px', fontFamily: T.mono, fontSize: 9, letterSpacing: '0.14em', color: T.ink3, background: T.bgSoft, display: 'flex', alignItems: 'center' }}>
                  {rowsPerBact[0][ri].key}
                </div>
                {/* Values */}
                {vals.map((val, ci) => {
                  const isDiff = !allSame && val != null
                  const cellBg = allSame ? sameBg : isDiff ? diffBg : rowBg
                  return (
                    <div key={ci} style={{ padding: '10px 14px', fontFamily: T.serif, fontSize: 13, background: cellBg, color: val == null ? T.ink3 : T.ink, borderLeft: `1px solid ${T.ruleSoft}` }}>
                      {val ?? '—'}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Add more */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          {basket.length < 4 && (
            <button onClick={() => navigate('home')} style={{
              padding: '10px 18px', background: 'transparent', border: `1px solid ${T.rule}`,
              fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', color: T.ink2, cursor: 'pointer',
            }}>+ Ajouter un germe</button>
          )}
          <button onClick={() => navigate('home')} style={{
            padding: '10px 18px', background: 'transparent', border: `1px solid ${T.rule}`,
            fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', color: T.ink3, cursor: 'pointer',
          }}>← Retour à l'accueil</button>
        </div>
      </div>
    </div>
  )
}
