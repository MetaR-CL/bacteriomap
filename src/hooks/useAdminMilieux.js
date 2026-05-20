import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function useAdminMilieux() {
  const [milieux, setMilieux] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bacterio_milieux')
      .select('*')
      .order('name')
    if (!error) setMilieux(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const upsert = async (row) => {
    const { id, ...data } = row
    if (id) {
      const { error } = await supabase.from('bacterio_milieux').update(data).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('bacterio_milieux').insert(data)
      if (error) throw error
    }
    await load()
  }

  const remove = async (id) => {
    const { error } = await supabase.from('bacterio_milieux').delete().eq('id', id)
    if (error) throw error
    await load()
  }

  return { milieux, loading, upsert, remove, reload: load }
}
