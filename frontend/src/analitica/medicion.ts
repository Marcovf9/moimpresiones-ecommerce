/**
 * Medición con Google (Ads y Analytics).
 *
 * <p>El sitio ya cuenta visitas por su cuenta, sin cookies, y eso sigue igual:
 * es lo que alimenta los reportes del panel. Esto es otra cosa y responde a
 * otra necesidad: para pautar en Google Ads hay que poder decirle a Google
 * cuáles de los clics que pagó terminaron en una cotización.
 *
 * <p>Nada se carga si no hay identificadores configurados. Se ponen como
 * variables de entorno en Netlify, así el que las cambia no necesita tocar
 * código:
 *
 * <ul>
 *   <li>{@code VITE_GOOGLE_ADS_ID} — `AW-1234567890`
 *   <li>{@code VITE_GOOGLE_ADS_LABEL} — la etiqueta de la conversión
 *   <li>{@code VITE_GA_ID} — `G-XXXXXXXXXX`, opcional
 * </ul>
 *
 * <p>Sobre el consentimiento: se usa el modo de consentimiento de Google. El
 * sitio arranca con todo denegado —Google no guarda ninguna cookie— y recién
 * al aceptar se habilita. Quien no acepta igual navega normal; Google recibe
 * el dato sin identificarlo.
 */

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID?.trim() ?? ''
const ADS_LABEL = import.meta.env.VITE_GOOGLE_ADS_LABEL?.trim() ?? ''
const GA_ID = import.meta.env.VITE_GA_ID?.trim() ?? ''

const CLAVE_CONSENTIMIENTO = 'moimpresiones.cookies'

type Decision = 'aceptado' | 'rechazado'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** ¿Hay algo que medir? Sin identificadores, este módulo no hace nada. */
export function hayMedicion(): boolean {
  return Boolean(ADS_ID || GA_ID)
}

export function decisionGuardada(): Decision | null {
  try {
    const valor = localStorage.getItem(CLAVE_CONSENTIMIENTO)
    return valor === 'aceptado' || valor === 'rechazado' ? valor : null
  } catch {
    // Modo privado o almacenamiento bloqueado: se pregunta de nuevo.
    return null
  }
}

function guardarDecision(decision: Decision) {
  try {
    localStorage.setItem(CLAVE_CONSENTIMIENTO, decision)
  } catch {
    // Si no se puede guardar, el aviso vuelve a aparecer: molesto, no roto.
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(args)
}

let iniciado = false

/** Carga las etiquetas de Google una sola vez, con el consentimiento en su estado actual. */
export function iniciarMedicion() {
  if (iniciado || !hayMedicion() || typeof document === 'undefined') return
  iniciado = true

  const aceptado = decisionGuardada() === 'aceptado'
  const estado = aceptado ? 'granted' : 'denied'

  // El consentimiento se declara antes de cargar la etiqueta: si se declarara
  // después, Google alcanzaría a escribir cookies en el medio.
  gtag('consent', 'default', {
    ad_storage: estado,
    ad_user_data: estado,
    ad_personalization: estado,
    analytics_storage: estado,
    wait_for_update: 500,
  })
  gtag('js', new Date())

  const principal = ADS_ID || GA_ID
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(principal)}`
  document.head.appendChild(script)

  if (ADS_ID) gtag('config', ADS_ID)
  // El sitio es una sola pantalla: las vistas se envían a mano en cada cambio
  // de dirección, o Analytics contaría solo la primera.
  if (GA_ID) gtag('config', GA_ID, { send_page_view: false })
}

export function aceptarCookies() {
  guardarDecision('aceptado')
  iniciarMedicion()
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  })
  registrarVista(window.location.pathname)
}

export function rechazarCookies() {
  guardarDecision('rechazado')
  iniciarMedicion()
}

/** Una pantalla vista, para Analytics. */
export function registrarVista(ruta: string) {
  if (!GA_ID || !iniciado) return
  gtag('event', 'page_view', { page_path: ruta, page_location: window.location.href })
}

/**
 * La conversión: alguien terminó de pedir un presupuesto.
 *
 * <p>Es el número por el que se mide si la pauta sirve, así que se dispara en
 * la pantalla de confirmación, que solo se ve después de enviar el pedido.
 */
export function registrarCotizacionEnviada() {
  if (!iniciado) return
  if (ADS_ID && ADS_LABEL) {
    gtag('event', 'conversion', { send_to: `${ADS_ID}/${ADS_LABEL}` })
  }
  if (GA_ID) {
    gtag('event', 'generate_lead', { method: 'whatsapp' })
  }
}
