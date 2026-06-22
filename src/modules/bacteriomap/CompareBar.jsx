import React from 'react'
import { T } from './data.js'
import { useCompare } from '../../context/CompareContext.jsx'

export default function CompareBar({ navigate }) {
  const { basket, remove, clear } = useCompare()

  if (basket.length === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: T.ink, borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      {/* Label */}
      <span style={{ fontFamily: T.mono, fontSize: 9, color: 'rgba(248,243,229,0.5)', letterSpacing: '0.18em', flexShrink: 0 }}>
        COMPARAISON
      </span>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
        {basket.map(b => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.1)', padding: '4px 10px',
            borderRadius: 4,
          }}>
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'rgba(248,243,229,0.9)' }}>
              {b.name}
            </span>
            <button
              onClick={() => remove(b.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(248,243,229,0.5)', cursor: 'pointer', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Centre hint */}
      {basket.length < 2 && (
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'rgba(248,243,229,0.5)', flexShrink: 0 }}>
          Sélectionner au moins 2 germes
        </span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={clear}
          style={{
            padding: '6px 14px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(248,243,229,0.6)',
            fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer',
          }}>
          Vider
        </button>
        <button
          onClick={() => basket.length >= 2 && navigate('compare')}
          disabled={basket.length < 2}
          style={{
            padding: '6px 16px',
            background: basket.length >= 2 ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
            border: 'none', color: basket.length >= 2 ? '#fff' : 'rgba(248,243,229,0.35)',
            fontFamily: T.mono, fontSize: 10, letterSpacing: '0.1em',
            cursor: basket.length >= 2 ? 'pointer' : 'default',
          }}>
          COMPARER →
        </button>
      </div>
    </div>
  )
}
