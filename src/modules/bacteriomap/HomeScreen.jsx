// HomeScreen.jsx — Atlas de microbiologie clinique
import { useState, useEffect, useRef } from 'react'
import { T } from './data.js'
import { MorphoSVG, gramColor } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useAllBacteria } from '../../hooks/useAllBacteria.js'
import { useDarkMode } from '../../hooks/useDarkMode.js'

const GRAM_DISPLAY = { positif: '+', negatif: '−', aucun: 'F' }

function BacterioMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
      <circle cx="16" cy="16" r="13" stroke={T.ink2} strokeWidth="1.2" fill={T.paper} />
      <circle cx="16" cy="16" r="13" stroke={T.ocre} strokeWidth="1.2" fill="none" strokeDasharray="0.5 3.2" />
      <circle cx="12" cy="12.5" r="2.6" fill={T.ocre} fillOpacity="0.85" />
      <circle cx="18.5" cy="11" r="1.7" fill={T.ink2} fillOpacity="0.7" />
      <rect x="17.5" y="17.5" width="6.5" height="2.6" rx="1.3" transform="rotate(18 17.5 17.5)" fill={T.ink2} fillOpacity="0.55" />
      <circle cx="11.5" cy="19.5" r="1.3" fill={T.ocre} fillOpacity="0.6" />
      <circle cx="15.5" cy="16" r="0.9" fill={T.ink2} fillOpacity="0.45" />
    </svg>
  )
}

const SYSTEM_MORPHO = {
  snc:  'cocci-pairs',
  yeux: 'cocci-cluster',
  orl:  'cocci-chains',
  resp: 'cocci-pairs',
  osa:  'cocci-cluster',
  cv:   'cocci-chains',
  dig:  'rod',
  uri:  'rod',
  peau: 'cocci-cluster',
  gen:  'spiral',
}

const centeredBlock = { maxWidth: 1280, margin: '0 auto', width: '100%' }

