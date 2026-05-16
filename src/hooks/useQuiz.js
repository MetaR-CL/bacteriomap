import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useQuiz(systemId = null) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase
      .from('bacterio_quiz')
      .select('*')
      .eq('active', true)
      .order('id')

    if (systemId) query = query.eq('system_id', systemId)

    query.then(({ data }) => {
      // Shuffle on each load
      const arr = data || []
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      setQuestions(arr)
      setLoading(false)
    })
  }, [systemId])

  return { questions, loading }
}
