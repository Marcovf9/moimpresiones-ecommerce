import { useEffect, useRef, useState } from 'react'
import { EMPRESA } from '../config/empresa'

/**
 * Mapa del local, con el punto exacto marcado.
 *
 * <p>Se arma con Leaflet sobre teselas de OpenStreetMap. No se usa Google Maps
 * a propósito: su iframe instala cookies de seguimiento apenas se muestra, y
 * eso obligaría a poner un cartel de consentimiento que hoy el sitio no
 * necesita, porque las métricas también se hicieron sin cookies.
 *
 * <p>Leaflet pesa unos 40 KB, así que se carga recién cuando la sección entra
 * en pantalla: quien no baja hasta el final no lo descarga nunca.
 */
export function Mapa({ className = '' }: { className?: string }) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [fallo, setFallo] = useState(false)

  // Primer paso: esperar a que la sección se acerque a la pantalla.
  useEffect(() => {
    const nodo = contenedor.current
    if (!nodo || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  // Segundo paso: recién ahí traer Leaflet y dibujar.
  useEffect(() => {
    if (!visible || !contenedor.current) return
    let mapa: import('leaflet').Map | undefined
    let cancelado = false

    async function dibujar() {
      try {
        const L = await import('leaflet')
        await import('leaflet/dist/leaflet.css')
        if (cancelado || !contenedor.current) return

        const { lat, lon } = EMPRESA.domicilio.coordenadas
        mapa = L.map(contenedor.current, {
          center: [lat, lon],
          zoom: 16,
          // Sin scroll con la rueda: en el celular se traga el gesto de bajar
          // por la página y el visitante queda atrapado en el mapa.
          scrollWheelZoom: false,
          attributionControl: true,
        })

        // Teselas de OpenStreetMap: libres y sin clave. Se probó el estilo
        // claro de CARTO, que se veía mejor, pero ahora estampa "API KEY
        // REQUIRED" sobre el mapa salvo que se contrate una cuenta.
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapa)

        // Marcador propio, en el magenta de la marca, para que el punto se lea
        // enseguida sobre un mapa claro.
        const icono = L.divIcon({
          className: '',
          html: `<span class="marcador-mo"></span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26],
        })

        L.marker([lat, lon], { icon: icono, title: EMPRESA.nombreComercial })
          .addTo(mapa)
          .bindPopup(`<strong>${EMPRESA.nombreComercial}</strong><br>${EMPRESA.domicilio.calle}`)
      } catch {
        setFallo(true)
      }
    }

    dibujar()
    return () => {
      cancelado = true
      mapa?.remove()
    }
  }, [visible])

  if (fallo) {
    return (
      <div className={`grid place-items-center bg-ink-100 text-sm text-ink-500 ${className}`}>
        No pudimos cargar el mapa.
      </div>
    )
  }

  return (
    <div
      ref={contenedor}
      role="img"
      aria-label={`Mapa con la ubicación de ${EMPRESA.nombreComercial} en ${EMPRESA.domicilio.calle}`}
      className={`bg-ink-100 ${className}`}
    />
  )
}