export default function HomeScreen({ navigate }) {
  const [dark] = useDarkMode()
  const { systems, loading: sysLoading } = useSystems()
  const { bacteria: allBacteria } = useAllBacteria()

  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const q = query.trim().toLowerCase()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault(); searchRef.current?.focus()
      } else if (e.key === 'Escape') {
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const norm = (s) => (s || '').toLowerCase()

  const matchedSystems = q
    ? systems.filter(s => norm(s.name).includes(q) || norm(s.short).includes(q) || norm(s.subtitle).includes(q))
    : systems

  const matchedSpecies = q
    ? allBacteria.filter(b => norm(b.name).includes(q) || norm(b.morphology).includes(q)).slice(0, 8)
    : []

  const renderCard = (sys) => {
    const accent = sys.color || '#8b7355'
    const hasImage = !!sys.image_url

    return (
      <div key={sys.id}
           onClick={() => navigate('zone', { systemId: sys.slug })}
           onMouseEnter={e => {
             e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accent}44`
             e.currentTarget.style.transform = 'translateY(-2px)'
           }}
           onMouseLeave={e => {
             e.currentTarget.style.boxShadow = 'none'
             e.currentTarget.style.transform = 'none'
           }}
           style={{
             cursor: 'pointer', position: 'relative', overflow: 'hidden',
             background: 'var(--paper)',
             border: '1px solid var(--ruleSoft)', borderLeft: `3px solid ${accent}`,
             padding: '28px 32px',
             display: 'grid',
             gridTemplateColumns: hasImage ? '1fr' : '1fr auto',
             alignItems: 'center', gap: 14,
             transition: 'transform .14s, box-shadow .14s',
             minHeight: 90,
           }}>

        {/* Image duotone pleine hauteur à droite */}
        {hasImage && (
          <>
            <div aria-hidden="true" style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: '58%',
              pointerEvents: 'none', isolation: 'isolate', opacity: 0.62,
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 45%, #000 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 45%, #000 100%)',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${sys.image_url})`,
                backgroundSize: 'cover', backgroundPosition: 'center right',
                filter: 'grayscale(1) contrast(1.05)',
              }}/>
              <div style={{ position: 'absolute', inset: 0, background: accent, mixBlendMode: 'color' }}/>
              <div style={{ position: 'absolute', inset: 0, background: accent, mixBlendMode: 'multiply', opacity: 0.35 }}/>
            </div>
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to right, #faf6ec 28%, rgba(250,246,236,0.8) 48%, transparent 78%)',
            }}/>
          </>
        )}

        {/* Contenu texte */}
        <div style={{ position: 'relative', zIndex: 1, minWidth: 0, maxWidth: hasImage ? '65%' : '100%' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: accent, letterSpacing: '0.18em' }}>
              {sys.short?.toUpperCase()}
            </span>
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.04 }}>
            {sys.name}
          </div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)', marginTop: 5 }}>
            {sys.subtitle}
          </div>
        </div>

        {/* Vignette morpho si pas d'image */}
        {!hasImage && (
          <div style={{ width: 74, height: 74, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: accent + '22', flexShrink: 0 }}>
            <svg width="48" height="48" viewBox="0 0 100 100">
              <MorphoSVG kind={SYSTEM_MORPHO[sys.slug] || 'rod'} size={100} stroke={accent} fill={accent} fillOpacity={0.3} strokeWidth={1.6} />
            </svg>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Navbar sticky */}
      <div style={{ padding: '14px 40px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 13, background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5 }}>
        <BacterioMark size={28} />
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, letterSpacing: '-0.01em' }}>
          Bacterio<span style={{ color: T.ocre }}>map</span>
        </span>
        <span style={{ width: 1, height: 18, background: 'var(--rule)', margin: '0 6px' }} />
        <span style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.14em' }}>ATLAS DE MICROBIOLOGIE CLINIQUE</span>
        <span style={{ flex: 1 }} />
        <span
          onClick={() => navigate('admin')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--bg)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ruleSoft)'; e.currentTarget.style.color = 'var(--ink3)'; e.currentTarget.style.background = 'transparent' }}
          style={{ cursor: 'pointer', color: 'var(--ink3)', border: '1px solid var(--ruleSoft)', padding: '2px 8px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.12em', transition: 'color .12s, border-color .12s, background .12s', marginRight: 46 }}>ADMIN</span>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.12em' }}>CHUV · ÉD. 2026</span>
      </div>

      {/* Barre de recherche */}
      <div style={{ padding: '24px 40px 16px' }}>
        <div style={{ ...centeredBlock, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 360px', maxWidth: 520 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="10.5" cy="10.5" r="6.5" stroke="var(--ink3)" strokeWidth="1.6"/>
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="var(--ink3)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un site ou une espèce…"
              style={{
                width: '100%', padding: '11px 38px 11px 38px', background: 'var(--paper)',
                border: `1px solid ${query ? T.ocre : 'var(--rule)'}`, outline: 'none',
                fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: 'var(--ink)',
                boxSizing: 'border-box',
              }}
            />
            {query
              ? <button onClick={() => { setQuery(''); searchRef.current?.focus() }}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--ink3)', padding: 4 }}>×</button>
              : <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', border: '1px solid var(--ruleSoft)', borderRadius: 3, padding: '2px 6px', pointerEvents: 'none' }}>/</span>
            }
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            {q
              ? `${matchedSystems.length} CHAPITRE${matchedSystems.length !== 1 ? 'S' : ''} · ${matchedSpecies.length} ESPÈCE${matchedSpecies.length !== 1 ? 'S' : ''}`
              : `${systems.length} CHAPITRES`}
          </div>
        </div>

        {/* Résultats espèces */}
        {q && matchedSpecies.length > 0 && (
          <div style={{ ...centeredBlock, marginTop: 14, border: '1px solid var(--ruleSoft)', background: 'var(--paper)' }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', padding: '10px 16px 8px' }}>ESPÈCES</div>
            {matchedSpecies.map(b => {
              const gram = GRAM_DISPLAY[b.gram] || b.gram || '?'
              const { stroke } = gramColor(gram)
              return (
                <div key={b.id}
                     onClick={() => navigate('sheet', { bacteriaId: b.name, systemId: null })}
                     onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)' }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                     style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 16px', cursor: 'pointer', borderTop: '1px solid var(--ruleSoft)', transition: 'background .1s' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: stroke, width: 46, flexShrink: 0 }}>GRAM {gram}</span>
                  <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>{b.name}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ocre }}>↗</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Grille systèmes */}
      <div style={{ padding: '0 40px' }}>
        <div style={{ ...centeredBlock, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {sysLoading
            ? <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
            : matchedSystems.length > 0
              ? matchedSystems.map(renderCard)
              : <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: '20px 0' }}>Aucun chapitre ne correspond.</div>
          }
        </div>
      </div>

      {/* Quiz — centré, caché si recherche active */}
      {!q && (
        <div style={{ padding: '24px 40px 0' }}>
          <div style={{ ...centeredBlock, maxWidth: 640 }}>
            <div key="quiz" onClick={() => navigate('quiz')}
                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(0,0,0,0.15)' }}
                 onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                 style={{ cursor: 'pointer', border: '1px solid var(--ruleSoft)', borderLeft: '3px solid var(--ink3)', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, background: 'var(--paper)', transition: 'transform .14s, box-shadow .14s' }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 5 }}>FORMATION</div>
                <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500 }}>Formation</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>Questions à choix multiples</div>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 12, color: 'var(--ink3)' }}>↗</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />
    </div>
  )
}
