'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ActualPathContextType {
  actualPath: string | null
}

const ActualPathContext = createContext<ActualPathContextType>({
  actualPath: null,
})

export function ActualPathProvider({ children, actualPath }: { children: ReactNode; actualPath: string | null }) {
  return (
    <ActualPathContext.Provider value={{ actualPath }}>
      {children}
    </ActualPathContext.Provider>
  )
}

export function useActualPath() {
  const context = useContext(ActualPathContext)
  return context.actualPath
}
