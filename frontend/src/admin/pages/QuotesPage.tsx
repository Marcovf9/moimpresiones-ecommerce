import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { adminApi, type FiltrosDeCotizaciones } from '../adminClient'
import type { AdminQuote, AdminQuoteAttachment, Page, QuoteStatus } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { Banner, Button, Card, EmptyState, Spinner } from '../components/AdminUI'
import { QuoteStatusBadge } from '../components/QuoteStatusBadge'
import { IconoBuscar, IconoDescargar } from '../components/IconosAdmin'

type Filter = QuoteStatus | 'TODAS'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'PENDIENTE', label: 'Sin responder' },
  { value: 'RESPONDIDA', label: 'Respondidas' },
  { value: 'CERRADA', label: 'Cerradas' },
  { value: 'TODAS', label: 'Todas' },
]

export function QuotesPage() {
  const [filter, setFilter] = useState<Filter>('PENDIENTE')
  const [texto, setTexto] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [page, setPage] = useState(0)
  const [bajando, setBajando] = useState(false)
  const [errorPlanilla, setErrorPlanilla] = useState<string | null>(null)

  // La búsqueda espera a que se deje de escribir: sin esto sale una consulta
  // por tecla.
  const [textoBuscado, setTextoBuscado] = useState('')
  useEffect(() => {
    const id = setTimeout(() => {
      setTextoBuscado(texto)
      setPage(0)
    }, 350)
    return () => clearTimeout(id)
  }, [texto])

  const filtros: FiltrosDeCotizaciones = {
    estado: filter,
    texto: textoBuscado,
    desde: desde || undefined,
    hasta: hasta || undefined,
  }

  const { data, loading, error, reload } = useAdminData<Page<AdminQuote>>(
    () => adminApi.quotes(filtros, page),
    [filter, page, textoBuscado, desde, hasta],
  )

  function changeFilter(next: Filter) {
    setFilter(next)
    setPage(0)
  }

  function limpiar() {
    setTexto('')
    setDesde('')
    setHasta('')
    setFilter('TODAS')
    setPage(0)
  }

  async function bajarPlanilla() {
    setBajando(true)
    setErrorPlanilla(null)
    try {
      await adminApi.descargarPlanilla(filtros)
    } catch (e) {
      setErrorPlanilla(e instanceof ApiError ? e.message : 'No pudimos armar la planilla.')
    } finally {
      setBajando(false)
    }
  }

  const hayBusqueda = Boolean(textoBuscado || desde || hasta || filter !== 'TODAS')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Cotizaciones</h1>
          <p className="mt-1 text-ink-500">
            Cada pedido que entra por el sitio. Respondé por WhatsApp y marcá en qué punto está.
          </p>
        </div>

        <Button variant="secondary" onClick={bajarPlanilla} disabled={bajando}>
          <span className="inline-flex items-center gap-2">
            <IconoDescargar className="size-4" />
            {bajando ? 'Armando...' : 'Bajar planilla'}
          </span>
        </Button>
      </div>

      <Card className="space-y-4">
        <label className="block">
          <span className="sr-only">Buscar</span>
          <span className="flex items-center gap-2 rounded-xl border border-ink-300 px-3 focus-within:border-ink-900">
            <IconoBuscar className="size-4 shrink-0 text-ink-500" />
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre, empresa, teléfono, mail o producto"
              className="w-full py-2.5 text-sm focus:outline-none"
            />
          </span>
        </label>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => changeFilter(option.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter === option.value
                    ? 'bg-ink-900 text-white'
                    : 'border border-ink-300 text-ink-500 hover:border-ink-900 hover:text-ink-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <label className="text-xs text-ink-500">
              Desde
              <input
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => {
                  setDesde(e.target.value)
                  setPage(0)
                }}
                className="mt-1 block rounded-lg border border-ink-300 px-2 py-1.5 text-sm focus:border-ink-900 focus:outline-none"
              />
            </label>
            <label className="text-xs text-ink-500">
              Hasta
              <input
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => {
                  setHasta(e.target.value)
                  setPage(0)
                }}
                className="mt-1 block rounded-lg border border-ink-300 px-2 py-1.5 text-sm focus:border-ink-900 focus:outline-none"
              />
            </label>
          </div>

          {hayBusqueda && (
            <button
              type="button"
              onClick={limpiar}
              className="py-1.5 text-sm font-medium text-brand-600 underline transition hover:text-brand-700"
            >
              Limpiar
            </button>
          )}

          {data && (
            <span className="ml-auto text-sm text-ink-500">
              {data.totalElements} {data.totalElements === 1 ? 'cotización' : 'cotizaciones'}
            </span>
          )}
        </div>
      </Card>

      {errorPlanilla && <Banner kind="error">{errorPlanilla}</Banner>}

      {loading && <Spinner label="Cargando cotizaciones" />}
      {error && <Banner kind="error">{error}</Banner>}

      {data && data.content.length === 0 && (
        <EmptyState>
          {textoBuscado || desde || hasta
            ? 'Ninguna cotización coincide con la búsqueda.'
            : filter === 'PENDIENTE'
              ? 'No hay cotizaciones sin responder. Buen trabajo.'
              : 'No hay cotizaciones en este estado.'}
        </EmptyState>
      )}

      {data && data.content.length > 0 && (
        <>
          <ul className="space-y-4">
            {data.content.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onChanged={reload} />
            ))}
          </ul>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
              >
                Anterior
              </Button>
              <span className="text-sm text-ink-500">
                Página {data.number + 1} de {data.totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function QuoteCard({ quote, onChanged }: { quote: AdminQuote; onChanged: () => void }) {
  const [notes, setNotes] = useState(quote.internalNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function changeStatus(status: QuoteStatus) {
    setSaving(true)
    setError(null)
    try {
      await adminApi.updateQuote(quote.id, status, notes)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos guardar el cambio.')
      setSaving(false)
    }
  }

  /**
   * Borrar es para las pruebas y para el spam. Lo habitual es cerrar la
   * cotización, que la deja fuera de la bandeja pero la conserva: el historial
   * de quién pidió qué vale, y de acá no se vuelve.
   */
  async function borrar() {
    const seguro = window.confirm(
      `¿Borrar la cotización de ${quote.fullName}? Se borran también sus archivos adjuntos. ` +
        'No se puede deshacer.',
    )
    if (!seguro) return

    setSaving(true)
    setError(null)
    try {
      await adminApi.deleteQuote(quote.id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos borrarla.')
      setSaving(false)
    }
  }


  return (
    <li>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">{quote.fullName}</h2>
            <p className="text-sm text-ink-500">
              {quote.company && <>{quote.company} · </>}
              {quote.phone}
              {quote.email && <> · {quote.email}</>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuoteStatusBadge status={quote.status} />
            <time className="text-xs text-ink-500" dateTime={quote.createdAt}>
              {new Date(quote.createdAt).toLocaleString('es-AR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
        </div>

        <ol className="mt-4 space-y-3">
          {quote.items.map((item, i) => (
            <li key={i} className="rounded-lg bg-ink-50 p-3">
              <p className="font-medium text-ink-900">
                {quote.items.length > 1 && <span className="text-ink-500">{i + 1}. </span>}
                {item.productName ?? 'Producto a definir'}
              </p>
              <dl className="mt-1 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {(
                  [
                    ['Cantidad', item.quantity],
                    ['Formato', item.format],
                    ['Material', item.material],
                    ['Terminaciones', item.finishings],
                    ['Detalle', item.notes],
                  ] as [string, string | null][]
                )
                  .filter(([, valor]) => valor)
                  .map(([etiqueta, valor]) => (
                    <div key={etiqueta} className="flex gap-2">
                      <dt className="text-ink-500">{etiqueta}:</dt>
                      <dd className="text-ink-900">{valor}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          ))}
        </ol>

        {quote.attachments.length > 0 && <Adjuntos adjuntos={quote.attachments} />}

        {quote.message && (
          <p className="mt-4 rounded-lg bg-ink-50 p-4 text-sm text-ink-700">{quote.message}</p>
        )}

        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-900">
              Notas internas
              <span className="ml-2 font-normal text-ink-500">(no las ve el cliente)</span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Presupuesto enviado, quedó en confirmar la semana que viene..."
              className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <div className="mt-3">
            <Banner kind="error">{error}</Banner>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {quote.whatsappUrl && (
            <a
              href={quote.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Responder por WhatsApp
            </a>
          )}
          {quote.status !== 'RESPONDIDA' && (
            <Button variant="secondary" disabled={saving} onClick={() => changeStatus('RESPONDIDA')}>
              Marcar como respondida
            </Button>
          )}
          {quote.status !== 'CERRADA' && (
            <Button variant="ghost" disabled={saving} onClick={() => changeStatus('CERRADA')}>
              Cerrar
            </Button>
          )}
          {quote.status !== 'PENDIENTE' && (
            <Button variant="ghost" disabled={saving} onClick={() => changeStatus('PENDIENTE')}>
              Reabrir
            </Button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={borrar}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-ink-500 transition hover:bg-brand-500/10 hover:text-brand-700 disabled:opacity-50"
          >
            Borrar
          </button>
        </div>
      </Card>
    </li>
  )
}

/**
 * Los adjuntos no son públicos: se piden con el token de la sesión y se abren
 * desde memoria. Por eso son botones y no enlaces directos.
 */
function Adjuntos({ adjuntos }: { adjuntos: AdminQuoteAttachment[] }) {
  const [abriendo, setAbriendo] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function abrir(adjunto: AdminQuoteAttachment) {
    setAbriendo(adjunto.id)
    setError(null)
    try {
      const url = await adminApi.abrirAdjunto(adjunto.downloadPath)
      window.open(url, '_blank', 'noopener')
      // El objeto se libera después: revocarlo ya rompería la pestaña recién abierta.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('No pudimos abrir el archivo.')
    } finally {
      setAbriendo(null)
    }
  }

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-ink-900">
        Archivos del cliente
        <span className="ml-2 font-normal text-ink-500">({adjuntos.length})</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {adjuntos.map((adjunto) => (
          <li key={adjunto.id}>
            <button
              type="button"
              onClick={() => abrir(adjunto)}
              disabled={abriendo === adjunto.id}
              className="rounded-lg border border-ink-300 px-3 py-2 text-sm text-ink-900 transition hover:border-ink-900 disabled:opacity-50"
            >
              {abriendo === adjunto.id ? 'Abriendo...' : adjunto.filename}
              {adjunto.sizeBytes != null && (
                <span className="ml-2 text-xs text-ink-500">
                  {Math.max(1, Math.round(adjunto.sizeBytes / 1024))} KB
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand-600">
          {error}
        </p>
      )}
    </div>
  )
}
