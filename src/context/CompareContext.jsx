import React from 'react'

const CompareContext = React.createContext(null)

export function CompareProvider({ children }) {
  const [basket, setBasket] = React.useState([])

  const add = (b) => {
    setBasket(prev => {
      if (prev.find(x => x.id === b.id)) return prev
      if (prev.length >= 4) return prev
      return [...prev, b]
    })
  }
  const remove = (id) => setBasket(prev => prev.filter(x => x.id !== id))
  const clear = () => setBasket([])
  const has = (id) => basket.some(x => x.id === id)

  return (
    <CompareContext.Provider value={{ basket, add, remove, clear, has }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => React.useContext(CompareContext)
