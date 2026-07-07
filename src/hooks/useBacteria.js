import { useEffect, useState } from 'react'
import { getZoneBacteries, getZoneFlore, getSystemBacteries } from '../shared/dataSource.js'

export function useBacteria(zoneId = null, isFlora = false) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (zoneId === null) {
      setBacteria([])
      setLoading(false)
      return
    }
    setLoading(true)
    async function fetch() {
      try {
        const data = isFlora ? await getZoneFlore(zoneId) : await getZoneBacteries(zoneId)
        setBacteria(data)
      } catch (err) {
        setError(err)
      }
      setLoading(false)
    }
    fetch()
  }, [zoneId, isFlora])

  return { bacteria, loading, error }
}

export function useSystemBacteria(systemId = null) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (systemId === null) { setBacteria([]); return }
    setLoading(true)
    getSystemBacteries(systemId).then(data => {
      setBacteria(data)
      setLoading(false)
    })
  }, [systemId])

  return { bacteria, loading }
}
