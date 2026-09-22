import { Button } from './AdminUI'

export interface SpecRow {
  label: string
  value: string
}

/** Sugerencias tomadas de las fichas que ya usa la imprenta. */
const ETIQUETAS_FRECUENTES = [
  'Material',
  'Formato',
  'Impresión',
  'Cantidad mínima offset',
  'Terminaciones',
  'Encuadernación',
  'Numeración',
  'Troquelado',
  'Presentación',
  'Personalización',
]

/** Editor de la ficha técnica: filas de característica y opciones. */
export function SpecEditor({
  specs,
  onChange,
}: {
  specs: SpecRow[]
  onChange: (specs: SpecRow[]) => void
}) {
  function update(index: number, patch: Partial<SpecRow>) {
    const next = [...specs]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= specs.length) return
    const next = [...specs]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <datalist id="etiquetas-ficha">
        {ETIQUETAS_FRECUENTES.map((etiqueta) => (
          <option key={etiqueta} value={etiqueta} />
        ))}
      </datalist>

      {specs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
          Sin ficha técnica. El visitante va a tener que preguntar materiales y formatos por WhatsApp.
        </p>
      ) : (
        <ul className="space-y-2">
          {specs.map((spec, index) => (
            <li key={index} className="flex flex-wrap items-start gap-2">
              <input
                type="text"
                list="etiquetas-ficha"
                value={spec.label}
                onChange={(event) => update(index, { label: event.target.value })}
                placeholder="Característica"
                aria-label={`Característica ${index + 1}`}
                className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-ink-900 focus:outline-none sm:w-56"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(event) => update(index, { value: event.target.value })}
                placeholder="Opciones"
                aria-label={`Opciones ${index + 1}`}
                className="min-w-0 flex-1 rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-ink-900 focus:outline-none"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir fila"
                  className="rounded px-2 py-2 text-xs text-ink-500 transition hover:bg-ink-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === specs.length - 1}
                  aria-label="Bajar fila"
                  className="rounded px-2 py-2 text-xs text-ink-500 transition hover:bg-ink-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(specs.filter((_, i) => i !== index))}
                  aria-label="Quitar fila"
                  className="rounded px-2 py-2 text-xs text-brand-600 transition hover:bg-brand-500/10"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <Button variant="secondary" onClick={() => onChange([...specs, { label: '', value: '' }])}>
          Agregar fila
        </Button>
      </div>
    </div>
  )
}
