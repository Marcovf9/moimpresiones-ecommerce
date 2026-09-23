import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Category, FiltrosDisponibles, ProductSummary } from '../api/types'
import { useApi } from '../hooks/useApi'
import { categoriasDelHtml } from '../api/datosDelHtml'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
} from '../components/Icons'
import { PageHeader, ErrorState } from '../components/PageChrome'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { SkeletonListadoProductos } from '../components/Skeletons'
import { ImagenConCarga } from '../components/ImagenConCarga'
import { FiltrosCatalogo, type FiltrosElegidos } from '../components/FiltrosCatalogo'
import { colorDeRubro } from '../components/BarraCMYK'
import { itemVacio, MAX_ITEMS, usePresupuesto } from '../hooks/usePresupuesto'

/**
 * ¿Se entró al catálogo para sumar productos al presupuesto?
 *
 * <p>Se lleva en la dirección y no en un estado suelto para que el modo
 * sobreviva a entrar en un rubro, filtrar o recargar la página, y para que
 * volver atrás desde el presupuesto devuelva al catálogo como estaba.
 */
function useModoEleccion() {
  const [searchParams] = useSearchParams()
  return searchParams.get('elegir') === '1'
}

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
  const { data: categories, loading, error } = useApi<Category[]>(
    () => api.categories(),
    [],
    categoriasDelHtml,
  )
  const [filtros, setFiltros] = useState<FiltrosElegidos>({})
  const [searchParams, setSearchParams] = useSearchParams()
  const hayFiltro = Boolean(filtros.finishing || filtros.material)
  const eligiendo = useModoEleccion()

  // El buscador existía solo dentro del menú, donde casi nadie lo encontraba.
  const [busqueda, setBusqueda] = useState('')
  const [termino, setTermino] = useState('')
  useEffect(() => {
    // Espera a que deje de escribir: si no, sale una consulta por tecla.
    const id = setTimeout(() => setTermino(busqueda.trim()), 300)
    return () => clearTimeout(id)
  }, [busqueda])
  const buscando = termino.length >= 2

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
    // Con la barra de selección abajo, el último renglón de productos quedaría
    // tapado: por eso el espacio extra al pie mientras se elige.
    <div className={`pt-20 sm:pt-24 ${eligiendo ? 'pb-48 sm:pb-52' : 'pb-14 sm:pb-20'}`}>
      <PageHeader
        eyebrow={eligiendo ? 'Tu presupuesto' : 'Catálogo'}
        title={eligiendo ? 'Elegí los productos' : 'Productos'}
        description={
          eligiendo
            ? 'Tocá cada producto que quieras cotizar. Cuando termines, tocá Finalizado y volvés al formulario con todo cargado.'
            : 'Elegí un rubro para ver todo lo que producimos. Cada ficha incluye materiales, formatos y terminaciones disponibles.'
        }
      />

      <div className="mx-auto mt-7 max-w-6xl sm:mt-10 space-y-4 px-6">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 focus-within:border-ink-900">
          <SearchIcon className="size-5 shrink-0 text-ink-500" />
          <span className="sr-only">Buscar productos</span>
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar: tarjetas, packaging, troquelado..."
            className="w-full text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
        </label>

        <BarraFiltros elegidos={filtros} onCambio={setFiltros} />
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-6">
        {buscando ? (
          <ResultadosDeBusqueda termino={termino} />
        ) : hayFiltro ? (
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

      {eligiendo && <BarraDeSeleccion />}
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

/**
 * Lo que encontró el buscador.
 *
 * <p>Reemplaza a la navegación por rubros mientras se busca, igual que los
 * filtros: mostrar las dos cosas a la vez confunde más de lo que ayuda.
 */
function ResultadosDeBusqueda({ termino }: { termino: string }) {
  const { data, loading } = useApi<ProductSummary[]>(() => api.search(termino), [termino])

  return (
    <section aria-live="polite">
      <h2 className="mb-4 font-display text-lg font-semibold text-white">
        {loading
          ? 'Buscando...'
          : `${data?.length ?? 0} ${data?.length === 1 ? 'resultado' : 'resultados'} para «${termino}»`}
      </h2>
      {!loading && data && data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/30 px-6 py-8 text-center text-ink-300">
          No encontramos nada con esa palabra. Probá con el nombre del producto, el material o una
          terminación.
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
  const eligiendo = useModoEleccion()

  if (products.length === 0) {
    return <p className="text-ink-500">Estamos cargando los productos de este rubro.</p>
  }

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {products.map((product) =>
        eligiendo ? (
          <li key={product.slug}>
            <TarjetaElegible product={product} />
          </li>
        ) : (
          <li key={product.slug}>
            <Link
              to={`/productos/${product.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink-900 hover:shadow-lg"
            >
              <PortadaYNombre product={product} />
              <span className="inline-flex items-center gap-1 px-3 pb-3 text-xs font-medium text-brand-600 sm:px-5 sm:pb-5 sm:text-sm">
                Ver ficha
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4" />
              </span>
            </Link>
          </li>
        ),
      )}
    </ul>
  )
}

/** Foto y nombre, que son iguales se esté eligiendo o no. */
function PortadaYNombre({ product }: { product: ProductSummary }) {
  return (
    <>
      {product.coverImageUrl && (
        <ImagenConCarga
          url={product.coverImageUrl}
          ancho={560}
          alt=""
          contenedorClassName="aspect-[4/3] w-full"
          className="size-full object-contain transition duration-500 group-hover:scale-105"
        />
      )}
      <span className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
        <span className="block text-sm leading-snug font-medium text-ink-900 sm:text-base">
          {product.name}
        </span>
        {/* El resumen se oculta en celular: a media pantalla de ancho alarga la
            tarjeta sin agregar nada que no diga el nombre. */}
        {product.summary && (
          <span className="mt-1 hidden text-sm text-ink-500 sm:block">{product.summary}</span>
        )}
      </span>
    </>
  )
}

/**
 * Tarjeta cuando se está armando el presupuesto: un toque lo suma y otro lo
 * saca. No lleva a la ficha a propósito; quien entró a elegir viene a juntar
 * varios, y abrir cada ficha para volver atrás hace ese camino largo.
 */
function TarjetaElegible({ product }: { product: ProductSummary }) {
  const { agregar, quitar, contiene, items } = usePresupuesto()
  const elegido = contiene(product.slug)
  const lleno = items.length >= MAX_ITEMS

  function alternar() {
    if (elegido) {
      quitar(items.findIndex((item) => item.productSlug === product.slug))
      return
    }
    agregar(
      itemVacio({
        productSlug: product.slug,
        productName: product.name,
        coverImageUrl: product.coverImageUrl,
      }),
    )
  }

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-xl border bg-white transition duration-300 ${
        elegido ? 'border-brand-600 ring-2 ring-brand-600' : 'border-ink-100 hover:border-ink-900'
      }`}
    >
      <button
        type="button"
        onClick={alternar}
        aria-pressed={elegido}
        disabled={!elegido && lleno}
        className="group flex flex-1 flex-col text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PortadaYNombre product={product} />
        <span
          className={`m-3 mt-0 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium sm:m-5 sm:mt-0 sm:text-sm ${
            elegido ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-900'
          }`}
        >
          {elegido ? (
            <>
              <CheckIcon className="size-4" />
              Agregado
            </>
          ) : (
            <>
              <PlusIcon className="size-4" />
              Agregar
            </>
          )}
        </span>
      </button>

      {/* Quien duda entre dos productos necesita los materiales y las medidas;
          el enlace va aparte del botón porque una tarjeta que hace dos cosas
          distintas al tocarla termina agregando lo que no se quería. */}
      <Link
        to={`/productos/${product.slug}`}
        className="border-t border-ink-100 px-3 py-2 text-center text-xs font-medium text-brand-600 transition hover:bg-ink-50 sm:px-5 sm:text-sm"
      >
        Ver ficha
      </Link>
    </div>
  )
}

/**
 * Barra fija con lo que se lleva elegido, al modo de un carrito.
 *
 * <p>Sin ella, quien elige cinco productos no tiene forma de saber qué juntó
 * ni cómo terminar, salvo volver al menú.
 */
function BarraDeSeleccion() {
  const { items, quitar } = usePresupuesto()
  const navegar = useNavigate()
  const elegidos = items.filter((item) => item.productSlug)

  return (
    // Por encima del globo de WhatsApp (z-30): si queda debajo, el globo tapa
    // el botón de terminar justo cuando hace falta.
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 pr-20 sm:px-6 sm:py-4 sm:pr-24">
        {elegidos.length === 0 ? (
          <p className="text-sm text-ink-100">
            Tocá los productos que quieras cotizar. Se van sumando acá abajo.
          </p>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {elegidos.map((item) => (
                <li key={item.productSlug}>
                  <button
                    type="button"
                    onClick={() => quitar(items.indexOf(item))}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1.5 pr-2 pl-3 text-xs text-white transition hover:bg-white/20 sm:text-sm"
                    aria-label={`Quitar ${item.productName}`}
                  >
                    {item.productName}
                    <span aria-hidden="true" className="text-ink-300">
                      ✕
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-300 sm:text-sm">
                {elegidos.length} {elegidos.length === 1 ? 'producto elegido' : 'productos elegidos'}
                {items.length >= MAX_ITEMS && ' · llegaste al máximo'}
              </p>
              <button
                type="button"
                onClick={() => navegar('/cotiza')}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition hover:bg-ink-100"
              >
                Finalizado
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
