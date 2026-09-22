import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Al cambiar de pagina volvemos arriba, salvo que la URL apunte a una seccion. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}
