import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useBacteria(zoneId = null) {
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
      const { data, error } = await supabase
        .from('bacterio_bacteria')
        .select('*, bacterio_images(*)')
        .contains('zone_ids', [zoneId])
        .order('name')
      if (error) setError(error)
      else setBacteria(data || [])
      setLoading(false)
    }
    fetch()
  }, [zoneId])

  return { bacteria, loading, error }
}
