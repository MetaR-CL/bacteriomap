import React from 'react'
import { T } from './data.js'
import { gramColor, MorphoSVG } from './shared.jsx'
import { usePathologieBacteria } from '../../hooks/usePathologies.js'
import { useIsMobile } from '../../hooks/useIsMobile.js'
import { useCompare } from '../../context/CompareContext.jsx'
import FadeImg from '../../shared/FadeImg.jsx'
import TopBar from './TopBar.jsx'

const GRAM_MAP = { positif: '+', negatif: '−', aucun: 'F' }
function normalize(b) {
  return { ...b, gram: GRAM_MAP[b.gram] || b.gram, morpho: b.morphology || b.morpho || 'rod' }
}

export default function PathologieScreen({ navigate, pathologieId, pathologie, systemId, zoneLabel, accent }) {
  const mobile = useIsMobile()
  const { bacteria, loading } = usePathologieBacteria(pathologieId)
  const { add, has, basket } = useCompare()

  const accentColor = accent || 'var(--accent)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.serif, '--accent': accentColor, background: 'var(--bg)' }}>

      <TopBar navigate={navigate} onBack={() => navigate('zone', { systemId })} />

      {/* Chapter header */}
      <div style={{ padding: mobile ? '14px 16px 12px' : '22px 56px 20px', borderBottom: '1.5px double var(--rule)', background: 'var(--paper)' }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.14em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            onClick={() => navigate('zone', { systemId })}
            style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--ruleSoft)' }}
          >{zoneLabel || 'Zone'}</span>
          <span>›</span>
          <span style={{ color: 'var(--ink2)' }}>{pathologie?.nom || '…'}</span>
        </div>

        <h1 style={{ fontFamily: T.serif, fontSize: mobile ? 22 : 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, color: 'var(--ink)' }}>
          {pathologie?.nom}<span style={{ color: accentColor }}>.</span>
        </h1>

        {pathologie?.description && (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: 'var(--ink2)', marginTop: 8, maxWidth: 680, lineHeight: 1.55 }}>
            {pathologie.description}
          </div>
        )}

        <div style={{ fontFamily: T.mono, fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', marginTop: 10 }}>
          {loading ? '…' : `${bacteria.length} GERME${bacteria.length !== 1 ? 'S' : ''}`}
        </div>
      </div>

      {/* Grille */}
      <main style={{ flex: 1, padding: mobile ? '16px' : '32px 56px' }}>
        {loading ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40 }}>Chargement…</div>
        ) : bacteria.length === 0 ? (
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: 'var(--ink3)', padding: 40, textAlign: 'center' }}>
            Aucun germe associé à cette pathologie.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: mobile ? 12 : 20 }}>
            {bacteria.map(normalize).map(b => {
              const c = gramColor(b.gram)
              const img = b.bacterio_images?.[0]
              const inBasket = has(b.id)
              return (
                <div key={b.id}
                  style={{ background: 'var(--paper)', border: '0.5px solid var(--rule)', cursor: 'pointer', position: 'relative', transition: 'transform .14s, box-shadow .14s' }}
                  onClick={() => navigate('sheet', { bacteriaId: b.name, systemId })}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px -8px ${accentColor}44` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Compare button */}
                  <button
                    onClick={e => { e.stopPropagation(); if (!inBasket && basket.length < 4) add(b) }}
                    title={inBasket ? 'Dans la comparaison' : basket.length >= 4 ? 'Maximum 4 germes' : 'Ajouter à la comparaison'}
                    style={{
                      position: 'absolute', top: 6, right: 6, zIndex: 2,
                      width: 22, height: 22, padding: 0, border: 'none',
                      background: inBasket ? accentColor : 'rgba(0,0,0,0.25)',
                      color: '#fff', fontSize: 13, cursor: inBasket || basket.length >= 4 ? 'default' : 'pointer',
                      opacity: basket.length >= 4 && !inBasket ? 0.4 : 1,
                    }}
                  >{inBasket ? '✓' : '+'}</button>

                  <div style={{ height: mobile ? 120 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                    {img ? (
                      <FadeImg src={img.url} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg viewBox="0 0 100 100" width={mobile ? 80 : 120} height={mobile ? 80 : 120}>
                        <MorphoSVG kind={b.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.3} strokeWidth={1.6} />
                      </svg>
                    )}
                  </div>
                  <div style={{ padding: mobile ? '8px 10px' : '12px 14px' }}>
                    <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: mobile ? 14 : 18, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: T.mono, fontSize: mobile ? 9 : 10 }}>
                      <span style={{ color: c.stroke }}>GRAM {b.gram}</span>
                      <span style={{ flex: 1 }} />
                      <span style={{ color: accentColor }}>↗</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
