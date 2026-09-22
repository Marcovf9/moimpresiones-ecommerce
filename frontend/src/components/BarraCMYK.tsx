/**
 * Las tres barras de color del logo, usadas como firma de la marca.
 *
 * <p>Es el elemento que identifica a MO Impresiones sin necesidad del logo, y
 * repetirlo en los cortes de cada pantalla ata todo el sitio a la identidad.
 * Va decorativo: no aporta información, así que se oculta a los lectores de
 * pantalla.
 */
export function BarraCMYK({
  className = '',
  grosor = 'fina',
}: {
  className?: string
  grosor?: 'fina' | 'gruesa'
}) {
  const alto = grosor === 'gruesa' ? 'h-1.5' : 'h-1'
  return (
    <span aria-hidden="true" className={`flex w-full overflow-hidden rounded-full ${alto} ${className}`}>
      <span className="flex-1 bg-cian" />
      <span className="flex-1 bg-brand-500" />
      <span className="flex-1 bg-amarillo" />
    </span>
  )
}

/**
 * Color de marca que le toca a cada rubro, rotando entre los tres del logo.
 * Sirve para que cada rubro se distinga de un vistazo sin inventar colores
 * fuera de la paleta.
 */
export const COLORES_RUBRO = ['cian', 'brand-500', 'amarillo'] as const

export function colorDeRubro(indice: number): string {
  return COLORES_RUBRO[indice % COLORES_RUBRO.length]
}
