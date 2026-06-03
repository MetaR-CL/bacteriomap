// HomeScreen.jsx — Atlas de microbiologie clinique
import { useState, useEffect, useRef } from 'react'
import { T } from './data.js'
import { MorphoSVG, gramColor } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useAllBacteria } from '../../hooks/useAllBacteria.js'

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

  const renderCard = (sys) => {
    const accent = sys.color || '#8b7355'

    // Carte avec image pleine hauteur
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
             padding: '20px 22px',
             display: 'grid',
             gridTemplateColumns: hasImage ? '1fr' : '1fr auto',
             alignItems: 'center', gap: 14,
             transition: 'transform .14s, box-shadow .14s',
             minHeight: 90,
           }}>

        {/* Image duotone pleine hauteur à droite */}
        {hasImage && (
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
            overflow: 'hidden', pointerEvents: 'none',
          }}>
            <img src={sys.image_url} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              filter: 'grayscale(1) contrast(1.05)',
            }}/>
            <div style={{
              position: 'absolute', inset: 0,
              background: accent, mixBlendMode: 'multiply', opacity: 0.4,
            }}/>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, #faf6ec 0%, transparent 60%)',
            }}/>
          </div>
        )}

        {/* Contenu texte */}
        <div style={{ position: 'relative', zIndex: 1, minWidth: 0, maxWidth: hasImage ? '65%' : '100%' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: accent, letterSpacing: '0.18em' }}>
              {sys.short?.toUpperCase()}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.12em' }}>
              {/* nombre espèces si dispo */}
            </span>
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.04 }}>
            {sys.name}
          </div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)', marginTop: 5 }}>
            {sys.subtitle}
          </div>
        </div>

        {/* Vignette morpho si pas d'image */}
        {!hasImage && (
          <div style={{ width: 62, height: 62, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: accent + '22', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 100 100">
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
        <span style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.12em' }}>CHUV · ÉD. 2026</span>
      </div>

      {/* Barre de recherche */}
      <div style={{ padding: '24px 40px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
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
          <div style={{ marginTop: 14, border: '1px solid var(--ruleSoft)', background: 'var(--paper)' }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', padding: '10px 16px 8px' }}>ESPÈCES</div>
            {matchedSpecies.map(b => {
              const gram = GRAM_DISPLAY[b.gram] || b.gram || '?'
              const { stroke } = gramColor(gram)
              return (
                <div key={b.id}
                     onClick={() => navigate('sheet', { bacteriaId: b.name, systemId: null })}
                     style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 16px', cursor: 'pointer', borderTop: '1px solid var(--ruleSoft)' }}>
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
      <div style={{ padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
        {sysLoading
          ? <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
          : matchedSystems.length > 0
            ? matchedSystems.map(renderCard)
            : <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: '20px 0' }}>Aucun chapitre ne correspond.</div>
        }
      </div>

      {/* Annexes */}
      <div style={{ padding: '30px 40px 8px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 12 }}>ANNEXES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14 }}>
          {[
            { key: 'quiz',  kicker: 'RÉCRÉATION',    title: 'Qui suis-je ?', sub: "Quiz d'identification — quatre indices" },
            { key: 'admin', kicker: 'ADMINISTRATION', title: 'Atelier',       sub: 'Édition du contenu · accès protégé'    },
          ].map(({ key, kicker, title, sub }) => (
            <div key={key} onClick={() => navigate(key)}
                 style={{ cursor: 'pointer', border: '1px solid var(--ruleSoft)', borderLeft: '3px solid var(--ink3)', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 5 }}>{kicker}</div>
                <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500 }}>{title}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)', marginTop: 4 }}>{sub}</div>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 12, color: 'var(--ink3)' }}>↗</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Légende */}
      <div style={{ padding: '12px 40px', borderTop: '1px solid var(--rule)', display: 'flex', gap: 22, fontFamily: T.mono, fontSize: 10, color: 'var(--ink2)', letterSpacing: '0.06em', background: 'var(--paper)', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--ink3)', letterSpacing: '0.18em' }}>LÉGENDE</span>
        <span><span style={{ color: '#8b5cf6' }}>●</span> Gram positif</span>
        <span><span style={{ color: '#ec4899' }}>●</span> Gram négatif</span>
        <span><span style={{ color: '#3b82f6' }}>●</span> Fongique</span>
      </div>
    </div>
  )
}
