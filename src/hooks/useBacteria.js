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
      let query = supabase
        .from('bacterio_bacteria')
        .select('*, bacterio_images(*)')
        .order('name')
      if (isFlora) {
        query = query.contains('flora_zone_ids', [zoneId])
      } else {
        query = query.contains('zone_ids', [zoneId])
      }
      const { data, error } = await query
      if (error) setError(error)
      else setBacteria(data || [])
      setLoading(false)
    }
    fetch()
  }, [zoneId, isFlora])

  return { bacteria, loading, error }
}
