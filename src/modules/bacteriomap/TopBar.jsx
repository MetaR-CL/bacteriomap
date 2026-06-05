import { T } from './data.js'

export default function TopBar({ navigate, center, onBack }) {
  return (
    <div style={{
      padding: '13px 40px', borderBottom: '0.5px solid var(--rule)',
      display: 'flex', alignItems: 'center', gap: 16,
      fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)',
      letterSpacing: '0.14em', background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {onBack && (
        <span style={{ cursor: 'pointer', color: 'var(--ink2)' }}
              onClick={onBack}>←</span>
      )}
      <span style={{ cursor: 'pointer', color: 'var(--ink3)' }}
            onClick={() => navigate('home')}>ACCUEIL</span>
      <span style={{ flex: 1, textAlign: 'center', fontStyle: 'italic',
                     fontFamily: T.serif, letterSpacing: 0, fontSize: 12,
                     color: 'var(--ink2)' }}>{center}</span>
      <span style={{ cursor: 'pointer', color: 'var(--ink3)',
                     border: '1px solid var(--ruleSoft)', padding: '2px 8px' }}
            onClick={() => navigate('admin')}>ADMIN</span>
    </div>
  )
}
