import { useState } from 'react'
import { ApiError } from '../../api/client'
import { adminApi } from '../adminClient'
import type { AdminQuote, AdminQuoteAttachment, Page, QuoteStatus } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { Banner, Button, Card, EmptyState, Spinner } from '../components/AdminUI'
import { QuoteStatusBadge } from '../components/QuoteStatusBadge'

type Filter = QuoteStatus | 'TODAS'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'PENDIENTE', label: 'Sin responder' },
  { value: 'RESPONDIDA', label: 'Respondidas' },
  { value: 'CERRADA', label: 'Cerradas' },
  { value: 'TODAS', label: 'Todas' },
]

export function QuotesPage() {
  const [filter, setFilter] = useState<Filter>('PENDIENTE')
  const [page, setPage] = useState(0)
  const { data, loading, error, reload } = useAdminData<Page<AdminQuote>>(
    () => adminApi.quotes(filter, page),
    [filter, page],
  )

  function changeFilter(next: Filter) {
    setFilter(next)
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Cotizaciones</h1>
        <p className="mt-1 text-ink-500">
          Cada pedido que entra por el sitio. Respondé por WhatsApp y marcá en qué punto está.
        </p>
      </div>

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

      {loading && <Spinner label="Cargando cotizaciones" />}
      {error && <Banner kind="error">{error}</Banner>}

      {data && data.content.length === 0 && (
        <EmptyState>
          {filter === 'PENDIENTE'
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
