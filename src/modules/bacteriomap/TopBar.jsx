import { T } from './data.js'
import DarkToggle from './DarkToggle.jsx'

const btnBase = {
  cursor: 'pointer',
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: '0.12em',
  transition: 'color .12s, border-color .12s, background .12s',
}

function NavBtn({ onClick, children, style = {} }) {
  return (
    <span
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--bg)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ruleSoft)'; e.currentTarget.style.color = 'var(--ink3)'; e.currentTarget.style.background = 'transparent' }}
      style={{ ...btnBase, color: 'var(--ink3)', border: '1px solid var(--ruleSoft)', padding: '2px 8px', ...style }}
    >{children}</span>
  )
}

export default function TopBar({ navigate, center, onBack }) {
  return (
    <div style={{
      padding: '13px 40px', borderBottom: '0.5px solid var(--rule)',
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)',
      letterSpacing: '0.14em', background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {onBack && (
        <NavBtn onClick={onBack} style={{ fontSize: 12, letterSpacing: 0, padding: '3px 10px' }}>←</NavBtn>
      )}
      <NavBtn onClick={() => navigate('home')}>ACCUEIL</NavBtn>
      <span style={{ flex: 1, textAlign: 'center', fontStyle: 'italic',
                     fontFamily: T.serif, letterSpacing: 0, fontSize: 12,
                     color: 'var(--ink2)' }}>{center}</span>
      <NavBtn onClick={() => navigate('admin')}>ADMIN</NavBtn>
      <DarkToggle />
    </div>
  )
}
