import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBacteria(zoneId = null, isFlora = false) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (zoneId === null) {
      setBacteria([])
      setLoading(false)
      return
    }
    setLoading(true)
    async function fetch() {
      if (isFlora) {
        const { data, error } = await supabase
          .from('bacterio_bacteria')
          .select('*, bacterio_images(*)')
          .contains('flora_zone_ids', [zoneId])
          .order('name')
        if (error) setError(error)
        else setBacteria(data || [])
      } else {
        const { data, error } = await supabase
          .from('bacterio_zone_bacteria')
          .select('ordre, bacterio_bacteria(*, bacterio_images(*))')
          .eq('zone_id', zoneId)
          .order('ordre')
        if (error) setError(error)
        else setBacteria((data || []).map(r => r.bacterio_bacteria).filter(Boolean))
      }
      setLoading(false)
    }
    fetch()
  }, [zoneId, isFlora])

  return { bacteria, loading, error }
}

export function useSystemBacteria(systemId = null) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (systemId === null) { setBacteria([]); return }
    setLoading(true)
    supabase
      .from('bacterio_system_bacteria')
      .select('bacterio_bacteria(*, bacterio_images(*))')
      .eq('system_id', systemId)
      .then(({ data }) => {
        setBacteria((data || []).map(r => r.bacterio_bacteria).filter(Boolean))
        setLoading(false)
      })
  }, [systemId])

  return { bacteria, loading }
}
