import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminBacteria() {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .select('*, bacterio_images(*)')
      .order('name')
    if (!error) setBacteria(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Upsert: update by id if present, otherwise insert (conflict on name).
  // Always strips nested relations before sending to Supabase.
  const upsert = async (row) => {
    const { bacterio_images: _, ...cleanRow } = row
    let data, error
    if (cleanRow.id) {
      ;({ data, error } = await supabase
        .from('bacterio_bacteria')
        .update(cleanRow)
        .eq('id', cleanRow.id)
        .select('id'))
    } else {
      ;({ data, error } = await supabase
        .from('bacterio_bacteria')
        .upsert(cleanRow, { onConflict: 'name' })
        .select('id'))
    }
    if (error) throw error
    await load()
    return data?.[0]?.id
  }

  const duplicate = async (b) => {
    const { id: _, bacterio_images: __, ...fields } = b
    const { data, error } = await supabase
      .from('bacterio_bacteria')
      .insert({ ...fields, name: `${b.name} (copie)` })
      .select('id')
      .single()
    if (error) throw error
    await load()
    return data.id
  }

  const remove = async (id) => {
    const { error } = await supabase
      .from('bacterio_bacteria')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }

  const uploadImage = async (bacteriaId, file) => {
    const ext = file.name.split('.').pop()
    const path = `bacteria/${bacteriaId}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('bacteriomap-images')
      .upload(path, file)
    if (upErr) throw upErr

    const { data: { publicUrl } } = supabase.storage
      .from('bacteriomap-images')
      .getPublicUrl(path)

    const { error: dbErr } = await supabase
      .from('bacterio_images')
      .insert({ bacteria_id: bacteriaId, url: publicUrl, caption: file.name, position: 0 })
    if (dbErr) throw dbErr

    await load()
  }

  const deleteImage = async (imageId, imageUrl) => {
    // Extract storage path from public URL
    const marker = '/object/public/bacteriomap-images/'
    const path = imageUrl?.includes(marker) ? imageUrl.split(marker)[1] : null
    if (path) {
      // Best-effort: ignore storage errors (file may already be gone)
      await supabase.storage.from('bacteriomap-images').remove([path])
    }
    const { error } = await supabase
      .from('bacterio_images')
      .delete()
      .eq('id', imageId)
    if (error) throw error
    await load()
  }

  return { bacteria, loading, upsert, duplicate, remove, uploadImage, deleteImage, reload: load }
}
