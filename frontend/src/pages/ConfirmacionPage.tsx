import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { WhatsAppIcon } from '../components/Icons'
import { BarraCMYK } from '../components/BarraCMYK'
import { useContactInfo } from '../hooks/useContactInfo'

/** Lo que deja el formulario al enviar, para poder abrir o reabrir WhatsApp. */
export interface EstadoDeConfirmacion {
  whatsappUrl?: string | null
  /** El formulario no pudo abrir la pestaña de WhatsApp: la abre esta pantalla. */
  abrirWhatsApp?: boolean
}

/**
 * Pantalla de "cotización enviada", con dirección propia.
 *
 * <p>Tiene su propia dirección porque es la señal de que alguien llegó hasta
 * el final: Google Ads cuenta la conversión cuando se carga esta pantalla, y
 * mezclada dentro del formulario no había forma de distinguir a quien lo
 * completó de quien solo lo miró.
 *
 * <p>No se indexa: no es contenido del sitio y aparecer en una búsqueda sin
 * haber cotizado nada no tendría sentido.
 *
 * <p>Se llega acá enviando el formulario, y ahí viene el enlace de WhatsApp
 * por el estado de la navegación. Quien entre de otra forma —recargar, volver
 * al historial, escribir la dirección— ve la misma pantalla sin ese botón, con
 * el WhatsApp del local a mano.
 */
export function ConfirmacionPage() {
  const { state } = useLocation() as { state: EstadoDeConfirmacion | null }
  const contact = useContactInfo()

  usePageMeta(metaDe('/cotizacion-enviada'))

  const whatsappDelPedido = state?.whatsappUrl ?? null

  // Cuando el navegador bloqueó la pestaña, WhatsApp se abre desde acá y no
  // desde el formulario: así esta pantalla llega a cargarse —es la que mide
  // que alguien terminó de cotizar— antes de que el visitante se vaya.
  useEffect(() => {
    if (!state?.abrirWhatsApp || !whatsappDelPedido) return
    const id = setTimeout(() => window.location.assign(whatsappDelPedido), 800)
    return () => clearTimeout(id)
  }, [state?.abrirWhatsApp, whatsappDelPedido])

  return (
    <div className="grid min-h-[80dvh] place-items-center px-6 py-24">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-8 text-center sm:p-10">
        <BarraCMYK className="mx-auto max-w-24" />

        <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          ¡Recibimos tu pedido!
        </h1>
        <p className="mt-3 text-ink-700">
          Ya quedó registrado. Te vamos a responder con el presupuesto a la brevedad, en el horario
          de atención: lunes a viernes de 8 a 16 h.
        </p>

        {whatsappDelPedido ? (
          <>
            <p className="mt-6 text-sm text-ink-500">
              Si WhatsApp no se abrió solo, tocá acá y mandanos el mensaje: se abre con todo lo que
              cargaste ya escrito.
            </p>
            <a
              href={whatsappDelPedido}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-medium text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="size-5" />
              Abrir WhatsApp de nuevo
            </a>
          </>
        ) : (
          contact?.whatsappUrl && (
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-medium text-white transition hover:brightness-95"
            >
              <WhatsAppIcon className="size-5" />
              Escribinos por WhatsApp
            </a>
          )
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/productos" className="font-medium text-brand-600 underline hover:text-brand-700">
            Seguir viendo productos
          </Link>
          <Link to="/" className="font-medium text-ink-500 underline hover:text-ink-900">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
