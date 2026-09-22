import { useState } from 'react'
import { imagenOptimizada } from '../api/imagenes'

/**
 * Foto con un brillo tenue mientras carga.
 *
 * <p>En la grilla del celular entran hasta nueve fotos de una, y con conexión
 * lenta se veían recuadros vacíos. El brillo ocupa el lugar exacto de la foto,
 * así nada salta cuando llega, y da la señal de que algo está viniendo.
 *
 * <p>Si la foto falla, el brillo se apaga y queda el fondo neutro: dejarlo
 * animado para siempre haría creer que todavía está cargando.
 */
export function ImagenConCarga({
  url,
  ancho,
  alt,
  className = '',
  contenedorClassName = '',
  priority = false,
}: {
  url: string | null | undefined
  ancho: number
  alt: string
  className?: string
  contenedorClassName?: string
  /** Para la foto principal de una ficha, que no conviene diferir. */
  priority?: boolean
}) {
  const [estado, setEstado] = useState<'cargando' | 'lista' | 'fallo'>('cargando')

  if (!url) {
    return <div className={`bg-ink-100 ${contenedorClassName} ${className}`} />
  }

  return (
    <div className={`relative overflow-hidden bg-ink-100 ${contenedorClassName}`}>
      {estado === 'cargando' && (
        <span aria-hidden="true" className="absolute inset-0 animate-brillo bg-brillo" />
      )}
      <img
        {...imagenOptimizada(url, ancho)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setEstado('lista')}
        onError={() => setEstado('fallo')}
        className={`transition-opacity duration-500 ${
          estado === 'lista' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  )
}
