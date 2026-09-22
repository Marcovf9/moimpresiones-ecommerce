import { useCallback, useEffect, useRef, useState } from 'react'
import { imagenOptimizada } from '../api/imagenes'

export interface ImagenLightbox {
  url: string
  altText?: string | null
}

/**
 * Muestra una foto a pantalla completa, con zoom y navegación entre las demás.
 *
 * <p>Para una imprenta importa más que en otros rubros: es donde se ve el
 * troquelado, el relieve del cuño o el brillo del hot stamping, que en una
 * miniatura se pierden.
 */
export function Lightbox({
  imagenes,
  indiceInicial,
  onCerrar,
}: {
  imagenes: ImagenLightbox[]
  indiceInicial: number
  onCerrar: () => void
}) {
  const [indice, setIndice] = useState(indiceInicial)
  const [ampliada, setAmpliada] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const imagen = imagenes[indice]

  const anterior = useCallback(
    () => setIndice((i) => (i - 1 + imagenes.length) % imagenes.length),
    [imagenes.length],
  )
  const siguiente = useCallback(
    () => setIndice((i) => (i + 1) % imagenes.length),
    [imagenes.length],
  )

  // Al cambiar de foto se vuelve al tamaño normal: quedar con zoom en otra
  // imagen desorienta, porque el encuadre no tiene por qué coincidir.
  useEffect(() => setAmpliada(false), [indice])

  useEffect(() => {
    function alTeclado(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') siguiente()
    }
    document.addEventListener('keydown', alTeclado)

    // Con el visor abierto, el fondo no debe poder desplazarse.
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    contenedorRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', alTeclado)
      document.body.style.overflow = overflowPrevio
    }
  }, [onCerrar, anterior, siguiente])

  return (
    <div
      ref={contenedorRef}
      role="dialog"
      aria-modal="true"
      aria-label={imagen.altText ?? 'Foto del producto'}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <span className="text-sm text-ink-300">
          {indice + 1} de {imagenes.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAmpliada((v) => !v)}
            aria-pressed={ampliada}
            className="grid size-11 place-items-center rounded-full text-lg transition hover:bg-white/10"
            aria-label={ampliada ? 'Alejar' : 'Acercar'}
          >
            {ampliada ? '−' : '+'}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-11 place-items-center rounded-full text-xl transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      {/* El clic en el fondo cierra; el de la foto no debe propagarse. */}
      <div
        className={`flex flex-1 items-center justify-center px-4 pb-6 ${ampliada ? 'overflow-auto' : 'overflow-hidden'}`}
        onClick={onCerrar}
      >
        <img
          {...imagenOptimizada(imagen.url, ampliada ? 2000 : 1400)}
          alt={imagen.altText ?? ''}
          onClick={(e) => {
            e.stopPropagation()
            setAmpliada((v) => !v)
          }}
          className={`rounded-lg transition-transform duration-300 ${
            ampliada ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in object-contain'
          }`}
          style={ampliada ? { width: '180%' } : undefined}
        />
      </div>

      {imagenes.length > 1 && (
        <div className="flex items-center justify-center gap-3 pb-6">
          <button
            type="button"
            onClick={anterior}
            aria-label="Foto anterior"
            className="grid size-11 place-items-center rounded-full text-white transition hover:bg-white/10"
          >
            ←
          </button>
          <ul className="flex gap-2">
            {imagenes.map((img, i) => (
              <li key={img.url}>
                <button
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === indice}
                  className={`size-2.5 rounded-full transition ${
                    i === indice ? 'bg-white' : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Foto siguiente"
            className="grid size-11 place-items-center rounded-full text-white transition hover:bg-white/10"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
