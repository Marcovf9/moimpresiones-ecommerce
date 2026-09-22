/**
 * Datos que vienen dentro del HTML, tomados del catálogo al publicar.
 *
 * <p>El sitio pide todo a la API al arrancar. Cuando la API no contesta —se
 * reinicia en cada despliegue del backend, y son unos minutos— la pantalla
 * quedaba en "No pudimos cargar la información", y Google, que ejecuta el
 * JavaScript antes de decidir, marcó /productos como «Soft 404»: una página
 * que responde bien pero no muestra nada.
 *
 * <p>Ahora `scripts/prerender.mjs` deja el catálogo escrito en cada archivo, y
 * esto lo lee una sola vez. Sirve como punto de partida: la pantalla aparece
 * llena de entrada, y la API la actualiza apenas responde. Si un producto
 * cambió en el panel y todavía no se volvió a publicar, el visitante ve la
 * versión vieja el primer instante y la nueva enseguida.
 */
import type { Category, Finishing, ProductDetail } from './types'

interface DatosDelHtml {
  categorias?: Category[]
  terminaciones?: Finishing[]
  producto?: ProductDetail
}

function leer(): DatosDelHtml {
  try {
    const etiqueta = document.getElementById('datos-del-sitio')
    if (!etiqueta?.textContent) return {}
    return JSON.parse(etiqueta.textContent) as DatosDelHtml
  } catch {
    // Un JSON roto no puede dejar el sitio en blanco: se sigue con la API.
    return {}
  }
}

const DATOS = leer()

export const categoriasDelHtml = DATOS.categorias ?? null
export const terminacionesDelHtml = DATOS.terminaciones ?? null

/** El producto embebido, solo si es el de esta dirección. */
export function productoDelHtml(slug: string | undefined): ProductDetail | null {
  return DATOS.producto && DATOS.producto.slug === slug ? DATOS.producto : null
}
