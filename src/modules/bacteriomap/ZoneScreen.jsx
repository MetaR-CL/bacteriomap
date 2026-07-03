import React from 'react'
import { T } from './data.js'
import { gramColor, MorphoSVG } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useBacteria } from '../../hooks/useBacteria.js'
import { usePathologies, useSystemPathologies } from '../../hooks/usePathologies.js'
import { useIsMobile } from '../../hooks/useIsMobile.js'
import { useCompare } from '../../context/CompareContext.jsx'
import TopBar from './TopBar.jsx'

const GRAM_MAP = { positif: '+', negatif: '−', aucun: 'F' }
function normalize(b) {
  return {
    ...b,
    gram: GRAM_MAP[b.gram] || b.gram,
    morpho: b.morphology || b.morpho || 'rod',
  }
}

export default function ZoneScreen({ navigate, systemId = 'snc', vivid = false, showImages = true }) {
  const { systems, loading: sysLoading } = useSystems()
  const { add, has, basket } = useCompare()
  const [activeZoneId, setActiveZoneId] = React.useState(null)
  const mobile = useIsMobile()

  const sys = systems.find(s => s.slug === systemId) || systems[0]
  const zones = sys?.bacterio_zones || []

  React.useEffect(() => {
    if (zones.length > 0 && activeZoneId === null) {
      setActiveZoneId(zones[0].id)
    }
  }, [zones.length]) // eslint-disable-line

  React.useEffect(() => {
    setActiveZoneId(null)
  }, [systemId])

  const activeZone = zones.find(z => z.id === activeZoneId) || zones[0] || null

  const zoneReady = !sysLoading && zones.length > 0
  const zoneIdToFetch = zoneReady ? (activeZoneId ?? zones[0]?.id ?? null) : null
  const { bacteria, loading: bacteriaLoading } = useBacteria(zoneIdToFetch)
  const { bacteria: flora, loading: floraLoading } = useBacteria(zoneIdToFetch, true)
  const { pathologies, loading: pathoLoading } = usePathologies(zoneIdToFetch)
  const { pathologies: systemPathologies, loading: sysPathoLoading } = useSystemPathologies(sys?.id ?? null)

  // Bacteria IDs already linked to at least one pathologie
  const [linkedBacteriaIds, setLinkedBacteriaIds] = React.useState(new Set())

  React.useEffect(() => {
    if (!zoneIdToFetch || pathoLoading || pathologies.length === 0) {
      setLinkedBacteriaIds(new Set())
      return
    }
    const ids = pathologies.map(p => p.id)
    import('../../lib/supabase').then(({ supabase }) => {
      supabase
        .from('bacterio_pathologie_germes')
        .select('bacteria_id')
        .in('pathologie_id', ids)
        .then(({ data }) => setLinkedBacteriaIds(new Set((data || []).map(r => r.bacteria_id))))
    })
  }, [zoneIdToFetch, pathologies.length, pathoLoading]) // eslint-disable-line

  if (sysLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, color: T.ink3, fontStyle: 'italic' }}>
      Chargement…
    </div>
  )

  if (!sys) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, color: T.ink3, fontStyle: 'italic' }}>
      Système introuvable.
    </div>
  )

  const accent = sys.color || 'var(--accent)'

  // Germes sans pathologie (pathogènes de la zone non liés à aucune pathologie)
  const orphanBacteria = bacteria.map(normalize).filter(b => !linkedBacteriaIds.has(b.id))

  function BactCard({ b, height = 180, opacity = 1, imgFilter }) {
    const c = gramColor(b.gram)
    const img = b.bacterio_images?.[0]
    const inBasket = has(b.id)
    return (
      <div
        style={{ background: 'var(--paper)', border: '0.5px solid var(--rule)', cursor: 'pointer', position: 'relative', transition: 'transform .14s, box-shadow .14s', opacity }}
        onClick={() => navigate('sheet', { bacteriaId: b.name, systemId })}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accent}44` }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <button
          onClick={e => { e.stopPropagation(); if (!inBasket && basket.length < 4) add(b) }}
          title={inBasket ? 'Dans la comparaison' : basket.length >= 4 ? 'Maximum 4 germes' : 'Ajouter à la comparaison'}
          style={{
            position: 'absolute', top: 6, right: 6, zIndex: 2,
            width: 22, height: 22, padding: 0, border: 'none',
            background: inBasket ? accent : 'rgba(0,0,0,0.25)',
            color: '#fff', fontSize: 13, cursor: inBasket || basket.length >= 4 ? 'default' : 'pointer',
            opacity: basket.length >= 4 && !inBasket ? 0.4 : 1,
          }}
        >{inBasket ? '✓' : '+'}</button>
        <div style={{ height: mobile ? 120 : height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
          {img ? (
            <img src={img.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: imgFilter }} />
          ) : (
            <svg viewBox="0 0 100 100" width={mobile ? 80 : 120} height={mobile ? 80 : 120}>
              <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.3} strokeWidth={1.6} vivid={vivid} />
            </svg>
          )}
        </div>
        <div style={{ padding: mobile ? '8px 10px' : '12px 14px' }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 14 : 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: T.mono, fontSize: mobile ? 9 : 10 }}>
            <span style={{ color: c.stroke }}>GRAM {b.gram}</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: 'var(--accent)' }}>↗</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.serif, '--accent': accent, background: 'var(--bg)' }}>

      <TopBar navigate={navigate} onBack={() => navigate('home')} />

      {/* Chapter opener */}
      <div style={{ padding: mobile ? '14px 16px 12px' : '22px 56px 20px', borderBottom: '1.5px double var(--rule)', background: 'var(--paper)', display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: accent, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 9, alignSelf: 'center' }}>
          <span style={{ width: 20, height: 2, background: accent, display: 'inline-block' }} />
          {sys?.short?.toUpperCase() || sys?.slug?.toUpperCase()}
        </div>
        <h1 style={{ fontFamily: T.serif, fontSize: mobile ? 22 : 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
          {sys?.name}<span style={{ color: accent }}>.</span>
        </h1>
        {sys?.subtitle && !mobile && (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: 'var(--ink3)' }}>
            {sys.subtitle}
          </div>
        )}
        <span style={{ flex: 1 }} />
        <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', alignSelf: 'center' }}>
          {bacteria.length} ESPÈCES
        </div>
      </div>

      {/* Mobile: zone select */}
      {mobile && zones.length > 0 && (
        <div style={{ padding: '10px 16px', background: 'var(--paper)', borderBottom: '1px solid var(--rule)' }}>
          <select
            value={activeZoneId ?? ''}
            onChange={e => setActiveZoneId(Number(e.target.value))}
            style={{ width: '100%', padding: '8px 10px', fontFamily: T.serif, fontSize: 14, color: 'var(--ink)', background: 'var(--bg)', border: '1px solid var(--rule)', outline: 'none' }}
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.label || z.name} — {z.n || 0} pathogènes</option>
            ))}
          </select>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: mobile ? 'block' : 'grid', gridTemplateColumns: '230px 1fr', background: 'var(--bg)' }}>

        {/* Sidebar zones — desktop only */}
        {!mobile && (
          <aside style={{ borderRight: '1px solid var(--rule)', padding: '28px 24px 28px 56px', background: 'var(--paper)' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.16em', marginBottom: 14 }}>SOUS-ZONES</div>
            {zones.length === 0 && (
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)' }}>Aucune zone définie.</div>
            )}
            {zones.map(z => {
              const isActive = z.id === (activeZoneId ?? zones[0]?.id)
              return (
                <div key={z.id} onClick={() => setActiveZoneId(z.id)} style={{
                  padding: '16px 0',
                  borderBottom: '1px solid var(--ruleSoft)',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, color: isActive ? 'var(--ink)' : 'var(--ink2)' }}>
                    {z.label || z.name}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', marginTop: 3 }}>
                    {z.n || 0} pathogènes
                  </div>
                </div>
              )
            })}
          </aside>
        )}

        {/* Main content */}
        <main style={{ padding: mobile ? '16px' : '32px 40px' }}>

          {/* ── Pathologies ── */}
          {(pathoLoading || bacteriaLoading || sysPathoLoading) ? (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
          ) : (
            <>
              {systemPathologies.length > 0 && (
                <>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
                    PATHOLOGIES DU SYSTÈME
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20, marginBottom: 32 }}>
                    {systemPathologies.map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate('pathologie', { pathologieId: p.id, systemId, zoneId: null })}
                        style={{
                          background: 'var(--paper)',
                          border: '0.5px solid var(--rule)',
                          borderTop: `3px solid ${accent}`,
                          cursor: 'pointer', position: 'relative',
                          transition: 'transform .14s, box-shadow .14s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accent}44` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div style={{ height: mobile ? 120 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg viewBox="0 0 100 100" width={mobile ? 70 : 100} height={mobile ? 70 : 100} fill="none">
                              <rect x="50" y="12" width="40" height="40" rx="3" transform="rotate(45 50 12)" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.6" />
                              <circle cx="50" cy="52" r="10" fill={accent} fillOpacity="0.32" />
                              <line x1="50" y1="62" x2="50" y2="80" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
                              <line x1="40" y1="72" x2="60" y2="72" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <div style={{ padding: mobile ? '8px 10px' : '12px 14px' }}>
                          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 14 : 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{p.nom}</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: T.mono, fontSize: mobile ? 9 : 10 }}>
                            <span style={{ color: accent }}>{p.germe_count ?? 0} germe{(p.germe_count ?? 0) !== 1 ? 's' : ''}</span>
                            <span style={{ flex: 1 }} />
                            <span style={{ color: accent }}>›</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {pathologies.length > 0 && (
                <>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
                    PATHOLOGIES
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20, marginBottom: 32 }}>
                    {pathologies.map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigate('pathologie', { pathologieId: p.id, systemId, zoneId: activeZoneId ?? zones[0]?.id })}
                        style={{
                          background: 'var(--paper)',
                          border: '0.5px solid var(--rule)',
                          borderTop: `3px solid ${accent}`,
                          cursor: 'pointer', position: 'relative',
                          transition: 'transform .14s, box-shadow .14s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accent}44` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        {/* Thumbnail */}
                        <div style={{ height: mobile ? 120 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg viewBox="0 0 100 100" width={mobile ? 70 : 100} height={mobile ? 70 : 100} fill="none">
                              <rect x="50" y="12" width="40" height="40" rx="3" transform="rotate(45 50 12)" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.6" />
                              <circle cx="50" cy="52" r="10" fill={accent} fillOpacity="0.32" />
                              <line x1="50" y1="62" x2="50" y2="80" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
                              <line x1="40" y1="72" x2="60" y2="72" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        {/* Info */}
                        <div style={{ padding: mobile ? '8px 10px' : '12px 14px' }}>
                          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 14 : 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{p.nom}</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: T.mono, fontSize: mobile ? 9 : 10 }}>
                            <span style={{ color: accent }}>{p.germe_count ?? 0} germe{(p.germe_count ?? 0) !== 1 ? 's' : ''}</span>
                            <span style={{ flex: 1 }} />
                            <span style={{ color: accent }}>›</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Autres pathogènes (sans pathologie) ── */}
              {orphanBacteria.length > 0 && (
                <>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
                    {pathologies.length > 0 ? 'AUTRES PATHOGÈNES' : 'PATHOGÈNES'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20, marginBottom: 32 }}>
                    {orphanBacteria.map(b => <BactCard key={b.id} b={b} height={180} />)}
                  </div>
                </>
              )}

              {pathologies.length === 0 && orphanBacteria.length === 0 && (
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40, textAlign: 'center' }}>
                  Aucun pathogène dans cette zone.
                </div>
              )}

              {/* ── Flore commensale ── */}
              {!floraLoading && flora.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
                    FLORE COMMENSALE
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20 }}>
                    {flora.map(normalize).map(b => (
                      <BactCard key={b.id} b={b} height={140} opacity={0.75} imgFilter="grayscale(0.4)" />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
