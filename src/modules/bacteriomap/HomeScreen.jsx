// HomeScreen.jsx — Atlas de microbiologie clinique
import { useState, useEffect, useRef } from 'react'
import { T } from './data.js'
import { MorphoSVG, gramColor } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useAllBacteria } from '../../hooks/useAllBacteria.js'
import DarkToggle from './DarkToggle.jsx'

const GRAM_DISPLAY = { positif: '+', negatif: '−', aucun: 'F' }

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

function BacterioMark({ size = 26 }) {
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

function SystemCard({ sys, wide = false, navigate }) {
  const [hover, setHover] = useState(false)
  const accent = sys.color || '#8b7355'
  const speciesCount = sys.bacterio_zones?.reduce((sum, z) => sum + (z.n || 0), 0) || 0
  const hasImage = !!sys.image_url

  return (
    <div
      onClick={() => navigate('zone', { systemId: sys.slug })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 150px',
        alignItems: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        background: hover ? `${accent}14` : 'var(--paper)',
        border: '1px solid var(--rule)',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
        padding: '24px 28px',
        minHeight: wide ? 100 : 116,
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover
          ? '0 14px 30px -18px rgba(44,38,32,0.45)'
          : '0 1px 0 rgba(255,255,255,0.5) inset',
        transition: 'all .22s cubic-bezier(.2,.7,.3,1)',
        userSelect: 'none',
      }}
    >
      {/* Text cell */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: T.serif, fontSize: 24, color: 'var(--ink)', lineHeight: 1.14 }}>
          {sys.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 9, flexWrap: 'wrap' }}>
          {sys.subtitle && (
            <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.04em', color: 'var(--ink2)' }}>
              {sys.subtitle}
            </span>
          )}
          {speciesCount > 0 && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink3)', flexShrink: 0 }} />
              <span style={{ fontFamily: T.mono, fontSize: 11, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
                {speciesCount} espèces
              </span>
            </>
          )}
        </div>
      </div>

      {/* Illustration cell */}
      <div style={{ position: 'relative', height: '100%', minHeight: 90 }}>
        <div style={{
          position: 'absolute', right: -26, top: '50%', transform: 'translateY(-50%)',
          width: 190, height: 190,
          opacity: hover ? 0.9 : 0.6,
          maskImage: 'radial-gradient(circle at 55% 50%, #000 52%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(circle at 55% 50%, #000 52%, transparent 76%)',
          transition: 'opacity .25s',
          borderRadius: '50%',
          overflow: 'hidden',
          isolation: 'isolate',
        }}>
          {hasImage ? (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${sys.image_url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(1) contrast(1.05)',
              }}/>
              <div style={{ position: 'absolute', inset: 0, background: accent, mixBlendMode: 'color' }}/>
              <div style={{ position: 'absolute', inset: 0, background: accent, mixBlendMode: 'multiply', opacity: 0.35 }}/>
            </>
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}22`,
            }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <MorphoSVG kind={SYSTEM_MORPHO[sys.slug] || 'rod'} size={100} stroke={accent} fill={accent} fillOpacity={0.3} strokeWidth={1.6}/>
              </svg>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={{
          position: 'absolute', right: 4, top: '50%',
          transform: `translateY(-50%) translateX(${hover ? 0 : -6}px)`,
          opacity: hover ? 1 : 0,
          transition: 'all .22s cubic-bezier(.2,.7,.3,1)',
          color: accent, display: 'flex', alignItems: 'center',
          zIndex: 2, pointerEvents: 'none',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

function FormationBanner({ navigate }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={() => navigate('quiz')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 26, cursor: 'pointer',
        background: '#2C2620', borderRadius: 12, padding: '24px 32px',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, minWidth: 0 }}>
        <span style={{
          display: 'grid', placeItems: 'center', width: 44, height: 44, flexShrink: 0,
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', color: '#F1ECDD',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19V6a2 2 0 0 1 2-2h7v15H6a2 2 0 0 0-2 2zM13 4h5a2 2 0 0 1 2 2v13"/>
          </svg>
        </span>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.22em', color: 'rgba(241,236,221,0.6)', textTransform: 'uppercase' }}>Formation</div>
          <div style={{ fontFamily: T.serif, fontSize: 23, color: '#F6F1E4', marginTop: 4, lineHeight: 1.2 }}>Tester mes connaissances</div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: 'rgba(241,236,221,0.65)', marginTop: 2 }}>Questions à choix multiples</div>
        </div>
      </div>
      <span style={{
        fontFamily: T.mono, fontSize: 12, letterSpacing: '0.12em', color: '#F1ECDD',
        border: `1px solid ${hover ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'}`,
        borderRadius: 8, padding: '11px 20px', flexShrink: 0,
        transition: 'border-color .15s',
      }}>
        Commencer →
      </span>
    </div>
  )
}

