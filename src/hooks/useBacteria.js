import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBacteria(zoneId = null) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      let query = supabase
        .from('bacterio_bacteria')
        .select('*, bacterio_images(*)')
        .order('name')

      if (zoneId !== null) {
        query = query.contains('zone_ids', [zoneId])
      }

      const { data, error } = await query
      if (error) setError(error)
      else setBacteria(data || [])
      setLoading(false)
    }
    fetch()
  }, [zoneId])

  return { bacteria, loading, error }
}
