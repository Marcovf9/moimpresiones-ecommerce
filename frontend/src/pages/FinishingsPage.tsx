import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Finishing } from '../api/types'
import { useApi } from '../hooks/useApi'
import { terminacionesDelHtml } from '../api/datosDelHtml'
import { Modal } from '../components/Modal'
import { ErrorState, PageHeader } from '../components/PageChrome'
import type React from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { colorDeRubro } from '../components/BarraCMYK'
import { useRevelarAlScroll } from '../hooks/useRevelarAlScroll'
import { SkeletonTerminaciones } from '../components/Skeletons'
import { imagenOptimizada } from '../api/imagenes'
import { ImagenConCarga } from '../components/ImagenConCarga'

/**
 * Grilla de terminaciones con el nombre debajo de cada imagen.
 * Al tocar una se abre un modal con su foto y su descripcion.
 */
export function FinishingsPage() {
  const { data: finishings, loading, error } = useApi<Finishing[]>(
    () => api.finishings(),
    [],
    terminacionesDelHtml,
  )
  const [selected, setSelected] = useState<Finishing | null>(null)

  // Se vuelve a observar cuando llegan los datos: antes no había qué revelar.
  useRevelarAlScroll([finishings])

  // Con ?ver=slug se abre directo esa terminación, que es como se llega desde
  // la ficha de un producto.
  const [searchParams, setSearchParams] = useSearchParams()
  const pedida = searchParams.get('ver')
  useEffect(() => {
    if (!pedida || !finishings) return
    const encontrada = finishings.find((f) => f.slug === pedida)
    if (encontrada) setSelected(encontrada)
  }, [pedida, finishings])

  function cerrar() {
    setSelected(null)
    // Se limpia el parámetro: si no, volver atrás reabriría el modal.
    if (pedida) setSearchParams({}, { replace: true })
  }

  usePageMeta(metaDe('/terminaciones'))

  if (loading) return <SkeletonTerminaciones />
  if (error) return <ErrorState message={error} />
  if (!finishings || finishings.length === 0) {
    return <ErrorState message="Todavía no hay terminaciones cargadas." />
  }

  return (
    <div className="pt-20 pb-14 sm:pt-24 sm:pb-20">
      <PageHeader
        eyebrow="Acabados"
        title="Terminaciones"
        description="El detalle que distingue una pieza. Tocá cada terminación para ver de qué se trata."
      />

      <ul className="mx-auto mt-7 grid max-w-6xl grid-cols-3 gap-2.5 px-4 sm:mt-10 sm:gap-6 sm:px-6">
        {finishings.map((finishing, index) => (
          <li
            key={finishing.slug}
            data-revelar
            data-retraso={String((index % 3) + 1)}
            style={{ '--acento': `var(--color-${colorDeRubro(index)})` } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => setSelected(finishing)}
              className="group w-full text-left"
            >
              {/* El borde toma el color del rubro al pasar por encima: el acento
                  aparece solo en la interacción, sin cargar la grilla. */}
              <div className="overflow-hidden rounded-lg border border-transparent bg-ink-100 transition-colors group-hover:border-[var(--acento)] sm:rounded-2xl sm:border-2">
                {finishing.imageUrl ? (
                  <ImagenConCarga
                    url={finishing.imageUrl}
                    ancho={480}
                    alt={finishing.name}
                    contenedorClassName="aspect-[4/3] w-full"
                    className="size-full bg-white object-contain transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center bg-ink-900 text-ink-300">
                    <span className="font-display text-[0.6rem] tracking-[0.15em] uppercase sm:text-sm">
                      MO Impresiones
                    </span>
                  </div>
                )}
              </div>
              <h2 className="mt-2 font-display text-xs leading-snug font-medium text-white transition group-hover:text-brand-300 sm:mt-3 sm:text-lg">
                {finishing.name}
              </h2>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={selected !== null}
        onClose={cerrar}
        title={selected?.name ?? ''}
      >
        {selected && (
          <>
            {selected.imageUrl && (
              <img
                {...imagenOptimizada(selected.imageUrl, 900)}
                alt={selected.name}
                className="mb-6 max-h-[60vh] w-full rounded-xl bg-white object-contain"
              />
            )}
            <p className="text-lg leading-relaxed text-ink-700">{selected.description}</p>
          </>
        )}
      </Modal>
    </div>
  )
}
