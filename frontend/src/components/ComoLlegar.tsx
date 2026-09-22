import { EMPRESA, domicilioCompleto } from '../config/empresa'
import { BarraCMYK } from './BarraCMYK'
import { Mapa } from './Mapa'
import { ArrowRightIcon } from './Icons'

/**
 * Dónde queda el local y cómo llegar.
 *
 * <p>Si no hay domicilio cargado la sección no se muestra, en vez de dibujar un
 * mapa apuntando a cualquier lado.
 */
export function ComoLlegar() {
  const domicilio = domicilioCompleto()
  if (!domicilio) return null

  const consulta = encodeURIComponent(`${domicilio}, ${EMPRESA.domicilio.pais}`)

  return (
    <section className="border-t border-white/10 py-14 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <BarraCMYK className="max-w-24" />
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Dónde estamos
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_minmax(0,1.3fr)]">
          <div>
            <p className="font-display text-lg text-white">{domicilio}</p>
            {EMPRESA.horarioAtencion && (
              <p className="mt-2 text-ink-300">{EMPRESA.horarioAtencion}</p>
            )}

            {/* Que envían a todo el país es un dato que amplía el público del
                sitio, y acá es donde alguien se pregunta si tiene que viajar. */}
            <p className="mt-4 text-ink-100">
              Podés retirar en el local o pedir que te lo enviemos:{' '}
              <strong className="text-white">hacemos envíos a todo el país</strong>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${consulta}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-900 transition hover:bg-ink-100"
              >
                Cómo llegar
                <ArrowRightIcon className="size-4" />
              </a>
              <a
                href={`https://www.waze.com/ul?q=${consulta}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-ink-900"
              >
                Abrir en Waze
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/15">
            <Mapa className="h-72 w-full sm:h-80" />
          </div>
        </div>
      </div>
    </section>
  )
}
