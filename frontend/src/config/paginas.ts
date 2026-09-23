import datos from './paginas.json'

/**
 * Titulo y descripcion de cada pantalla fija del sitio.
 *
 * <p>Viven en un JSON, y no dentro de cada componente, porque los necesitan
 * dos lados: la pagina cuando el visitante navega, y el script que genera un
 * HTML por direccion al publicar (scripts/prerender.mjs). Con el texto en dos
 * lugares, tarde o temprano uno queda viejo y Google muestra el que no es.
 */
export interface MetaDePagina {
  title: string
  description: string
  path: string
  /** Pantallas que no tienen por qué salir en un buscador. */
  noIndexar?: boolean
}

const PAGINAS = datos as Record<
  string,
  { titulo: string; descripcion: string; sinIndexar?: boolean }
>

export function metaDe(ruta: keyof typeof datos): MetaDePagina {
  const pagina = PAGINAS[ruta]
  return {
    title: pagina.titulo,
    description: pagina.descripcion,
    path: ruta,
    noIndexar: pagina.sinIndexar,
  }
}
