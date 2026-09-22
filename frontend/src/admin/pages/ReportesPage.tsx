import { useMemo, useState } from 'react'
import { adminApi } from '../adminClient'
import type { FilaReporte, Reporte } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { Banner, Card, EmptyState, SectionTitle, Spinner } from '../components/AdminUI'

/** Atajos frecuentes; el rango también se puede fijar a mano. */
const ATAJOS = [
  { label: 'Últimos 7 días', dias: 7 },
  { label: 'Últimos 30 días', dias: 30 },
  { label: 'Últimos 90 días', dias: 90 },
  { label: 'Último año', dias: 365 },
]

function aTexto(fecha: Date) {
  return fecha.toISOString().slice(0, 10)
}

function haceDias(dias: number) {
  const d = new Date()
  d.setDate(d.getDate() - (dias - 1))
  return aTexto(d)
}

export function ReportesPage() {
  const [desde, setDesde] = useState(() => haceDias(30))
  const [hasta, setHasta] = useState(() => aTexto(new Date()))

  const { data, loading, error } = useAdminData<Reporte>(
    () => adminApi.reporte(desde, hasta),
    [desde, hasta],
  )

  function aplicarAtajo(dias: number) {
    setDesde(haceDias(dias))
    setHasta(aTexto(new Date()))
  }

  const atajoActivo = useMemo(
    () => ATAJOS.find((a) => haceDias(a.dias) === desde && aTexto(new Date()) === hasta)?.dias,
    [desde, hasta],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Reportes</h1>
        <p className="mt-1 text-ink-500">
          Cuánta gente entra al sitio y qué mira. Sin cookies: no se guarda ningún dato personal.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2">
            {ATAJOS.map((atajo) => (
              <button
                key={atajo.dias}
                type="button"
                onClick={() => aplicarAtajo(atajo.dias)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  atajoActivo === atajo.dias
                    ? 'bg-ink-900 text-white'
                    : 'border border-ink-300 text-ink-500 hover:border-ink-900 hover:text-ink-900'
                }`}
              >
                {atajo.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-500">Desde</span>
              <input
                type="date"
                value={desde}
                max={hasta}
                onChange={(e) => setDesde(e.target.value)}
                className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm focus:border-ink-900 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-500">Hasta</span>
              <input
                type="date"
                value={hasta}
                min={desde}
                max={aTexto(new Date())}
                onChange={(e) => setHasta(e.target.value)}
                className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm focus:border-ink-900 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </Card>

      {loading && <Spinner label="Calculando" />}
      {error && <Banner kind="error">{error}</Banner>}

      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <Kpi
              label="Visitas"
              valor={data.resumen.visitas}
              previo={data.resumen.visitasPeriodoPrevio}
            />
            <Kpi
              label="Personas distintas"
              valor={data.resumen.visitantes}
              previo={data.resumen.visitantesPeriodoPrevio}
            />
            <Kpi label="Cotizaciones recibidas" valor={data.resumen.cotizaciones} />
          </section>

          <Card>
            <SectionTitle>Visitas por día</SectionTitle>
            <GraficoDiario puntos={data.porDia} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle>Productos más vistos</SectionTitle>
              <Ranking filas={data.productos} vacio="Todavía nadie abrió una ficha de producto." />
            </Card>
            <Card>
              <SectionTitle>Páginas más visitadas</SectionTitle>
              <Ranking filas={data.paginas} vacio="Sin visitas en este período." />
            </Card>
          </div>

          <Card>
            <SectionTitle>De dónde llegan</SectionTitle>
            <Ranking
              filas={data.origenes}
              vacio="Nadie llegó desde otro sitio todavía. Las visitas directas o desde WhatsApp no dejan rastro de origen."
            />
          </Card>
        </>
      )}
    </div>
  )
}

function Kpi({ label, valor, previo }: { label: string; valor: number; previo?: number }) {
  // Sin período previo con datos, un porcentaje sería inventado.
  const variacion =
    previo !== undefined && previo > 0 ? Math.round(((valor - previo) / previo) * 100) : null

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{valor}</p>
      {variacion !== null && (
        <p
          className={`mt-1 text-xs ${
            variacion > 0 ? 'text-emerald-700' : variacion < 0 ? 'text-brand-600' : 'text-ink-500'
          }`}
        >
          {variacion > 0 ? '▲' : variacion < 0 ? '▼' : '='} {Math.abs(variacion)}% vs. período
          anterior
        </p>
      )}
      {variacion === null && previo !== undefined && (
        <p className="mt-1 text-xs text-ink-500">Sin datos del período anterior</p>
      )}
    </div>
  )
}

function GraficoDiario({ puntos }: { puntos: Reporte['porDia'] }) {
  const max = Math.max(...puntos.map((p) => p.visitas), 1)
  const total = puntos.reduce((s, p) => s + p.visitas, 0)

  if (total === 0) {
    return <p className="text-sm text-ink-500">Sin visitas registradas en este período.</p>
  }

  // Con muchos días, las etiquetas no entran: se muestran salteadas.
  const cadaCuantas = Math.ceil(puntos.length / 12)

  return (
    <div className="flex h-48 items-end gap-px">
      {puntos.map((punto, i) => (
        <div key={punto.dia} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-ink-900 transition hover:bg-brand-500"
            style={{ height: `${Math.max((punto.visitas / max) * 100, punto.visitas > 0 ? 3 : 1)}%` }}
            title={`${punto.dia}: ${punto.visitas} ${punto.visitas === 1 ? 'visita' : 'visitas'} de ${punto.visitantes} ${punto.visitantes === 1 ? 'persona' : 'personas'}`}
          />
          <span className="h-4 text-[9px] text-ink-500">
            {i % cadaCuantas === 0 ? punto.dia.slice(8) + '/' + punto.dia.slice(5, 7) : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function Ranking({ filas, vacio }: { filas: FilaReporte[]; vacio: string }) {
  if (filas.length === 0) return <EmptyState>{vacio}</EmptyState>

  const max = Math.max(...filas.map((f) => f.visitas), 1)

  return (
    <ol className="space-y-2">
      {filas.map((fila) => (
        <li key={fila.clave}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-ink-900">{fila.etiqueta}</span>
            <span className="shrink-0 text-ink-500">
              {fila.visitas} {fila.visitas === 1 ? 'visita' : 'visitas'}
              <span className="ml-2 text-xs">
                ({fila.visitantes} {fila.visitantes === 1 ? 'persona' : 'personas'})
              </span>
            </span>
          </div>
          {/* La barra deja ver la diferencia de un vistazo, sin leer los números. */}
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-ink-900" style={{ width: `${(fila.visitas / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
