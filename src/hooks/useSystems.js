import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSystems() {
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('bacterio_systems')
      .select('*, bacterio_zones(*)')
      .order('position')
      .then(({ data }) => {
        setSystems((data || []).map(s => ({
          ...s,
          bacterio_zones: [...(s.bacterio_zones || [])].sort((a, b) => a.position - b.position),
        })))
        setLoading(false)
      })
  }, [])

  return { systems, loading }
}
