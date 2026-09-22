import { useEffect } from 'react'

/**
 * Hace aparecer los elementos marcados con data-revelar a medida que entran en
 * pantalla.
 *
 * <p>Usa IntersectionObserver en lugar de escuchar el scroll: el navegador
 * avisa solo cuando corresponde, sin trabajo en cada píxel desplazado.
 *
 * <p>Respeta a quien pidió menos movimiento en su sistema: en ese caso todo se
 * muestra de una, sin animación. Y si el navegador no soporta la API, también
 * se muestra todo: el contenido nunca puede quedar invisible por un efecto.
 */
export function useRevelarAlScroll(dependencias: unknown[] = []) {
  useEffect(() => {
    const elementos = document.querySelectorAll<HTMLElement>('[data-revelar]')
    if (elementos.length === 0) return

    const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefiereMenosMovimiento || typeof IntersectionObserver === 'undefined') {
      // Sin la clase, el CSS no oculta nada: se ve todo de una.
      return
    }

    // Recién ahora, cuando sabemos que podemos revelarlos, habilitamos el
    // estado oculto. Antes de esto el contenido se ve normalmente.
    document.documentElement.classList.add('js-revelar')

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.setAttribute('data-revelado', 'true')
            // Una vez revelado no hace falta seguir observándolo.
            observador.unobserve(entrada.target)
          }
        })
      },
      // Se dispara un poco antes de que el elemento llegue al borde inferior.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    )

    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)
}
