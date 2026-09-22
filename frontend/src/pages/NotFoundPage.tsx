import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFoundPage() {
  usePageMeta({
    title: 'Página no encontrada',
    description: 'La dirección que buscás no existe en el sitio de MO Impresiones.',
  })

  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 pt-24 text-center">
      <div>
        <p className="font-display text-sm tracking-[0.3em] text-brand-300 uppercase">Error 404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">
          No encontramos esa página
        </h1>
        <p className="mt-3 text-ink-300">
          Puede que el enlace esté viejo o que la dirección tenga un error.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-medium text-ink-900 transition hover:bg-ink-100"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
