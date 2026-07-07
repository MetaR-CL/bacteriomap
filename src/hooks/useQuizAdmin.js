import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { compressImage } from '../shared/compressImage.js'

export function useQuizAdmin() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('bacterio_quiz')
      .select('*')
      .order('id')
    if (!error) setQuestions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const upsert = async (row) => {
    const payload = { ...row }
    if (payload.id === undefined) delete payload.id
    const { data, error } = await supabase
      .from('bacterio_quiz')
      .upsert(payload)
      .select()
      .single()
    if (error) throw error
    await load()
    return data
  }

  const remove = async (id) => {
    const { error } = await supabase
      .from('bacterio_quiz')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }

  const uploadImage = async (file, questionId) => {
    const compressed = await compressImage(file)
    const ext = compressed.name.split('.').pop()
    const path = `quiz/${questionId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('bacteriomap-images')
      .upload(path, compressed, { upsert: true })
    if (upErr) throw upErr
    const { data: { publicUrl } } = supabase.storage
      .from('bacteriomap-images')
      .getPublicUrl(path)
    const { error: updErr } = await supabase
      .from('bacterio_quiz')
      .update({ image_url: publicUrl })
      .eq('id', questionId)
    if (updErr) throw updErr
    await load()
    return publicUrl
  }

  const toggle = async (id, active) => {
    const { error } = await supabase
      .from('bacterio_quiz')
      .update({ active })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { questions, loading, upsert, remove, toggle, uploadImage, reload: load }
}
