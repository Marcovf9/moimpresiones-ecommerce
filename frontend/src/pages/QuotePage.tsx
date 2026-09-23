import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import type { Category, QuoteAttachmentValues } from '../api/types'
import { useApi } from '../hooks/useApi'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { imagenOptimizada } from '../api/imagenes'
import { itemVacio, usePresupuesto, MAX_ITEMS } from '../hooks/usePresupuesto'
import { PageHeader } from '../components/PageChrome'
import { WhatsAppIcon } from '../components/Icons'
import type { EstadoDeConfirmacion } from './ConfirmacionPage'

interface Contacto {
  fullName: string
  phone: string
  email: string
  company: string
  message: string
}

const CONTACTO_VACIO: Contacto = { fullName: '', phone: '', email: '', company: '', message: '' }

type Estado =
  | { kind: 'idle' }
  | { kind: 'sending' }

export function QuotePage() {
  const [searchParams] = useSearchParams()
  const { items, agregar, actualizar, quitar, vaciar } = usePresupuesto()
  const { data: categories } = useApi<Category[]>(() => api.categories(), [])

  const [contacto, setContacto] = useState<Contacto>(CONTACTO_VACIO)
  const [adjuntos, setAdjuntos] = useState<QuoteAttachmentValues[]>([])
  const [estado, setEstado] = useState<Estado>({ kind: 'idle' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const navegar = useNavigate()

  usePageMeta(metaDe('/cotiza'))

  // Al llegar desde una ficha con ?producto=slug, ese producto entra solo.
  const productoDeLaUrl = searchParams.get('producto')
  const yaAgregadoDeLaUrl = useRef(false)
  useEffect(() => {
    if (!productoDeLaUrl || !categories || yaAgregadoDeLaUrl.current) return
    yaAgregadoDeLaUrl.current = true
    const producto = categories.flatMap((c) => c.products).find((p) => p.slug === productoDeLaUrl)
    if (producto) {
      agregar(
        itemVacio({
          productSlug: producto.slug,
          productName: producto.name,
          coverImageUrl: producto.coverImageUrl,
        }),
      )
    }
  }, [productoDeLaUrl, categories, agregar])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setEstado({ kind: 'sending' })
    setFieldErrors({})
    setErrorGeneral(null)

    // La pestaña se abre acá, dentro del toque del visitante, y recién se le
    // pone la dirección cuando el pedido quedó guardado: si se abriera después
    // de esperar al servidor, el navegador la bloquearía por emergente.
    const ventanaDeWhatsApp = window.open('', '_blank')

    try {
      const resultado = await api.createQuote({
        ...contacto,
        items: items.map((item) => ({
          productSlug: item.productSlug,
          productName: item.productName,
          quantity: item.quantity,
          format: item.format,
          material: item.material,
          finishings: item.finishings,
          notes: item.notes,
        })),
        attachments: adjuntos,
      })
      // Recién con el pedido guardado se limpia la lista: si falla, no se pierde.
      vaciar()

      // Con pestaña propia, WhatsApp se abre al lado y el visitante se queda en
      // la confirmación. Sin ella —hay navegadores que bloquean la pestaña
      // igual— la abre la pantalla de confirmación una vez montada: primero
      // tiene que cargar esa pantalla, que es la que cuenta como conversión, y
      // recién después irse a WhatsApp.
      const seAbrioAlLado = Boolean(ventanaDeWhatsApp) && Boolean(resultado.whatsappUrl)
      if (seAbrioAlLado) {
        ventanaDeWhatsApp!.location.href = resultado.whatsappUrl!
      } else {
        ventanaDeWhatsApp?.close()
      }

      navegar('/cotizacion-enviada', {
        replace: true,
        state: {
          whatsappUrl: resultado.whatsappUrl,
          abrirWhatsApp: !seAbrioAlLado && Boolean(resultado.whatsappUrl),
        } satisfies EstadoDeConfirmacion,
      })
    } catch (error) {
      ventanaDeWhatsApp?.close()
      setEstado({ kind: 'idle' })
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors)
        if (Object.keys(error.fieldErrors).length === 0) setErrorGeneral(error.message)
      } else {
        setErrorGeneral('No pudimos enviar tu pedido. Probá de nuevo.')
      }
    }
  }

  const sinProductos = items.length === 0

  return (
    <div className="pt-20 pb-14 sm:pt-24 sm:pb-20">
      <PageHeader
        eyebrow="Presupuestos"
        title="Cotizá tu proyecto"
        description="Agregá todo lo que necesites y te respondemos con un presupuesto a medida. Al enviar se abre WhatsApp con tu consulta ya escrita."
      />

      <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-3xl sm:mt-10 space-y-6 px-6">
        <section className="rounded-2xl border border-white/10 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Tu pedido
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-ink-500">
                  {items.length} {items.length === 1 ? 'producto' : 'productos'}
                </span>
              )}
            </h2>
            {items.length < MAX_ITEMS && (
              <div className="flex flex-wrap gap-2">
                {/* Elegir del catálogo es el camino habitual: así el pedido
                    llega con el nombre exacto del producto. Describirlo a mano
                    queda como salida para lo que no está en el catálogo. */}
                <Link
                  to="/productos?elegir=1"
                  className="rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
                >
                  Agregar producto
                </Link>
                <button
                  type="button"
                  onClick={() => agregar(itemVacio())}
                  className="rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-ink-900"
                >
                  Describirlo yo
                </button>
              </div>
            )}
          </div>

          {fieldErrors.items && (
            <p role="alert" className="mt-3 text-sm text-brand-600">
              {fieldErrors.items}
            </p>
          )}

          {sinProductos ? (
            <div className="mt-4 rounded-xl border border-dashed border-ink-300 px-6 py-8 text-center">
              <p className="text-ink-500">Todavía no agregaste nada.</p>
              <Link
                to="/productos?elegir=1"
                className="mt-4 inline-block rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-700"
              >
                Agregar producto
              </Link>
              <p className="mt-4 text-sm text-ink-500">
                Elegís del catálogo y volvés acá con todo cargado. Si lo que necesitás no está,
                describilo con tus palabras.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {items.map((item, indice) => (
                <li key={indice} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex items-start gap-3">
                    {item.coverImageUrl && (
                      <img
                        {...imagenOptimizada(item.coverImageUrl, 120)}
                        alt=""
                        className="size-16 shrink-0 rounded-lg bg-ink-50 object-contain"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {item.productSlug ? (
                        <p className="font-medium text-ink-900">{item.productName}</p>
                      ) : (
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => actualizar(indice, { productName: e.target.value })}
                          placeholder="¿Qué necesitás imprimir?"
                          aria-label={`Producto ${indice + 1}`}
                          className="w-full rounded-lg border border-ink-300 px-3 py-2 font-medium focus:border-ink-900 focus:outline-none"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(indice)}
                      aria-label={`Quitar ${item.productName || 'producto ' + (indice + 1)}`}
                      className="-m-2 grid size-11 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-brand-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <CampoItem
                      label="Cantidad"
                      value={item.quantity}
                      placeholder="Ej: 500 unidades"
                      onChange={(v) => actualizar(indice, { quantity: v })}
                    />
                    <CampoItem
                      label="Formato"
                      value={item.format}
                      placeholder="Ej: A4"
                      onChange={(v) => actualizar(indice, { format: v })}
                    />
                    <CampoItem
                      label="Material"
                      value={item.material}
                      placeholder="Ej: Cartulina ilustración"
                      onChange={(v) => actualizar(indice, { material: v })}
                    />
                    <CampoItem
                      label="Terminaciones"
                      value={item.finishings}
                      placeholder="Ej: OPP mate, UV sectorizado"
                      onChange={(v) => actualizar(indice, { finishings: v })}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Adjuntos adjuntos={adjuntos} onCambio={setAdjuntos} />

        <section className="rounded-2xl border border-white/10 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-ink-900">Tus datos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo
              label="Nombre y apellido"
              required
              value={contacto.fullName}
              error={fieldErrors.fullName}
              onChange={(v) => setContacto({ ...contacto, fullName: v })}
            />
            <Campo
              label="Teléfono"
              required
              type="tel"
              value={contacto.phone}
              error={fieldErrors.phone}
              onChange={(v) => setContacto({ ...contacto, phone: v })}
            />
            <Campo
              label="Email"
              type="email"
              value={contacto.email}
              error={fieldErrors.email}
              onChange={(v) => setContacto({ ...contacto, email: v })}
            />
            <Campo
              label="Empresa"
              value={contacto.company}
              error={fieldErrors.company}
              onChange={(v) => setContacto({ ...contacto, company: v })}
            />
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-ink-900">
              Comentarios <span className="font-normal text-ink-500">(opcional)</span>
            </span>
            <textarea
              value={contacto.message}
              onChange={(e) => setContacto({ ...contacto, message: e.target.value })}
              rows={3}
              placeholder="Fechas, referencias, lo que nos sirva saber."
              className="w-full rounded-lg border border-ink-300 px-3 py-2 focus:border-ink-900 focus:outline-none"
            />
          </label>
        </section>

        {errorGeneral && (
          <p role="alert" className="rounded-lg bg-white px-4 py-3 text-sm text-brand-600">
            {errorGeneral}
          </p>
        )}

        {/* Un solo paso: guarda el pedido y abre WhatsApp con el mensaje
            escrito. Antes había una pantalla en el medio que había que tocar
            otra vez, y ahí se perdía gente que ya había completado todo. */}
        <button
          type="submit"
          disabled={estado.kind === 'sending' || sinProductos}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <WhatsAppIcon className="size-5" />
          {estado.kind === 'sending' ? 'Enviando...' : 'Enviar por WhatsApp'}
        </button>
        <p className="text-center text-sm text-ink-300">
          {sinProductos
            ? 'Agregá al menos un producto para poder enviar.'
            : 'Se abre WhatsApp con tu pedido ya escrito. Nos queda registrado igual.'}
        </p>
      </form>
    </div>
  )
}

function CampoItem({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (valor: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-ink-900 focus:outline-none"
      />
    </label>
  )
}

function Campo({
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (valor: string) => void
  error?: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-lg border px-3 py-2 focus:outline-none ${
          error ? 'border-brand-500' : 'border-ink-300 focus:border-ink-900'
        }`}
      />
      {error && (
        <span role="alert" className="mt-1 block text-sm text-brand-600">
          {error}
        </span>
      )}
    </label>
  )
}

const MAX_ADJUNTOS = 5

function Adjuntos({
  adjuntos,
  onCambio,
}: {
  adjuntos: QuoteAttachmentValues[]
  onCambio: (adjuntos: QuoteAttachmentValues[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function alElegir(files: FileList | null) {
    if (!files || files.length === 0) return
    setSubiendo(true)
    setError(null)
    try {
      const nuevos: QuoteAttachmentValues[] = []
      for (const file of Array.from(files).slice(0, MAX_ADJUNTOS - adjuntos.length)) {
        nuevos.push(await api.subirAdjunto(file))
      }
      onCambio([...adjuntos, ...nuevos])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos subir el archivo.')
    } finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white p-6">
      <h2 className="font-display text-xl font-semibold text-ink-900">
        Archivos <span className="text-sm font-normal text-ink-500">(opcional)</span>
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        Si ya tenés el diseño o un boceto, sumalo y ganamos una vuelta de mensajes.
      </p>

      {adjuntos.length > 0 && (
        <ul className="mt-4 space-y-2">
          {adjuntos.map((adjunto, i) => (
            <li
              key={adjunto.storageKey}
              className="flex items-center gap-3 rounded-lg bg-ink-50 px-3 py-2 text-sm"
            >
              <span className="min-w-0 flex-1 truncate text-ink-900">{adjunto.filename}</span>
              {adjunto.sizeBytes != null && (
                <span className="shrink-0 text-xs text-ink-500">
                  {Math.max(1, Math.round(adjunto.sizeBytes / 1024))} KB
                </span>
              )}
              <button
                type="button"
                onClick={() => onCambio(adjuntos.filter((_, j) => j !== i))}
                aria-label={`Quitar ${adjunto.filename}`}
                className="-m-2 grid size-11 place-items-center rounded-lg text-ink-500 transition hover:text-brand-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-brand-600">
          {error}
        </p>
      )}

      {adjuntos.length < MAX_ADJUNTOS && (
        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => alElegir(e.target.files)}
            className="hidden"
            id="adjuntos-cotizacion"
          />
          <button
            type="button"
            disabled={subiendo}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-900 transition hover:border-ink-900 disabled:opacity-50"
          >
            {subiendo ? 'Subiendo...' : 'Adjuntar archivo'}
          </button>
          <span className="ml-3 text-xs text-ink-500">
            PDF, JPG o PNG. Hasta {MAX_ADJUNTOS} archivos.
          </span>
        </div>
      )}
    </section>
  )
}

