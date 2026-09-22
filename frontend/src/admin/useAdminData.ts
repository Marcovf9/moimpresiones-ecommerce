import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { SessionExpiredError } from './adminClient'
import { useAuth } from './AuthContext'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Carga datos del panel. Si el token vencio cierra la sesion, de modo que la
 * pantalla vuelve al login en lugar de quedarse mostrando un error.
 */
export function useAdminData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const { logout } = useAuth()
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof SessionExpiredError) {
          logout()
          return
        }
        const message = error instanceof ApiError ? error.message : 'No pudimos cargar los datos.'
        setState({ data: null, loading: false, error: message })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  return { ...state, reload }
}
