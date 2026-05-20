import React from 'react'
import { T } from '../data.js'
import { supabase } from '../../../lib/supabase.js'
import AdminSystems from './AdminSystems.jsx'
import AdminBacteria from './AdminBacteria.jsx'
import AdminMilieux from './AdminMilieux.jsx'
import AdminQuiz from './AdminQuiz.jsx'
import AdminPalette from './AdminPalette.jsx'

const TABS = [
  { id: 'dashboard', icon: '🏠', label: 'Tableau de bord' },
  { id: 'systems',   icon: '📋', label: 'Systèmes & Zones' },
  { id: 'bacteria',  icon: '🦠', label: 'Bactéries' },
  { id: 'milieux',   icon: '🧫', label: 'Milieux' },
  { id: 'quiz',      icon: '❓', label: 'Quiz' },
  { id: 'palette',   icon: '🎨', label: 'Couleurs' },
]

function Dashboard({ onNavigate }) {
  const [counts, setCounts] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const [sys, zones, bact, quiz] = await Promise.all([
        supabase.from('bacterio_systems').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_zones').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_bacteria').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_quiz').select('id', { count: 'exact', head: true }),
      ])
      setCounts({
        systems: sys.count ?? 0,
        zones:   zones.count ?? 0,
        bacteria: bact.count ?? 0,
        quiz:    quiz.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cardStyle = {
    background: T.paper,
    border: `0.5px solid ${T.rule}`,
    padding: '24px 28px',
    flex: 1,
  }
  const countStyle = {
    fontFamily: T.mono,
    fontSize: 40,
    fontWeight: 700,
    color: T.ink,
    lineHeight: 1,
    marginBottom: 6,
  }
  const labelStyle = {
    fontFamily: T.mono,
    fontSize: 9,
    color: T.ink3,
    letterSpacing: '0.16em',
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: 'var(--accent)', marginBottom: 6 }}>Bienvenue dans</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 52, fontWeight: 500, fontStyle: 'italic', margin: 0, letterSpacing: '-0.02em' }}>L'Atelier</h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink2, marginTop: 8, maxWidth: 600, lineHeight: 1.55 }}>
          Interface de gestion des données Supabase : systèmes anatomiques, bactéries, milieux de culture et questions de quiz.
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des statistiques…</div>
      ) : (
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { key: 'systems',  label: 'SYSTÈMES',  tab: 'systems' },
            { key: 'zones',    label: 'ZONES',      tab: 'systems' },
            { key: 'bacteria', label: 'BACTÉRIES',  tab: 'bacteria' },
            { key: 'quiz',     label: 'QUESTIONS',  tab: 'quiz' },
          ].map(({ key, label, tab }) => (
            <div key={key} style={cardStyle}>
              <div style={countStyle}>{counts?.[key] ?? '—'}</div>
              <div style={labelStyle}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 14, paddingTop: 20, borderTop: `1px solid var(--ruleSoft)` }}>ACCÈS RAPIDE</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { tab: 'systems',  label: 'Systèmes & Zones' },
          { tab: 'bacteria', label: 'Bactéries' },
          { tab: 'milieux',  label: 'Milieux de culture' },
          { tab: 'quiz',     label: 'Questions Quiz' },
        ].map(({ tab, label }) => (
          <button key={tab} onClick={() => onNavigate(tab)} style={{
            padding: '10px 18px',
            background: T.paper,
            border: `0.5px solid ${T.rule}`,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: T.ink2,
            cursor: 'pointer',
          }}>
            {label.toUpperCase()} →
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AdminShell({ navigate }) {
  const [unlocked, setUnlocked] = React.useState(() => sessionStorage.getItem('bm.adminUnlocked') === '1')
  const [pwInput, setPwInput]   = React.useState('')
  const [pwError, setPwError]   = React.useState('')
  const [tab, setTab]           = React.useState('dashboard')

  const tryUnlock = () => {
    if (pwInput === 'admin') {
      sessionStorage.setItem('bm.adminUnlocked', '1')
      setUnlocked(true)
      setPwError('')
    } else {
      setPwError('Mot de passe incorrect.')
    }
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ maxWidth: 420, width: '100%', background: T.paper, border: `0.5px solid ${T.rule}`, padding: '44px 40px' }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: 'var(--accent)', marginBottom: 4 }}>Annexe administrative</div>
          <h1 style={{ fontFamily: T.serif, fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, fontStyle: 'italic', margin: 0 }}>Atelier</h1>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink2, marginTop: 14, lineHeight: 1.5 }}>
            L'accès est protégé. Indiquez votre mot de passe.
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>MOT DE PASSE</div>
            <input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') tryUnlock() }}
              autoFocus
              style={{ width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 14, color: T.ink, outline: 'none', boxSizing: 'border-box' }}
            />
            {pwError && (
              <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--red)', marginTop: 8, letterSpacing: '0.06em' }}>{pwError}</div>
            )}
            <button onClick={tryUnlock} style={{ marginTop: 14, width: '100%', padding: '12px 18px', background: T.ink, color: T.paper, border: 'none', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.16em', cursor: 'pointer' }}>
              ENTRER
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: T.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0, background: T.paper, borderRight: `0.5px solid ${T.rule}`, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: `0.5px solid ${T.rule}` }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: 'var(--accent)', marginBottom: 2, letterSpacing: '0.02em' }}>Bacteriomap</div>
          <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: T.ink }}>Atelier</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  background: isActive ? T.bg : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? `3px solid var(--accent)` : '3px solid transparent',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontFamily: T.mono,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  color: isActive ? T.ink : T.ink2,
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 16px 24px', borderTop: `0.5px solid ${T.rule}` }}>
          <button
            onClick={() => navigate('home')}
            style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.08em', color: T.ink3, cursor: 'pointer', textAlign: 'left' }}
          >
            ← Quitter l'atelier
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('bm.adminUnlocked'); setUnlocked(false) }}
            style={{ width: '100%', marginTop: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.08em', color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}
          >
            Verrouiller
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, padding: '36px 48px 60px', overflowY: 'auto' }}>
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'systems'   && <AdminSystems />}
        {tab === 'bacteria'  && <AdminBacteria />}
        {tab === 'milieux'   && <AdminMilieux />}
        {tab === 'quiz'      && <AdminQuiz />}
        {tab === 'palette'   && <AdminPalette />}
      </div>
    </div>
  )
}
