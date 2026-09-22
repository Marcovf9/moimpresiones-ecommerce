import { Link } from 'react-router-dom'
import { adminApi } from '../adminClient'
import type { Dashboard, DashboardTask } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { Banner, Card, EmptyState, SectionTitle, Spinner } from '../components/AdminUI'
import { QuoteStatusBadge } from '../components/QuoteStatusBadge'

export function DashboardPage() {
  const { data, loading, error } = useAdminData<Dashboard>(() => adminApi.dashboard(), [])

  if (loading) return <Spinner label="Cargando el panel" />
  if (error) return <Banner kind="error">{error}</Banner>
  if (!data) return null

  const { kpis, tareasPendientes, cotizacionesPorSemana, productosMasPedidos, ultimasCotizaciones } =
    data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Inicio</h1>
        <p className="mt-1 text-ink-500">Cómo viene el mes y qué conviene resolver.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Cotizaciones este mes"
          value={kpis.cotizacionesEsteMes}
          detail={`${kpis.cotizacionesTotales} en total`}
        />
        <Kpi
          label="Sin responder"
          value={kpis.cotizacionesPendientes}
          detail={kpis.cotizacionesPendientes > 0 ? 'Hay clientes esperando' : 'Todo al día'}
          alert={kpis.cotizacionesPendientes > 0}
          to="/admin/cotizaciones"
        />
        <Kpi
          label="Productos publicados"
          value={kpis.productosPublicados}
          detail={
            kpis.productosDespublicados > 0
              ? `${kpis.productosDespublicados} despublicados`
              : 'Ninguno oculto'
          }
          to="/admin/productos"
        />
        <Kpi label="Terminaciones" value={kpis.terminaciones} to="/admin/terminaciones" />
      </section>

      <section>
        <SectionTitle>Qué mejorar</SectionTitle>
        {tareasPendientes.length === 0 ? (
          <EmptyState>
            No hay nada pendiente. El catálogo está completo y las cotizaciones, respondidas.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {tareasPendientes.map((tarea) => (
              <TaskRow key={tarea.codigo} tarea={tarea} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Cotizaciones por semana</SectionTitle>
          <WeeklyChart data={cotizacionesPorSemana} />
        </Card>

        <Card>
          <SectionTitle>Lo que más te piden</SectionTitle>
          {productosMasPedidos.length === 0 ? (
            <p className="text-sm text-ink-500">
              Todavía no hay cotizaciones asociadas a un producto del catálogo.
            </p>
          ) : (
            <ol className="space-y-3">
              {productosMasPedidos.map((item, index) => (
                <li key={item.slug} className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-medium text-ink-700">
                    {index + 1}
                  </span>
                  <Link
                    to={`/admin/productos/${item.slug}`}
                    className="flex-1 truncate text-ink-900 transition hover:text-brand-600"
                  >
                    {item.nombre}
                  </Link>
                  <span className="text-sm font-medium text-ink-500">
                    {item.cantidad} {item.cantidad === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle
          action={
            <Link
              to="/admin/cotizaciones"
              className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
            >
              Ver todas
            </Link>
          }
        >
          Últimas cotizaciones
        </SectionTitle>
        {ultimasCotizaciones.length === 0 ? (
          <p className="text-sm text-ink-500">Todavía no llegó ninguna consulta.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {ultimasCotizaciones.map((quote) => (
              <li key={quote.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-medium text-ink-900">{quote.nombre}</span>
                {quote.empresa && <span className="text-sm text-ink-500">{quote.empresa}</span>}
                {quote.producto && (
                  <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-700">
                    {quote.producto}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-3">
                  <time className="text-xs text-ink-500" dateTime={quote.fecha}>
                    {formatDate(quote.fecha)}
                  </time>
                  <QuoteStatusBadge status={quote.estado} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Kpi({
  label,
  value,
  detail,
  alert = false,
  to,
}: {
  label: string
  value: number
  detail?: string
  alert?: boolean
  to?: string
}) {
  const content = (
    <div
      className={`h-full rounded-xl border bg-white p-5 transition ${
        alert ? 'border-brand-500' : 'border-ink-100'
      } ${to ? 'hover:border-ink-900' : ''}`}
    >
      <p className="text-sm text-ink-500">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-semibold ${
          alert ? 'text-brand-600' : 'text-ink-900'
        }`}
      >
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-ink-500">{detail}</p>}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

const SEVERITY_STYLES: Record<DashboardTask['severidad'], string> = {
  alta: 'border-l-brand-500',
  media: 'border-l-amber-500',
  baja: 'border-l-ink-300',
}

function TaskRow({ tarea }: { tarea: DashboardTask }) {
  return (
    <li className={`rounded-xl border border-ink-100 border-l-4 bg-white p-5 ${SEVERITY_STYLES[tarea.severidad]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-ink-900">
            {tarea.titulo}
            <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-700">
              {tarea.cantidad}
            </span>
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">{tarea.detalle}</p>
          {tarea.elementos.length > 0 && (
            <p className="mt-2 text-xs text-ink-500">
              {tarea.elementos.map((e) => e.nombre).join(' · ')}
              {tarea.cantidad > tarea.elementos.length && ` y ${tarea.cantidad - tarea.elementos.length} más`}
            </p>
          )}
        </div>
        <Link
          to={tarea.enlace}
          className="shrink-0 rounded-lg border border-ink-300 px-3 py-1.5 text-sm font-medium text-ink-900 transition hover:border-ink-900"
        >
          Resolver
        </Link>
      </div>
    </li>
  )
}

/** Grafico de barras sin dependencias: son ocho valores, no hace falta mas. */
function WeeklyChart({ data }: { data: { semana: string; cantidad: number }[] }) {
  const max = Math.max(...data.map((d) => d.cantidad), 1)
  const total = data.reduce((sum, d) => sum + d.cantidad, 0)

  if (total === 0) {
    return <p className="text-sm text-ink-500">Sin cotizaciones en las últimas 8 semanas.</p>
  }

  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {data.map((point) => (
          <div key={point.semana} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-700">{point.cantidad || ''}</span>
            <div
              className="w-full rounded-t bg-ink-900"
              style={{ height: `${Math.max((point.cantidad / max) * 100, 2)}%` }}
              role="img"
              aria-label={`Semana del ${formatDate(point.semana)}: ${point.cantidad} cotizaciones`}
            />
            <span className="text-[10px] text-ink-500">{formatShortDate(point.semana)}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-500">
        {total} {total === 1 ? 'cotización' : 'cotizaciones'} en las últimas 8 semanas.
      </p>
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}
