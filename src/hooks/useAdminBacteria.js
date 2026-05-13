import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminBacteria() {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .select('*')
      .order('name')
    if (!error) setBacteria(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Upsert: update by id if present, otherwise insert (conflict on name)
  const upsert = async (row) => {
    let data, error
    if (row.id) {
      ;({ data, error } = await supabase
        .from('bacterio_bacteria')
        .update(row)
        .eq('id', row.id)
        .select('id'))
    } else {
      ;({ data, error } = await supabase
        .from('bacterio_bacteria')
        .upsert(row, { onConflict: 'name' })
        .select('id'))
    }
    if (error) throw error
    await load()
    return data?.[0]?.id
  }

  const remove = async (id) => {
    const { error } = await supabase
      .from('bacterio_bacteria')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { bacteria, loading, upsert, remove, reload: load }
}
