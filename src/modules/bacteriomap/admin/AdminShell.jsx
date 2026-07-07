import React from 'react'
import { T } from '../data.js'
import { supabase } from '../../../lib/supabase.js'
import { useIsMobile } from '../../../hooks/useIsMobile.js'
import AdminSystems from './AdminSystems.jsx'
import AdminBacteria from './AdminBacteria.jsx'
import AdminMilieux from './AdminMilieux.jsx'
import AdminQuiz from './AdminQuiz.jsx'
import AdminPalette from './AdminPalette.jsx'
import AdminPathologies from './AdminPathologies.jsx'

const TABS = [
  { id: 'dashboard',    num: 'I',    label: 'Tableau de bord' },
  { id: 'systems',      num: 'II',   label: 'Systèmes & Zones' },
  { id: 'bacteria',     num: 'III',  label: 'Bactéries' },
  { id: 'milieux',      num: 'IV',   label: 'Milieux' },
  { id: 'pathologies',  num: 'V',    label: 'Pathologies' },
  { id: 'quiz',         num: 'VI',   label: 'Formation' },
  { id: 'palette',      num: 'VII',  label: 'Couleurs' },
]

const EXPORT_TABLES = [
  'bacterio_systems', 'bacterio_zones', 'bacterio_bacteria', 'bacterio_images',
  'bacterio_milieux', 'bacterio_pathologies', 'bacterio_pathologie_germes',
  'bacterio_zone_bacteria', 'bacterio_system_bacteria', 'bacterio_quiz',
]

