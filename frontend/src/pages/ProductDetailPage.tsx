import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { ProductDetail } from '../api/types'
import { useApi } from '../hooks/useApi'
import { productoDelHtml } from '../api/datosDelHtml'
import { ArrowRightIcon } from '../components/Icons'
import { ErrorState } from '../components/PageChrome'
import { usePageMeta } from '../hooks/usePageMeta'
import { SkeletonFichaProducto } from '../components/Skeletons'
import { imagenOptimizada } from '../api/imagenes'
import { Lightbox } from '../components/Lightbox'
import { ProductosRelacionados } from '../components/ProductosRelacionados'
import { BotonAgregarPresupuesto } from '../components/BotonAgregarPresupuesto'

/** Ficha del producto: descripcion, fotos, ficha tecnica y boton de cotizacion. */
export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { data: product, loading, error } = useApi<ProductDetail>(
    () => api.product(slug),
    [slug],
    productoDelHtml(slug),
  )

  // El hook se llama siempre, aunque el producto todavía no haya llegado:
  // no puede quedar detrás de un return anticipado.
  usePageMeta({
    title: product?.name ?? 'Producto',
    description:
      product?.summary ??
      product?.description?.slice(0, 160) ??
      'Materiales, formatos y terminaciones disponibles. Pedí tu presupuesto sin compromiso.',
    path: `/productos/${slug}`,
    image: product?.images[0]?.url,
  })

  if (loading) return <SkeletonFichaProducto />
  if (error) return <ErrorState message={error} />
  if (!product) return <ErrorState message="No encontramos ese producto." />

  return (
    <article className="pt-20 pb-14 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <nav aria-label="Ruta de navegación" className="text-sm text-ink-300">
          <Link
            to="/productos"
            // El padding negativo agranda el área táctil sin correr el texto.
            className="-m-3 inline-block p-3 transition hover:text-white"
          >
            Productos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.categoryName}</span>
        </nav>

        <header className="mt-6">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-5xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-100">
              {product.description}
            </p>
          )}
        </header>

        <Gallery product={product} />

        {product.specs.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-white">Ficha técnica</h2>
            <dl className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white">
              {product.specs.map((spec, index) => (
                <div
                  key={spec.id}
                  className={`grid gap-1 px-6 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6 ${
                    index > 0 ? 'border-t border-ink-100' : ''
                  }`}
                >
                  <dt className="font-medium text-ink-900">{spec.label}</dt>
                  <dd className="text-ink-700">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {product.finishings.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
              Terminaciones disponibles
            </h2>
            <p className="mt-1 text-sm text-ink-300">Tocá cualquiera para ver de qué se trata.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.finishings.map((terminacion) => (
                <li key={terminacion.slug}>
                  {/* La ficha técnica dice "OPP mate, UV sectorizado" y quien no
                      es del rubro no sabe qué significa. Las nueve terminaciones
                      ya están explicadas con foto: acá se enlazan. */}
                  <Link
                    to={`/terminaciones?ver=${encodeURIComponent(terminacion.slug)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-ink-900/40 px-3 py-2 text-sm text-ink-100 transition hover:border-white hover:text-white"
                  >
                    {terminacion.name}
                    <span aria-hidden="true" className="text-brand-300">?</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-14 rounded-2xl border border-white/10 bg-ink-900/85 px-8 py-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            ¿Te interesa este producto?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-100">
            Contanos cantidad, formato y terminaciones, y te pasamos un presupuesto a medida.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to={`/cotiza?producto=${encodeURIComponent(product.slug)}`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 font-medium text-white transition hover:bg-brand-700"
            >
              Cotizá este producto
              <ArrowRightIcon />
            </Link>
            {/* Para quien necesita varias piezas: suma y sigue mirando. */}
            <BotonAgregarPresupuesto product={product} />
          </div>
        </div>

        <ProductosRelacionados
          categorySlug={product.categorySlug}
          categoryName={product.categoryName}
          slugActual={product.slug}
        />
      </div>
    </article>
  )
}

/** Galeria de fotos. Si el producto todavia no tiene, no deja un hueco vacio. */
/** Cada cuánto pasa sola a la foto siguiente. */
const INTERVALO_CARRUSEL = 3_000

function Gallery({ product }: { product: ProductDetail }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visorAbierto, setVisorAbierto] = useState(false)
  /**
   * Al elegir una foto a mano, el avance automático se detiene: seguir pasando
   * solo le sacaría al visitante justo lo que quiso mirar.
   */
  const [manual, setManual] = useState(false)

  const cantidad = product.images.length

  useEffect(() => {
    if (manual || visorAbierto || cantidad < 2) return
    // Quien pidió menos movimiento en su sistema no debería ver nada girando.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ciclo = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % cantidad),
      INTERVALO_CARRUSEL,
    )
    return () => window.clearInterval(ciclo)
  }, [manual, visorAbierto, cantidad])

  function elegir(indice: number) {
    setManual(true)
    setActiveIndex(indice)
  }

  if (product.images.length === 0) {
    return (
      <div className="mt-10 grid h-64 place-items-center rounded-2xl border border-dashed border-ink-300 bg-white text-ink-500">
        Estamos preparando las fotos de este producto.
      </div>
    )
  }

  const active = product.images[activeIndex] ?? product.images[0]

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setVisorAbierto(true)}
        aria-label={`Ver ${product.name} en grande`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl"
      >
        <img
          // La clave cambia con la foto: así React la vuelve a montar y el
          // fundido se dispara en cada paso.
          key={active.url}
          {...imagenOptimizada(active.url, 1100)}
          alt={active.altText ?? product.name}
          // contain y no cover: casi todas las fotos son verticales y un recorte
          // apaisado se comía el producto. El fondo neutro sostiene el encuadre.
          className="foto-carrusel aspect-[4/3] w-full bg-white object-contain"
        />
        <span className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-ink-900/80 px-3 py-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
          Ampliar
        </span>
      </button>

      {visorAbierto && (
        <Lightbox
          imagenes={product.images}
          indiceInicial={activeIndex}
          onCerrar={() => setVisorAbierto(false)}
        />
      )}

      {product.images.length > 1 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {product.images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => elegir(index)}
                aria-label={`Ver foto ${index + 1} de ${product.name}`}
                aria-current={index === activeIndex}
                className={`overflow-hidden rounded-lg border-2 transition ${
                  index === activeIndex ? 'border-ink-900' : 'border-transparent hover:border-ink-300'
                }`}
              >
                <img
                  {...imagenOptimizada(image.url, 80)}
                  alt=""
                  className="size-20 bg-white object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
