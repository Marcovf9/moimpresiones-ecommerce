import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Ejecuta una llamada a la API y expone su estado.
 *
 * `deps` funciona igual que en useEffect: cambia, se vuelve a pedir.
 *
 * `inicial` es lo que ya vino dentro del HTML, escrito al publicar. Con eso la
 * pantalla arranca llena en vez de vacía, y si la API está caída se sigue
 * viendo el catálogo en lugar de un error: el backend se reinicia en cada
 * despliegue y en ese rato no contesta.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  inicial: T | null = null,
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: inicial,
    loading: inicial === null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ data: inicial, loading: inicial === null, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        // Con datos del HTML se los deja a la vista: son viejos, pero valen
        // mucho más que un cartel de error.
        if (inicial !== null) {
          setState({ data: inicial, loading: false, error: null })
          return
        }
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
