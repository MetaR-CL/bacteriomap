import { useEffect, useState } from 'react'
import { getQuiz } from '../shared/dataSource.js'

export function useQuiz(systemId = null) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuiz(systemId).then(data => {
      // Shuffle on each load
      const arr = [...data]
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
