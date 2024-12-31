import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { AppState } from './AppState'

const AppContext = createContext<AppState | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [appState] = useState(() => new AppState())

  return (
    <AppContext.Provider value={appState}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider')
  }
  return context
}
