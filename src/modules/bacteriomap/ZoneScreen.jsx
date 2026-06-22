import React from 'react'
import { T } from './data.js'
import { gramColor, MorphoSVG } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useBacteria } from '../../hooks/useBacteria.js'
import { useIsMobile } from '../../hooks/useIsMobile.js'
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
  const [activeZoneId, setActiveZoneId] = React.useState(null)
  const [filter, setFilter] = React.useState('all')
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
    setFilter('all')
  }, [systemId])

  const activeZone = zones.find(z => z.id === activeZoneId) || zones[0] || null

  const zoneReady = !sysLoading && zones.length > 0
  const zoneIdToFetch = zoneReady ? (activeZoneId ?? zones[0]?.id ?? null) : null
  const { bacteria, loading: bacteriaLoading } = useBacteria(zoneIdToFetch)
  const { bacteria: flora, loading: floraLoading } = useBacteria(zoneIdToFetch, true)

  const filtered = bacteria.map(normalize).filter(b => {
    if (filter === 'all') return true
    if (filter === 'gp')  return b.gram === '+'
    if (filter === 'gm')  return b.gram === '−'
    if (filter === 'f')   return b.gram === 'F'
    if (filter === 'urg') return b.urgence
    return true
  })

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

        {/* Bacteria grid */}
        <main style={{ padding: mobile ? '16px' : '32px 40px' }}>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', fontFamily: T.mono, fontSize: 10, flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--ink3)', letterSpacing: '0.14em', marginRight: 4 }}>FILTRES</span>
            {[['all','TOUS'],['gp','G+'],['gm','G−'],['f','F'],['urg','↑']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding: '4px 10px',
                background: filter === v ? 'var(--ink)' : 'transparent',
                color: filter === v ? 'var(--paper)' : 'var(--ink2)',
                border: `1px solid ${filter === v ? 'var(--ink)' : 'var(--rule)'}`,
                fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer',
              }}>{l}</button>
            ))}
            <span style={{ flex: 1 }}/>
            {activeZone && !mobile && (
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)' }}>
                {activeZone.label || activeZone.name}
              </span>
            )}
          </div>

          {bacteriaLoading && (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
          )}

          {!bacteriaLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20 }}>
              {filtered.map(b => {
                const c = gramColor(b.gram)
                const img = b.bacterio_images?.[0]
                return (
                  <div key={b.id}
                    style={{ background: 'var(--paper)', border: '0.5px solid var(--rule)', cursor: 'pointer', position: 'relative', transition: 'transform .14s, box-shadow .14s' }}
                    onClick={() => navigate('sheet', { bacteriaId: b.name, systemId })}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accent}44` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ height: mobile ? 120 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <svg viewBox="0 0 100 100" width={mobile ? 80 : 120} height={mobile ? 80 : 120}>
                          <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.3} strokeWidth={1.6} vivid={vivid}/>
                        </svg>
                      )}
                    </div>
                    <div style={{ padding: mobile ? '8px 10px' : '12px 14px' }}>
                      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 14 : 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: T.mono, fontSize: mobile ? 9 : 10 }}>
                        <span style={{ color: c.stroke }}>GRAM {b.gram}</span>
                        {!mobile && (
                          <>
                            <span style={{ color: 'var(--ink3)' }}>·</span>
                            <span style={{ color: 'var(--ink3)' }}>{b.freq || 'inconnu'}</span>
                          </>
                        )}
                        <span style={{ flex: 1 }}/>
                        <span style={{ color: 'var(--accent)' }}>↗</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40, textAlign: 'center' }}>
                  Aucune bactérie dans cette zone.
                </div>
              )}
            </div>
          )}

          {!floraLoading && flora.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.18em', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--rule)' }}>
                FLORE COMMENSALE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20 }}>
                {flora.map(normalize).map(b => {
                  const c = gramColor(b.gram)
                  const img = b.bacterio_images?.[0]
                  return (
                    <div key={b.id}
                      style={{ background: 'var(--paper)', border: '0.5px solid var(--ruleSoft)', cursor: 'pointer', position: 'relative', opacity: 0.75 }}
                      onClick={() => navigate('sheet', { bacteriaId: b.name, systemId })}
                    >
                      <div style={{ height: mobile ? 100 : 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                        {img ? (
                          <img src={img.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4)' }}/>
                        ) : (
                          <svg viewBox="0 0 100 100" width={mobile ? 70 : 90} height={mobile ? 70 : 90}>
                            <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.2} strokeWidth={1.4}/>
                          </svg>
                        )}
                      </div>
                      <div style={{ padding: mobile ? '8px 10px' : '10px 14px' }}>
                        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 13 : 16, color: 'var(--ink)', marginBottom: 3 }}>{b.name}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)' }}>GRAM {b.gram}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
