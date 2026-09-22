/**
 * Pide las imágenes a Cloudinary ya optimizadas.
 *
 * <p>Lo que guardamos en la base es la URL del original, que puede pesar
 * varios MB. Cloudinary aplica las transformaciones al entregar: `f_auto`
 * elige WebP o AVIF según el navegador y `q_auto` ajusta la compresión.
 * En las pruebas, un PNG de 2,6 MB baja a menos de 300 KB.
 *
 * <p>Las URLs que no son de Cloudinary —las del modo local, que conviven en
 * la base— se devuelven tal cual.
 */

const MARCA = '/upload/'

/** `c_limit` evita agrandar una foto más allá de su tamaño original. */
function transformar(url: string, ancho: number): string {
  const corte = url.indexOf(MARCA)
  if (corte < 0) return url
  const hasta = corte + MARCA.length
  return `${url.slice(0, hasta)}f_auto,q_auto,c_limit,w_${ancho}/${url.slice(hasta)}`
}

export interface FuenteImagen {
  src: string
  srcSet?: string
}

/**
 * @param ancho ancho en píxeles CSS al que se muestra la imagen. El srcSet
 *        suma la versión al doble, para pantallas de alta densidad.
 */
export function imagenOptimizada(url: string | null | undefined, ancho: number): FuenteImagen {
  if (!url) return { src: '' }
  if (!url.includes(MARCA)) return { src: url }

  return {
    src: transformar(url, ancho),
    srcSet: `${transformar(url, ancho)} 1x, ${transformar(url, ancho * 2)} 2x`,
  }
}
