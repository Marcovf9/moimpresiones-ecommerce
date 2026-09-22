import { Link } from 'react-router-dom'
import { BarraCMYK } from './BarraCMYK'
import { ArrowRightIcon } from './Icons'

/**
 * Los cuatro pasos de un trabajo.
 *
 * <p>Describe el circuito, que es el mismo en cualquier imprenta, y no promete
 * plazos ni condiciones: esos son datos del negocio y hasta no tenerlos
 * confirmados no se publican. Un plazo inventado es algo que después el
 * cliente reclama.
 */
const PASOS = [
  {
    titulo: 'Contanos qué necesitás',
    detalle:
      'Por WhatsApp o desde el formulario. Si ya sabés cantidad, formato y terminaciones, mejor; si no, lo vemos juntos.',
  },
  {
    titulo: 'Te pasamos el presupuesto',
    detalle:
      'Con el detalle de materiales, formato y acabados. Si hay una alternativa que conviene más, te la proponemos.',
  },
  {
    titulo: 'Aprobás el archivo',
    detalle:
      'Revisamos que el archivo esté listo para imprimir y te avisamos si algo hay que ajustar. Nada entra a máquina sin tu visto bueno.',
  },
  {
    titulo: 'Imprimimos y terminamos',
    detalle:
      'Producción, terminaciones y control. Te avisamos apenas está listo para que lo retires o coordinemos la entrega.',
  },
]

export function ComoTrabajamos() {
  return (
    <section className="border-t border-white/10 py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <BarraCMYK className="max-w-24" />
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Cómo trabajamos
        </h2>
        <p className="mt-2 max-w-2xl text-ink-300">
          De la consulta a la entrega, sin vueltas.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((paso, indice) => (
            <li
              key={paso.titulo}
              data-revelar
              data-retraso={String((indice % 3) + 1)}
              className="rounded-2xl border border-white/10 bg-white p-5"
            >
              <span className="font-display text-3xl font-semibold text-ink-100">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">
                {paso.titulo}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{paso.detalle}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Link
            to="/preguntas-frecuentes"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-300 transition hover:text-white"
          >
            Ver preguntas frecuentes
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
