import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Category, ProductSummary } from '../api/types'
import { useApi } from '../hooks/useApi'
import { ImagenConCarga } from './ImagenConCarga'
import { ArrowRightIcon } from './Icons'

/**
 * Cierre de la ficha: el resto del rubro y el salto al producto anterior o
 * siguiente.
 *
 * <p>Antes, desde una ficha solo se podía volver atrás, y eso cortaba el
 * recorrido justo cuando el visitante ya mostró interés en una familia de
 * productos.
 */
export function ProductosRelacionados({
  categorySlug,
  categoryName,
  slugActual,
}: {
  categorySlug: string
  categoryName: string
  slugActual: string
}) {
  const { data: categories } = useApi<Category[]>(() => api.categories(), [])

  const rubro = categories?.find((c) => c.slug === categorySlug)
  if (!rubro) return null

  const hermanos = rubro.products
  const posicion = hermanos.findIndex((p) => p.slug === slugActual)
  const anterior = posicion > 0 ? hermanos[posicion - 1] : null
  const siguiente = posicion >= 0 && posicion < hermanos.length - 1 ? hermanos[posicion + 1] : null
  const otros = hermanos.filter((p) => p.slug !== slugActual)

  return (
    <div className="mt-20 border-t border-white/10 pt-10">
      {(anterior || siguiente) && (
        <nav
          aria-label="Navegación entre productos del rubro"
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {anterior ? (
            <SaltoProducto producto={anterior} direccion="anterior" />
          ) : (
            <span />
          )}
          {siguiente && <SaltoProducto producto={siguiente} direccion="siguiente" />}
        </nav>
      )}

      {otros.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-white">
            Más de {categoryName}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {otros.map((producto) => (
              <li key={producto.slug}>
                <Link
                  to={`/productos/${producto.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink-900 hover:shadow-lg"
                >
                  {producto.coverImageUrl && (
                    <ImagenConCarga
                      url={producto.coverImageUrl}
                      ancho={400}
                      alt=""
                      contenedorClassName="aspect-[4/3] w-full"
                      className="size-full object-contain transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="flex flex-1 items-center justify-between gap-2 p-3 sm:p-4">
                    <span className="text-xs leading-snug font-medium text-ink-900 sm:text-sm">
                      {producto.name}
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SaltoProducto({
  producto,
  direccion,
}: {
  producto: ProductSummary
  direccion: 'anterior' | 'siguiente'
}) {
  const esAnterior = direccion === 'anterior'
  return (
    <Link
      to={`/productos/${producto.slug}`}
      className={`group flex max-w-[48%] items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 transition hover:border-ink-900 ${
        esAnterior ? '' : 'ml-auto flex-row-reverse text-right'
      }`}
    >
      <ArrowRightIcon
        className={`size-4 shrink-0 text-ink-500 transition-transform ${
          esAnterior ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
        }`}
      />
      <span className="min-w-0">
        <span className="block text-xs text-ink-500">{esAnterior ? 'Anterior' : 'Siguiente'}</span>
        <span className="block truncate text-sm font-medium text-ink-900">{producto.name}</span>
      </span>
    </Link>
  )
}
