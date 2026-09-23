import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { registrarVista } from '../analitica/medicion'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

/** Las visitas al panel no interesan: el reporte mide al público del sitio. */
function esDelPanel(path: string) {
  return path === '/admin' || path.startsWith('/admin/')
}

/** De /productos/estuches saca "estuches", para el ranking de lo más visto. */
function slugDeProducto(path: string): string | undefined {
  const m = path.match(/^\/productos\/([^/]+)$/)
  return m ? m[1] : undefined
}

/**
 * Avisa al backend que alguien vio una pantalla.
 *
 * <p>El conteo propio no usa cookies ni guarda nada en el navegador: el
 * servidor arma un identificador anónimo que cambia todos los días. Aparte de
 * eso, si hay medición de Google configurada, se le avisa también: es una sola
 * pantalla y, sin esto, Analytics contaría solo la primera que se abre.
 */
export function useTrackPageView() {
  const location = useLocation()
  /** Evita contar dos veces la misma pantalla cuando React vuelve a montar. */
  const ultimoRegistrado = useRef<string | null>(null)

  useEffect(() => {
    const path = location.pathname
    if (esDelPanel(path) || ultimoRegistrado.current === path) return
    ultimoRegistrado.current = path

    registrarVista(path)

    const cuerpo = JSON.stringify({
      path,
      productSlug: slugDeProducto(path),
      // Solo el de afuera: de dónde llegó. Los internos no dicen nada.
      referrer: document.referrer && !document.referrer.startsWith(window.location.origin)
        ? document.referrer
        : undefined,
    })

    // keepalive: si el visitante se va enseguida, el pedido igual sale.
    fetch(`${BASE_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo,
      keepalive: true,
      // Medir no puede romper la navegación: cualquier fallo se ignora.
    }).catch(() => {})
  }, [location.pathname])
}
