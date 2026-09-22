import { useState } from 'react'
import type { FiltrosDisponibles, OpcionFiltro } from '../api/types'
import { ChevronDownIcon, FilterIcon } from './Icons'

export interface FiltrosElegidos {
  finishing?: string
  material?: string
}

/**
 * Filtros del catálogo por terminación y material.
 *
 * <p>Cada opción muestra cuántos productos tiene. Las que no tienen ninguno no
 * llegan desde el servidor, así que nunca se ofrece un filtro que dejaría la
 * pantalla vacía.
 */
export function FiltrosCatalogo({
  disponibles,
  elegidos,
  onCambio,
}: {
  disponibles: FiltrosDisponibles
  elegidos: FiltrosElegidos
  onCambio: (elegidos: FiltrosElegidos) => void
}) {
  // Arranca plegado: desplegado ocupaba media pantalla antes de mostrar un
  // solo producto, y en el celular empujaba todo el catálogo fuera de la vista.
  const [abierto, setAbierto] = useState(false)
  const hayAlguno = Boolean(elegidos.finishing || elegidos.material)
  const cuantos = (elegidos.finishing ? 1 : 0) + (elegidos.material ? 1 : 0)

  function alternar(campo: keyof FiltrosElegidos, clave: string) {
    onCambio({ ...elegidos, [campo]: elegidos[campo] === clave ? undefined : clave })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="flex items-center gap-3 px-5">
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="panel-filtros"
          className="flex flex-1 items-center gap-2 py-4 text-left"
        >
          <FilterIcon className="size-4 shrink-0 text-ink-500" />
          <span className="font-display text-sm font-semibold tracking-wide text-ink-900 uppercase">
            Filtrar
          </span>
          {/* Con el panel cerrado, el contador es la única señal de que hay
              filtros puestos. */}
          {cuantos > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-medium text-white">
              {cuantos}
            </span>
          )}
          <ChevronDownIcon
            className={`ml-auto size-4 text-ink-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
          />
        </button>

        {hayAlguno && (
          <button
            type="button"
            onClick={() => onCambio({})}
            className="shrink-0 py-4 text-sm font-medium text-brand-600 transition hover:text-brand-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {abierto && (
        <div id="panel-filtros" className="border-t border-ink-100 px-5 pt-1 pb-5">
          <Grupo
            titulo="Por terminación"
            opciones={disponibles.terminaciones}
            elegida={elegidos.finishing}
            onElegir={(clave) => alternar('finishing', clave)}
          />
          <Grupo
            titulo="Por material"
            opciones={disponibles.materiales}
            elegida={elegidos.material}
            onElegir={(clave) => alternar('material', clave)}
          />
        </div>
      )}
    </div>
  )
}

function Grupo({
  titulo,
  opciones,
  elegida,
  onElegir,
}: {
  titulo: string
  opciones: OpcionFiltro[]
  elegida?: string
  onElegir: (clave: string) => void
}) {
  if (opciones.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs text-ink-500">{titulo}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const activa = elegida === opcion.clave
          return (
            <li key={opcion.clave}>
              <button
                type="button"
                onClick={() => onElegir(opcion.clave)}
                aria-pressed={activa}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  activa
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-300 text-ink-700 hover:border-ink-900'
                }`}
              >
                {opcion.etiqueta}
                <span className={`ml-1.5 text-xs ${activa ? 'text-ink-300' : 'text-ink-500'}`}>
                  {opcion.cantidad}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
