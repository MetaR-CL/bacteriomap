import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAllBacteria() {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('bacterio_bacteria')
        .select('id, name, gram, morphology, zone_ids')
        .order('name')
      setBacteria(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { bacteria, loading }
}
