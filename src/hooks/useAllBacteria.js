import { useEffect, useState } from 'react'
import { getAllBacteries } from '../shared/dataSource.js'

export function useAllBacteria() {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const data = await getAllBacteries()
      setBacteria(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return { bacteria, loading }
}
