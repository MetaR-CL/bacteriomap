import { useEffect, useState } from 'react'
import { getSystemes } from '../shared/dataSource.js'

export function useSystems() {
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemes().then(data => {
      setSystems((data || []).map(s => ({
        ...s,
        bacterio_zones: [...(s.bacterio_zones || [])].sort((a, b) => a.position - b.position),
      })))
      setLoading(false)
    })
  }, [])

  return { systems, loading }
}
