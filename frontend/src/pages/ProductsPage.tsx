import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Category, FiltrosDisponibles, ProductSummary } from '../api/types'
import { useApi } from '../hooks/useApi'
import { ArrowRightIcon, ChevronDownIcon } from '../components/Icons'
import { PageHeader, ErrorState } from '../components/PageChrome'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { SkeletonListadoProductos } from '../components/Skeletons'
import { ImagenConCarga } from '../components/ImagenConCarga'
import { FiltrosCatalogo, type FiltrosElegidos } from '../components/FiltrosCatalogo'
import { colorDeRubro } from '../components/BarraCMYK'

/**
 * Listado de rubros.
 *
 * <p>Escritorio y teléfono se comportan distinto, así que se arman por separado:
 * en escritorio pasar por encima de un rubro muestra sus derivados en la columna
 * de al lado, y en teléfono el toque los despliega debajo, en un acordeón que se
 * puede cerrar. Compartían un solo estado y eso hacía que en el celular quedara
 * siempre un rubro abierto: al cerrarlo, el valor caía a null y el respaldo
 * reabría el primero.
 */
export function ProductsPage() {
  const { data: categories, loading, error } = useApi<Category[]>(() => api.categories(), [])
  const [filtros, setFiltros] = useState<FiltrosElegidos>({})
  const [searchParams, setSearchParams] = useSearchParams()
  const hayFiltro = Boolean(filtros.finishing || filtros.material)

  // Con ?rubro=slug se entra directo a un rubro, que es como llega quien lo
  // elige desde el menú del celular.
  const rubroElegido = searchParams.get('rubro')

  usePageMeta(metaDe('/productos'))

  if (loading) return <SkeletonListadoProductos />
  if (error) return <ErrorState message={error} />
  if (!categories || categories.length === 0) {
    return <ErrorState message="Todavía no hay productos cargados." />
  }

  const rubro = rubroElegido ? categories.find((c) => c.slug === rubroElegido) : undefined

  return (
    <div className="pt-20 pb-14 sm:pt-24 sm:pb-20">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="Elegí un rubro para ver todo lo que producimos. Cada ficha incluye materiales, formatos y terminaciones disponibles."
      />

      <div className="mx-auto mt-7 max-w-6xl sm:mt-10 space-y-6 px-6">
        <BarraFiltros elegidos={filtros} onCambio={setFiltros} />
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-6">
        {hayFiltro ? (
          <ResultadosFiltrados filtros={filtros} />
        ) : rubro ? (
          <RubroSolo rubro={rubro} onVerTodos={() => setSearchParams({})} />
        ) : (
          <>
            <AcordeonMovil categories={categories} />
            <VistaEscritorio categories={categories} />
          </>
        )}
      </div>
    </div>
  )
}

/** Teléfono: acordeón que se abre y se cierra con el mismo toque. */
/** Filtros por terminación y material, con la cantidad de cada opción. */
function BarraFiltros({
  elegidos,
  onCambio,
}: {
  elegidos: FiltrosElegidos
  onCambio: (elegidos: FiltrosElegidos) => void
}) {
  const { data: disponibles } = useApi<FiltrosDisponibles>(() => api.filtros(), [])
  if (!disponibles) return null

  return <FiltrosCatalogo disponibles={disponibles} elegidos={elegidos} onCambio={onCambio} />
}

/**
 * Resultados de los filtros. Con algún filtro activo reemplaza a la navegación
 * por rubros: mezclar las dos formas de recorrer el catálogo a la vez confunde
 * más de lo que ayuda.
 */
function ResultadosFiltrados({ filtros }: { filtros: FiltrosElegidos }) {
  const { data, loading } = useApi<ProductSummary[]>(
    () => api.productosFiltrados(filtros),
    [filtros.finishing, filtros.material],
  )

  return (
    <section aria-live="polite">
      <h2 className="mb-4 font-display text-lg font-semibold text-white">
        {loading ? 'Buscando...' : `${data?.length ?? 0} ${data?.length === 1 ? 'producto' : 'productos'}`}
      </h2>
      {!loading && data && data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/30 px-6 py-8 text-center text-ink-300">
          No hay productos con esa combinación. Probá con un solo filtro.
        </p>
      ) : (
        data && <ProductGrid products={data} />
      )}
    </section>
  )
}

/** Un solo rubro, con la vuelta al catálogo completo siempre a la vista. */
function RubroSolo({ rubro, onVerTodos }: { rubro: Category; onVerTodos: () => void }) {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">{rubro.name}</h2>
          {rubro.description && <p className="mt-1 max-w-2xl text-ink-300">{rubro.description}</p>}
        </div>
        <button
          type="button"
          onClick={onVerTodos}
          className="rounded-lg border border-white/40 px-3 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-ink-900"
        >
          Ver todos los rubros
        </button>
      </div>
      <div className="mt-6">
        <ProductGrid products={rubro.products} />
      </div>
    </section>
  )
}