async function exportCanonicalJSON() {
  const results = await Promise.all(
    EXPORT_TABLES.map(t => supabase.from(t).select('*').limit(10000).then(({ data }) => [t, data || []]))
  )
  const payload = {
    version: 1,
    exported_at: new Date().toISOString(),
    systems:            results.find(([t]) => t === 'bacterio_systems')?.[1],
    zones:              results.find(([t]) => t === 'bacterio_zones')?.[1],
    bacteria:           results.find(([t]) => t === 'bacterio_bacteria')?.[1],
    images:             results.find(([t]) => t === 'bacterio_images')?.[1],
    milieux:            results.find(([t]) => t === 'bacterio_milieux')?.[1],
    pathologies:        results.find(([t]) => t === 'bacterio_pathologies')?.[1],
    pathologie_germes:  results.find(([t]) => t === 'bacterio_pathologie_germes')?.[1],
    zone_bacteria:      results.find(([t]) => t === 'bacterio_zone_bacteria')?.[1],
    system_bacteria:    results.find(([t]) => t === 'bacterio_system_bacteria')?.[1],
    quiz:               results.find(([t]) => t === 'bacterio_quiz')?.[1],
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href     = url
  a.download = `bacteriomap-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function Dashboard({ onNavigate }) {
  const [counts, setCounts] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const [sys, zones, bact, quiz, patho, imgs, lastBact, lastZone, lastPatho] = await Promise.all([
        supabase.from('bacterio_systems').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_zones').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_bacteria').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_quiz').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_pathologies').select('id', { count: 'exact', head: true }),
        supabase.from('bacterio_bacteria').select('id', { count: 'exact', head: true }).not('image_url', 'is', null),
        supabase.from('bacterio_bacteria').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('bacterio_zones').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('bacterio_pathologies').select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const dates = [lastBact.data?.updated_at, lastZone.data?.updated_at, lastPatho.data?.updated_at]
        .filter(Boolean).map(d => new Date(d))
      const lastModified = dates.length
        ? new Date(Math.max(...dates)).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
        : null
      setCounts({
        systems:      sys.count ?? 0,
        zones:        zones.count ?? 0,
        bacteria:     bact.count ?? 0,
        quiz:         quiz.count ?? 0,
        pathologies:  patho.count ?? 0,
        images:       imgs.count ?? 0,
        lastModified,
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
        <h1 style={{ fontFamily: T.serif, fontSize: 52, fontWeight: 500, fontStyle: 'italic', margin: 0, letterSpacing: '-0.02em' }}>L'Admin</h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink2, marginTop: 8, maxWidth: 600, lineHeight: 1.55 }}>
          Interface de gestion des données Supabase : systèmes anatomiques, bactéries, milieux de culture et questions de quiz.
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement des statistiques…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { key: 'systems',     label: 'SYSTÈMES',    tab: 'systems' },
            { key: 'zones',       label: 'ZONES',        tab: 'systems' },
            { key: 'bacteria',    label: 'BACTÉRIES',    tab: 'bacteria' },
            { key: 'pathologies', label: 'PATHOLOGIES',  tab: 'pathologies' },
            { key: 'images',      label: 'IMAGES',       tab: 'bacteria' },
            { key: 'quiz',        label: 'QUESTIONS',    tab: 'quiz' },
          ].map(({ key, label, tab }) => (
            <div key={key} style={cardStyle}>
              <div style={countStyle}>{counts?.[key] ?? '—'}</div>
              <div style={labelStyle}>{label}</div>
            </div>
          ))}
          <div style={cardStyle}>
            <div style={{ ...countStyle, fontSize: counts?.lastModified ? 18 : 40, paddingTop: counts?.lastModified ? 12 : 0 }}>
              {counts?.lastModified ?? '—'}
            </div>
            <div style={labelStyle}>MODIFIÉ LE</div>
          </div>
        </div>
      )}

      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 14, paddingTop: 20, borderTop: `1px solid var(--ruleSoft)` }}>ACCÈS RAPIDE</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { tab: 'systems',  label: 'Systèmes & Zones' },
          { tab: 'bacteria', label: 'Bactéries' },
          { tab: 'milieux',  label: 'Milieux de culture' },
          { tab: 'quiz',     label: 'Formation' },
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

      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 14, marginTop: 32, paddingTop: 20, borderTop: `1px solid var(--ruleSoft)` }}>SAUVEGARDE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={async () => { setExporting(true); try { await exportCanonicalJSON() } finally { setExporting(false) } }}
          disabled={exporting}
          style={{
            padding: '10px 18px',
            background: exporting ? T.bg : 'var(--accent)',
            border: 'none',
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: exporting ? T.ink3 : 'var(--paper)',
            cursor: exporting ? 'wait' : 'pointer',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? 'EXPORT EN COURS…' : '↓ EXPORTER LES DONNÉES'}
        </button>
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.ink3 }}>
          Télécharge un JSON complet de tout le contenu (backup local).
        </span>
      </div>
    </div>
  )
}

export default function AdminShell({ navigate }) {
  const [session, setSession] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [email, setEmail]     = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError]     = React.useState('')
  const [tab, setTab]         = React.useState(() => sessionStorage.getItem('admin_tab') || 'dashboard')
  const mobile = useIsMobile()

  const navigate_tab = React.useCallback((t) => {
    sessionStorage.setItem('admin_tab', t)
    setTab(t)
  }, [])

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const tryLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Identifiants incorrects.')
  }

  if (loading) return null

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ maxWidth: 420, width: '100%', background: T.paper, border: `0.5px solid ${T.rule}`, padding: '44px 40px' }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: 'var(--accent)', marginBottom: 4 }}>Annexe administrative</div>
          <h1 style={{ fontFamily: T.serif, fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, fontStyle: 'italic', margin: 0 }}>Admin</h1>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.ink2, marginTop: 14, lineHeight: 1.5 }}>
            L'accès est protégé. Connectez-vous avec vos identifiants.
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>EMAIL</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') tryLogin() }}
                autoFocus
                style={{ width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 14, color: T.ink, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.16em', marginBottom: 8 }}>MOT DE PASSE</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') tryLogin() }}
                style={{ width: '100%', padding: '10px 12px', background: T.bg, border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 14, color: T.ink, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {error && (
              <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--red)', letterSpacing: '0.06em' }}>{error}</div>
            )}
            <button onClick={tryLogin} style={{ width: '100%', padding: '12px 18px', background: T.ink, color: T.paper, border: 'none', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.16em', cursor: 'pointer' }}>
              ENTRER
            </button>
            <button onClick={() => navigate('home')} style={{ width: '100%', padding: '10px 18px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.12em', color: T.ink3, cursor: 'pointer' }}>
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mobile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: T.paper, borderBottom: `0.5px solid ${T.rule}`, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={tab}
            onChange={e => navigate_tab(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', fontFamily: T.mono, fontSize: 11, color: T.ink, background: T.bg, border: `1px solid ${T.rule}`, outline: 'none' }}
          >
            {TABS.map(t => <option key={t.id} value={t.id}>{t.num} · {t.label}</option>)}
          </select>
          <button onClick={() => navigate('home')} style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, color: T.ink3, cursor: 'pointer' }}>← Quitter</button>
        </div>
        <div style={{ flex: 1, padding: '20px 16px 40px', overflowY: 'auto' }}>
          {tab === 'dashboard' && <Dashboard onNavigate={navigate_tab} />}
          {tab === 'systems'   && <AdminSystems />}
          {tab === 'bacteria'  && <AdminBacteria />}
          {tab === 'milieux'   && <AdminMilieux />}
          {tab === 'pathologies' && <AdminPathologies />}
          {tab === 'quiz'        && <AdminQuiz />}
          {tab === 'palette'     && <AdminPalette />}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: T.bg }}>
      {/* Sidebar */}
      <div style={{ width: 190, flexShrink: 0, background: T.paper, borderRight: `0.5px solid ${T.rule}`, display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: `0.5px solid ${T.rule}` }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: 'var(--accent)', marginBottom: 2, letterSpacing: '0.02em' }}>Bacteriomap</div>
          <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: T.ink }}>Admin</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => navigate_tab(t.id)}
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
                  color: isActive ? T.ink : T.ink3,
                }}
              >
                <span style={{ fontFamily: T.mono, fontSize: 9, color: isActive ? 'var(--accent)' : T.ink3, width: 22, flexShrink: 0, letterSpacing: '0.04em' }}>{t.num}</span>
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
            ← Quitter l'admin
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ width: '100%', marginTop: 6, padding: '8px 12px', background: 'transparent', border: `1px solid ${T.rule}`, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.08em', color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content — height:100vh makes this the actual scroll container so position:sticky works */}
      <div style={{ flex: 1, minWidth: 0, padding: '28px 32px 60px', overflowY: 'auto', height: '100vh' }}>
        {tab === 'dashboard'    && <Dashboard onNavigate={setTab} />}
        {tab === 'systems'      && <AdminSystems />}
        {tab === 'bacteria'     && <AdminBacteria />}
        {tab === 'milieux'      && <AdminMilieux />}
        {tab === 'pathologies'  && <AdminPathologies />}
        {tab === 'quiz'         && <AdminQuiz />}
        {tab === 'palette'      && <AdminPalette />}
      </div>
    </div>
  )
}
