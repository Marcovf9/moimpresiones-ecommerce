import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { adminApi, sessionStore } from './adminClient'
import type { AdminSession } from './adminTypes'

interface AuthValue {
  session: AdminSession | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Al montar leemos la sesion guardada: recargar la pagina no deberia desloguear.
  const [session, setSession] = useState<AdminSession | null>(() => sessionStore.read())

  const login = useCallback(async (username: string, password: string) => {
    setSession(await adminApi.login(username, password))
  }, [])

  const logout = useCallback(() => {
    sessionStore.clear()
    setSession(null)
  }, [])

  const value = useMemo(() => ({ session, login, logout }), [session, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}
