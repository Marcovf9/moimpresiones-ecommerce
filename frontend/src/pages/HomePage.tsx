import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRightIcon } from '../components/Icons'
import { usePageMeta } from '../hooks/usePageMeta'
import { BarraCMYK, colorDeRubro } from '../components/BarraCMYK'
import { api } from '../api/client'
import type { Category } from '../api/types'
import { useApi } from '../hooks/useApi'
import { ImagenConCarga } from '../components/ImagenConCarga'
import { ComoTrabajamos } from '../components/ComoTrabajamos'
import { ComoLlegar } from '../components/ComoLlegar'
import { useRevelarAlScroll } from '../hooks/useRevelarAlScroll'

/**
 * Texto institucional entregado por el cliente ("Quienes somos FINAL.docx").
 * Vive en el frontend porque es copy fijo, no contenido de catalogo.
 */
const ABOUT_PARAGRAPHS = [
  'Somos una empresa gráfica familiar de Córdoba, Argentina, con más de 30 años de trayectoria en la industria.',
  'Desde 1994, trabajamos acompañando a empresas, comercios y emprendimientos en el desarrollo de sus proyectos gráficos, combinando experiencia, calidad y atención personalizada.',
  'A lo largo de los años fuimos creciendo, incorporando tecnología y ampliando nuestras capacidades de producción, sin perder la esencia que nos caracteriza desde el comienzo: el compromiso con cada trabajo y la cercanía con nuestros clientes.',
  'Hoy seguimos apostando a la industria gráfica, ofreciendo soluciones a medida y cuidando cada etapa del proceso, desde la impresión hasta la terminación final.',
]

export function HomePage() {
  const location = useLocation()

  useRevelarAlScroll()

  usePageMeta({
    title: 'MO Impresiones',
    description:
      'Imprenta en Córdoba, Argentina. Más de 30 años imprimiendo: institucional, comercial, editorial, packaging, impresos numerados y regalos empresariales.',
    path: '/',
  })

  // El menu enlaza a /#quienes-somos: al llegar con ese hash, bajamos a la seccion.
  useEffect(() => {
    if (location.hash === '#quienes-somos') {
      document.getElementById('quienes-somos')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location])

  return (
    <>
      <Hero />

      <section id="quienes-somos" data-revelar className="scroll-mt-20 py-14 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="font-display text-xs tracking-[0.3em] text-brand-300 uppercase sm:text-sm">
            Nuestra historia
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:mt-3 sm:text-5xl">
            ¿Quiénes somos?
          </h2>

          <div className="mt-6 space-y-4 leading-relaxed text-ink-100 sm:mt-8 sm:space-y-5 sm:text-lg">
            {ABOUT_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-8 border-l-4 border-brand-500 pl-5 font-display text-xl text-white italic sm:mt-10 sm:pl-6 sm:text-2xl">
            Más de tres décadas imprimiendo ideas y construyendo relaciones.
          </p>

          <div className="mt-9 flex flex-wrap gap-3 sm:mt-12 sm:gap-4">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-medium text-ink-900 transition hover:bg-ink-100"
            >
              Ver productos
              <ArrowRightIcon />
            </Link>
            <Link
              to="/cotiza"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 font-medium text-white transition hover:bg-white hover:text-ink-900"
            >
              Cotizá tu proyecto
            </Link>
          </div>
        </div>
      </section>

      <RubrosDestacados />
      <ComoTrabajamos />
      <ComoLlegar />
    </>
  )
}

/**
 * Qué imprimen, en la portada. Antes la página de inicio terminaba en la
 * historia de la empresa y nunca mostraba el trabajo: quien llegaba tenía que
 * entrar al menú para enterarse de qué se hace acá.
 */
function RubrosDestacados() {
  const { data: categories } = useApi<Category[]>(() => api.categories(), [])
  useRevelarAlScroll([categories])

  if (!categories || categories.length === 0) return null

  return (
    <section className="border-t border-white/10 py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <BarraCMYK className="max-w-24" />
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Qué imprimimos
        </h2>
        <p className="mt-2 max-w-2xl text-ink-300">
          Seis familias de productos, cada una con sus materiales, formatos y terminaciones.
        </p>

        {/* Todas las fotos del catálogo son trabajos que salieron de esta
            imprenta, y hasta ahora nada lo decía: el visitante las tomaba por
            fotos de catálogo genéricas. Decirlo cambia cómo se leen. */}
        <p className="mt-4 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-ink-900/80 px-4 py-2.5 text-sm text-white">
          {/* La barra va envuelta: por dentro usa w-full, así que pasarle un
              ancho por className no alcanza para acotarla. */}
          <span className="w-7 shrink-0">
            <BarraCMYK />
          </span>
          <span>Todo lo que ves acá lo imprimimos nosotros</span>
        </p>

        <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-3">
          {categories.map((category, indice) => {
            const portada = category.products.find((p) => p.coverImageUrl)?.coverImageUrl
            return (
              <li key={category.slug} data-revelar data-retraso={String((indice % 3) + 1)}>
                <Link
                  to={`/productos?rubro=${encodeURIComponent(category.slug)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-white hover:shadow-lg"
                >
                  <ImagenConCarga
                    url={portada}
                    ancho={520}
                    alt=""
                    contenedorClassName="aspect-[4/3] w-full"
                    className="size-full object-contain transition duration-500 group-hover:scale-105"
                  />
                  <div
                    className="border-t-4 p-3 sm:p-5"
                    style={{ borderTopColor: `var(--color-${colorDeRubro(indice)})` }}
                  >
                    <h3 className="font-display text-sm leading-snug font-semibold text-ink-900 sm:text-lg">
                      {category.name}
                    </h3>
                    {/* La descripción se guarda para tablet en adelante: en dos
                        columnas de celular no entra sin apretar todo. */}
                    <p className="mt-1 hidden line-clamp-2 text-sm text-ink-500 sm:block">
                      {category.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 sm:mt-3 sm:text-sm">
                      Ver los {category.products.length}
                      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/**
 * Nombre del negocio sobre una foto del taller.
 *
 * <p>La imagen se coloca en public/imagenes/portada.jpg. Si falta, queda el
 * degradado sobre el fondo oscuro y la portada se ve entera igual: el texto
 * nunca depende de que la foto cargue.
 */
function Hero() {
  return (
    <section className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-900">
      <img
        src="/imagenes/portada.jpg"
        alt=""
        aria-hidden="true"
        // Es lo primero que se ve: la carga ansiosa evita el salto visual.
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover opacity-60"
        onError={(event) => {
          // Sin foto cargada todavia, el degradado sostiene la portada solo.
          event.currentTarget.style.display = 'none'
        }}
      />

      {/* El degradado es más fuerte en el medio que antes: ahí va el subtítulo,
          y la foto de la máquina tiene zonas claras que lo dejaban al límite. */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/75 via-ink-900/65 to-ink-900" />

      <div className="relative px-6 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
          MO Impresiones
        </h1>
        <BarraCMYK className="mx-auto mt-6 max-w-40" grosor="gruesa" />
        <p className="mx-auto mt-5 max-w-xl text-ink-100 sm:mt-6 sm:text-lg">
          Imprenta en Córdoba, Argentina. Más de 30 años de oficio gráfico,
          del pliego a la terminación final.
        </p>
        <a
          href="#quienes-somos"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 font-medium text-white transition hover:bg-white hover:text-ink-900"
        >
          Conocenos
        </a>
      </div>
    </section>
  )
}