function AcordeonMovil({ categories }: { categories: Category[] }) {
  // null es un estado válido: todos cerrados.
  const [abierto, setAbierto] = useState<string | null>(null)

  return (
    <ul className="space-y-2 lg:hidden">
      {categories.map((category, indice) => {
        const estaAbierto = category.slug === abierto
        const panelId = `rubro-${category.slug}`
        // Cada rubro lleva uno de los tres colores del logo, rotando, para
        // distinguirse de un vistazo sin salirse de la paleta.
        const color = colorDeRubro(indice)
        return (
          <li key={category.slug}>
            <button
              type="button"
              onClick={() => setAbierto((actual) => (actual === category.slug ? null : category.slug))}
              aria-expanded={estaAbierto}
              aria-controls={panelId}
              style={{ borderLeftColor: `var(--color-${color})` }}
              className={`flex w-full items-center justify-between gap-4 rounded-xl border border-l-4 px-4 py-3.5 text-left transition sm:px-5 sm:py-4 ${
                estaAbierto
                  ? 'border-white/30 bg-ink-900 text-white'
                  : 'border-white/10 bg-white text-ink-900'
              }`}
            >
              <span>
                <span className="block font-display text-base font-semibold sm:text-lg">{category.name}</span>
                <span className={`mt-0.5 block text-sm ${estaAbierto ? 'text-ink-100' : 'text-ink-500'}`}>
                  {category.products.length}{' '}
                  {category.products.length === 1 ? 'producto' : 'productos'}
                </span>
              </span>
              <ChevronDownIcon
                className={`size-5 shrink-0 transition-transform ${estaAbierto ? 'rotate-180' : ''}`}
              />
            </button>

            {estaAbierto && (
              <div id={panelId} className="mt-2">
                {category.description && (
                  <p className="mb-3 px-1 text-sm text-ink-300">{category.description}</p>
                )}
                <ProductGrid products={category.products} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Escritorio: la columna izquierda elige y la derecha muestra. */
function VistaEscritorio({ categories }: { categories: Category[] }) {
  // Acá siempre hay uno elegido: el panel de la derecha no puede quedar vacío.
  const [elegido, setElegido] = useState(categories[0].slug)
  const active = categories.find((c) => c.slug === elegido) ?? categories[0]

  return (
    <div className="hidden gap-8 lg:grid lg:grid-cols-[minmax(0,22rem)_1fr]">
      <ul className="space-y-2">
        {categories.map((category, indice) => {
          const isActive = category.slug === active.slug
          const color = colorDeRubro(indice)
          return (
            <li key={category.slug}>
              <button
                type="button"
                onMouseEnter={() => setElegido(category.slug)}
                onFocus={() => setElegido(category.slug)}
                onClick={() => setElegido(category.slug)}
                aria-current={isActive}
                style={{ borderLeftColor: `var(--color-${color})` }}
                className={`flex w-full items-center justify-between gap-4 rounded-xl border border-l-4 px-4 py-3.5 text-left transition sm:px-5 sm:py-4 ${
                  isActive
                    ? 'border-white/30 bg-ink-900 text-white'
                    : 'border-white/10 bg-white text-ink-900 hover:border-ink-300'
                }`}
              >
                <span>
                  <span className="block font-display text-lg font-semibold sm:text-xl">{category.name}</span>
                  <span className={`mt-1 block text-sm ${isActive ? 'text-ink-100' : 'text-ink-500'}`}>
                    {category.products.length}{' '}
                    {category.products.length === 1 ? 'producto' : 'productos'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="rounded-2xl border border-white/10 bg-white p-8">
        <h2 className="font-display text-2xl font-semibold text-ink-900">{active.name}</h2>
        {active.description && <p className="mt-2 max-w-2xl text-ink-500">{active.description}</p>}
        <div className="mt-6">
          <ProductGrid products={active.products} />
        </div>
      </div>
    </div>
  )
}

function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return <p className="text-ink-500">Estamos cargando los productos de este rubro.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {products.map((product) => (
        <li key={product.slug}>
          <Link
            to={`/productos/${product.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink-900 hover:shadow-lg"
          >
            {product.coverImageUrl && (
              <ImagenConCarga
                url={product.coverImageUrl}
                ancho={560}
                alt=""
                contenedorClassName="aspect-[4/3] w-full"
                className="size-full object-contain transition duration-500 group-hover:scale-105"
              />
            )}
            <span className="flex flex-1 flex-col justify-between gap-2 p-3 sm:gap-3 sm:p-5">
              <span>
                <span className="block text-sm leading-snug font-medium text-ink-900 sm:text-base">
                  {product.name}
                </span>
                {/* El resumen se oculta en celular: a media pantalla de ancho
                    alarga la tarjeta sin agregar nada que no diga el nombre. */}
                {product.summary && (
                  <span className="mt-1 hidden text-sm text-ink-500 sm:block">{product.summary}</span>
                )}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 sm:text-sm">
                Ver ficha
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
