import React from 'react'
import { T } from './data.js'
import { gramColor, MorphoSVG } from './shared.jsx'
import { useSystems } from '../../hooks/useSystems.js'
import { useBacteria } from '../../hooks/useBacteria.js'

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

  const zoneIdToFetch = activeZoneId ?? zones[0]?.id ?? null
  const { bacteria, loading: bacteriaLoading } = useBacteria(zoneIdToFetch)

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

      {/* Running head */}
      <div style={{ padding: '13px 56px', borderBottom: '0.5px solid var(--rule)', display: 'flex', alignItems: 'center', fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.14em', background: 'var(--paper)' }}>
        <span style={{ cursor: 'pointer', color: 'var(--ink2)' }} onClick={() => navigate('home')}>← TABLE DES MATIÈRES</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontStyle: 'italic', fontFamily: T.serif, letterSpacing: 0, fontSize: 12, color: 'var(--ink2)' }}>{sys.name}</span>
      </div>

      {/* Chapter opener */}
      <div style={{ padding: '56px 56px 40px', borderBottom: '1.5px double var(--rule)', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 920 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 24, height: 2, background: 'var(--accent)', display: 'inline-block' }}/>
            {sys.short?.toUpperCase() || sys.slug?.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: 120, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.9, margin: 0, color: 'var(--ink)' }}>
            {sys.name?.split(' ')[0]}<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          {sys.subtitle && (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: 'var(--ink2)', marginTop: 14, maxWidth: 620 }}>
              {sys.subtitle}.
            </div>
          )}
        </div>
      </div>

      {/* Body: sidebar zones + bacteria grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '230px 1fr', background: 'var(--bg)' }}>

        {/* Sidebar zones */}
        <aside style={{ borderRight: '1px solid var(--rule)', padding: '28px 24px 28px 56px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.16em', marginBottom: 14 }}>SOUS-ZONES</div>
          {zones.length === 0 && (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)' }}>Aucune zone définie.</div>
          )}
          {zones.map((z, i) => {
            const isActive = z.id === (activeZoneId ?? zones[0]?.id)
            return (
              <div key={z.id} onClick={() => setActiveZoneId(z.id)} style={{
                padding: '16px 0',
                borderBottom: '1px solid var(--ruleSoft)',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '28px 1fr',
                gap: 10,
                alignItems: 'baseline',
              }}>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: isActive ? 'var(--accent)' : 'var(--ink3)' }}>
                  §{['a','b','c','d','e','f','g','h'][i] || i}
                </span>
                <div>
                  <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 500, color: isActive ? 'var(--ink)' : 'var(--ink2)' }}>
                    {z.label || z.name}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', marginTop: 3 }}>
                    {z.n || 0} pathogènes
                  </div>
                </div>
              </div>
            )
          })}
        </aside>

        {/* Bacteria grid */}
        <main style={{ padding: '32px 40px' }}>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center', fontFamily: T.mono, fontSize: 10 }}>
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
            {activeZone && (
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)' }}>
                {activeZone.label || activeZone.name}
              </span>
            )}
          </div>

          {bacteriaLoading && (
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
          )}

          {!bacteriaLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {filtered.map((b, i) => {
                const c = gramColor(b.gram)
                const img = b.bacterio_images?.[0]
                return (
                  <div key={b.id}
                    style={{ background: 'var(--paper)', border: '0.5px solid var(--rule)', cursor: 'pointer', position: 'relative' }}
                    onClick={() => navigate('sheet', { bacteriaId: b.name, systemId })}
                  >
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      ) : (
                        <svg viewBox="0 0 100 100" width={120} height={120}>
                          <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.3} strokeWidth={1.6} vivid={vivid}/>
                        </svg>
                      )}
                      <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: T.mono, fontSize: 9, color: 'var(--ink3)', letterSpacing: '0.1em' }}>
                        fig. {['I','II','III','IV','V','VI','VII','VIII','IX','X'][i] || i + 1}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', marginBottom: 6 }}>{b.morpho}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: T.mono, fontSize: 10 }}>
                        <span style={{ color: c.stroke }}>GRAM {b.gram}</span>
                        <span style={{ color: 'var(--ink3)' }}>·</span>
                        <span style={{ color: 'var(--ink3)' }}>{b.freq || 'inconnu'}</span>
                        <span style={{ flex: 1 }}/>
                        <span style={{ color: 'var(--accent)' }}>↗ fiche</span>
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
        </main>
      </div>
    </div>
  )
}
