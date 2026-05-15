import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useQuiz(zoneId = null) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase
      .from('bacterio_quiz')
      .select('*')
      .order('created_at')

    if (zoneId) query = query.contains('zone_ids', [zoneId])

    query.then(({ data }) => {
      setQuestions(data || [])
      setLoading(false)
    })
  }, [zoneId])

  return { questions, loading }
}
