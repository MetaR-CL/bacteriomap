import { useEffect, useState } from 'react'
import { getZonePathologies, getSystemPathologies, getPathologieBacteries } from '../shared/dataSource.js'

export function usePathologies(zoneId = null) {
  const [pathologies, setPathologies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (zoneId === null) { setPathologies([]); return }
    setLoading(true)
    getZonePathologies(zoneId).then(data => {
      setPathologies(data)
      setLoading(false)
    })
  }, [zoneId])

  return { pathologies, loading }
}

export function useSystemPathologies(systemId = null) {
  const [pathologies, setPathologies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (systemId === null) { setPathologies([]); return }
    setLoading(true)
    getSystemPathologies(systemId).then(data => {
      setPathologies(data)
      setLoading(false)
    })
  }, [systemId])

  return { pathologies, loading }
}

export function usePathologieBacteria(pathologieId = null) {
  const [bacteria, setBacteria] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pathologieId === null) { setBacteria([]); return }
    setLoading(true)
    getPathologieBacteries(pathologieId).then(data => {
      setBacteria(data)
      setLoading(false)
    })
  }, [pathologieId])

  return { bacteria, loading }
}
