import { useDarkMode } from '../../hooks/useDarkMode.js'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function DarkToggle() {
  const [dark, setDark] = useDarkMode()
  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.color = 'var(--ink)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink2)' }}
      style={{
        width: 32, height: 32, padding: 0,
        border: '1px solid var(--rule)',
        background: 'var(--paper)', color: 'var(--ink2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, transition: 'background .12s, border-color .12s, color .12s',
        flexShrink: 0,
      }}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
