import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { adminApi } from '../adminClient'
import type { TextoEditable } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { Banner, Button, Card, Spinner } from '../components/AdminUI'

/**
 * Textos del sitio.
 *
 * <p>Los que cambian con el tiempo —el horario, la historia de la empresa— y
 * antes obligaban a pedir un cambio de código. Cada uno se guarda por
 * separado: si el dueño edita tres y uno falla, los otros dos ya quedaron.
 */
export function TextosPage() {
  const { data, loading, error } = useAdminData<TextoEditable[]>(() => adminApi.textos(), [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Textos del sitio</h1>
        <p className="mt-1 text-ink-500">
          Lo que dice la página. Se ve en el sitio apenas guardás.
        </p>
      </div>

      {loading && <Spinner label="Cargando los textos" />}
      {error && <Banner kind="error">{error}</Banner>}

      {data?.map((texto) => <EditorDeTexto key={texto.clave} texto={texto} />)}
    </div>
  )
}

function EditorDeTexto({ texto }: { texto: TextoEditable }) {
  const [valor, setValor] = useState(texto.valor)
  /**
   * Lo último guardado, que no es lo mismo que lo que vino al cargar: sin esta
   * distinción, después de guardar el editor seguía marcando cambios sin
   * guardar sobre un texto que ya estaba en el servidor.
   */
  const [guardadoEnElServidor, setGuardadoEnElServidor] = useState(texto.valor)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Al recargar la lista, el texto vuelve desde el servidor.
  useEffect(() => {
    setValor(texto.valor)
    setGuardadoEnElServidor(texto.valor)
  }, [texto.valor])

  const cambiado = valor.trim() !== guardadoEnElServidor.trim()

  async function guardar() {
    setGuardando(true)
    setError(null)
    setGuardado(false)
    try {
      const actualizado = await adminApi.guardarTexto(texto.clave, valor)
      setGuardadoEnElServidor(actualizado.valor)
      setValor(actualizado.valor)
      setGuardado(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos guardarlo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">{texto.titulo}</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">{texto.ayuda}</p>
        </div>
        {guardado && !cambiado && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
            Guardado
          </span>
        )}
      </div>

      <textarea
        value={valor}
        onChange={(evento) => {
          setValor(evento.target.value)
          setGuardado(false)
        }}
        rows={valor.length > 200 ? 10 : 3}
        className="mt-4 w-full rounded-lg border border-ink-300 px-3 py-2 text-sm leading-relaxed text-ink-900 focus:border-ink-900 focus:outline-none"
      />

      {error && (
        <div className="mt-3">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={guardar} disabled={!cambiado || guardando || !valor.trim()}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
        {cambiado && (
          <button
            type="button"
            onClick={() => setValor(guardadoEnElServidor)}
            className="text-sm font-medium text-ink-500 underline transition hover:text-ink-900"
          >
            Deshacer
          </button>
        )}
      </div>
    </Card>
  )
}
