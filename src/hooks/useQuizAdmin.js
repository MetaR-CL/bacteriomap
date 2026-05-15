import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

  const toggle = async (id, active) => {
    const { error } = await supabase
      .from('bacterio_quiz')
      .update({ active })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { questions, loading, upsert, remove, toggle, reload: load }
}
