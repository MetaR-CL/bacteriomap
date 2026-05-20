import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('bm.darkMode') === 'true' }
    catch { return false }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try { localStorage.setItem('bm.darkMode', dark) } catch {}
  }, [dark])

  return [dark, setDark]
}
