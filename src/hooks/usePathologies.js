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
      .select('*')
      .eq('zone_id', zoneId)
      .order('ordre')
      .then(({ data }) => { setPathologies(data || []); setLoading(false) })
  }, [zoneId])

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
      .select('bacteria_id, bacterio_bacteria(*, bacterio_images(*))')
      .eq('pathologie_id', pathologieId)
      .then(({ data }) => {
        setBacteria((data || []).map(r => r.bacterio_bacteria).filter(Boolean))
        setLoading(false)
      })
  }, [pathologieId])

  return { bacteria, loading }
}
