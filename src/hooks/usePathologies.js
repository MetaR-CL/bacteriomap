import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePathologies(zoneId = null) {
  const [pathologies, setPathologies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (zoneId === null) { setPathologies([]); return }
    setLoading(true)
    supabase
      .from('bacterio_pathologies')
      .select('*, bacterio_pathologie_germes(bacteria_id)')
      .eq('zone_id', zoneId)
      .order('ordre')
      .then(({ data }) => {
        const enriched = (data || []).map(p => ({
          ...p,
          germe_count: Array.isArray(p.bacterio_pathologie_germes) ? p.bacterio_pathologie_germes.length : 0,
        }))
        setPathologies(enriched)
        setLoading(false)
      })
  }, [zoneId])

  return { pathologies, loading }
}

export function useSystemPathologies(systemId = null) {
  const [pathologies, setPathologies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (systemId === null) { setPathologies([]); return }
    setLoading(true)
    supabase
      .from('bacterio_pathologies')
      .select('*, bacterio_pathologie_germes(bacteria_id)')
      .eq('system_id', systemId)
      .order('ordre')
      .then(({ data }) => {
        const enriched = (data || []).map(p => ({
          ...p,
          germe_count: Array.isArray(p.bacterio_pathologie_germes) ? p.bacterio_pathologie_germes.length : 0,
        }))
        setPathologies(enriched)
        setLoading(false)
      })
  }, [systemId])

  return { pathologies, loading }
}

export function usePathologieBacteria(pathologieId = null) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pathologieId === null) { setBacteria([]); return }
    setLoading(true)
    supabase
      .from('bacterio_pathologie_germes')
      .select('bacteria_id, ordre, bacterio_bacteria(*, bacterio_images(*))')
      .eq('pathologie_id', pathologieId)
      .order('ordre')
      .then(({ data }) => {
        setBacteria((data || []).map(r => r.bacterio_bacteria).filter(Boolean))
        setLoading(false)
      })
  }, [pathologieId])

  return { bacteria, loading }
}
