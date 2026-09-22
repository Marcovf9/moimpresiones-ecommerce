import { Link } from 'react-router-dom'
import { BarraCMYK } from './BarraCMYK'

/** Encabezado comun de las paginas internas. */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <header className="mx-auto max-w-6xl px-6">
      <BarraCMYK className="max-w-24" />
      <p className="mt-3 font-display text-xs tracking-[0.3em] text-brand-300 uppercase sm:mt-4 sm:text-sm">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:mt-3 sm:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-ink-300 sm:mt-4 sm:text-lg">{description}</p>}
    </header>
  )
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 pt-24">
      <p className="text-ink-300" role="status">
        {label}...
      </p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 pt-24 text-center">
      <div>
        <p className="text-lg text-white">{message}</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-ink-900 transition hover:bg-ink-100"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
