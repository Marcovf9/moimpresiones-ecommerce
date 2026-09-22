import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Ejecuta una llamada a la API y expone su estado.
 * `deps` funciona igual que en useEffect: cambia, se vuelve a pedir.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const message = error instanceof ApiError
          ? error.message
          : 'No pudimos cargar la información.'
        setState({ data: null, loading: false, error: message })
      })

    return () => {
      cancelled = true
    }
    // El fetcher se recrea en cada render: las dependencias reales las declara quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
