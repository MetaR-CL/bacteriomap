import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminSystems() {
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bacterio_systems')
      .select('*, bacterio_zones(*)')
      .order('position')
    if (!error) setSystems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateSystem = async (id, patch) => {
    const { error } = await supabase
      .from('bacterio_systems')
      .update(patch)
      .eq('id', id)
    if (error) throw error
    await load()
  }

  const upsertZone = async (zone) => {
    const { error } = await supabase
      .from('bacterio_zones')
      .upsert(zone, { onConflict: 'slug' })
    if (error) throw error
    await load()
  }

  const removeZone = async (id) => {
    const { error } = await supabase
      .from('bacterio_zones')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { systems, loading, updateSystem, upsertZone, removeZone, reload: load }
}