export default function HomeScreen({ navigate }) {
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: T.serif }}>

      {/* Header */}
      <header style={{
        padding: '22px 40px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <BacterioMark size={26} />
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, letterSpacing: '0.01em' }}>
            Bacterio<span style={{ fontWeight: 600, fontStyle: 'normal', color: T.ocre }}>map</span>
          </span>
          <span style={{ width: 1, height: 22, background: 'var(--rule)', margin: '0 4px' }} />
          <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.22em', color: 'var(--ink3)', textTransform: 'uppercase' }}>
            Atlas de microbiologie clinique
          </span>
        </div>
        <span
          onClick={() => navigate('admin')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink3)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--bg)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rule)'; e.currentTarget.style.color = 'var(--ink2)'; e.currentTarget.style.background = 'transparent' }}
          style={{
            cursor: 'pointer',
            fontFamily: T.mono, fontSize: 10.5, letterSpacing: '0.18em',
            color: 'var(--ink2)', border: '1px solid var(--rule)',
            padding: '6px 12px', borderRadius: 4,
            transition: 'color .12s, border-color .12s, background .12s',
          }}>ADMIN</span>
        <DarkToggle />
      </header>

      {/* Main container */}
      <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', padding: '44px 40px 56px', boxSizing: 'border-box' }}>

        {/* Search bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ position: 'relative', width: 560 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="7" stroke="var(--ink3)" strokeWidth="1.8"/>
              <path d="M21 21l-4.3-4.3" stroke="var(--ink3)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un site ou une espèce…"
              style={{
                width: '100%', padding: '15px 48px 15px 46px',
                background: 'var(--paper)',
                border: `1px solid ${query ? T.ocre : 'var(--rule)'}`,
                borderRadius: 10, outline: 'none',
                fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: 'var(--ink)',
                boxSizing: 'border-box',
                boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset',
              }}
            />
            {query
              ? <button onClick={() => { setQuery(''); searchRef.current?.focus() }}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink3)', padding: 4 }}>×</button>
              : <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: T.mono, fontSize: 11, color: 'var(--ink3)', border: '1px solid var(--rule)', borderRadius: 5, padding: '2px 8px', pointerEvents: 'none' }}>/</span>
            }
          </div>
        </div>

        {/* Species results */}
        {q && matchedSpecies.length > 0 && (
          <div style={{ marginBottom: 20, border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--paper)', overflow: 'hidden' }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', padding: '10px 16px 8px' }}>ESPÈCES</div>
            {matchedSpecies.map(b => {
              const gram = GRAM_DISPLAY[b.gram] || b.gram || '?'
              const { stroke } = gramColor(gram)
              return (
                <div key={b.id}
                     onClick={() => navigate('sheet', { bacteriaId: b.name, systemId: null })}
                     onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)' }}
                     onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                     style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 16px', cursor: 'pointer', borderTop: '1px solid var(--rule)', transition: 'background .1s' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: stroke, width: 46, flexShrink: 0 }}>GRAM {gram}</span>
                  <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>{b.name}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.ocre }}>↗</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Search count */}
        {q && (
          <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', marginBottom: 20 }}>
            {`${matchedSystems.length} CHAPITRE${matchedSystems.length !== 1 ? 'S' : ''} · ${matchedSpecies.length} ESPÈCE${matchedSpecies.length !== 1 ? 'S' : ''}`}
          </div>
        )}

        {/* Systems grid */}
        {sysLoading ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
        ) : q ? (
          matchedSystems.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {matchedSystems.map(sys => <SystemCard key={sys.id} sys={sys} navigate={navigate} />)}
            </div>
          ) : (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: '20px 0' }}>Aucun chapitre ne correspond.</div>
          )
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {systems.slice(0, 8).map(sys => <SystemCard key={sys.id} sys={sys} navigate={navigate} />)}
            </div>
            {systems[8] && (
              <div style={{ marginTop: 18 }}>
                <SystemCard sys={systems[8]} wide navigate={navigate} />
              </div>
            )}
          </>
        )}

        {/* Formation banner */}
        {!q && <FormationBanner navigate={navigate} />}
      </div>
    </div>
  )
}
