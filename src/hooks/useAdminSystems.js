import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Minimal French accent → ASCII for slug generation
const DEACCENT = { à:'a',â:'a',ä:'a',é:'e',è:'e',ê:'e',ë:'e',ï:'i',î:'i',ô:'o',ö:'o',ù:'u',û:'u',ü:'u',ç:'c',œ:'oe',æ:'ae' }
function slugify(str) {
  return str.toLowerCase()
    .replace(/[àâäéèêëïîôöùûüçœæ]/g, c => DEACCENT[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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

  const insertSystem = async (payload) => {
    const maxPos = systems.length ? Math.max(...systems.map(s => s.position || 0)) : 0
    const slug = payload.slug || slugify(payload.name)
    const { error } = await supabase
      .from('bacterio_systems')
      .insert({ color: '#888888', ...payload, slug, position: maxPos + 1 })
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

  const removeSystem = async (id) => {
    await supabase.from('bacterio_zones').delete().eq('system_id', id)
    const { error } = await supabase.from('bacterio_systems').delete().eq('id', id)
    if (error) throw error
    await load()
  }

  return { systems, loading, updateSystem, insertSystem, upsertZone, removeZone, removeSystem, reload: load }
}
