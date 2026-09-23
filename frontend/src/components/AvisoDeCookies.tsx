import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  aceptarCookies,
  decisionGuardada,
  hayMedicion,
  iniciarMedicion,
  rechazarCookies,
} from '../analitica/medicion'

/**
 * Aviso de cookies, abajo de todo.
 *
 * <p>Aparece solo si hay medición configurada: sin identificadores de Google,
 * el sitio no guarda ninguna cookie y preguntar sería absurdo.
 *
 * <p>Las dos opciones pesan lo mismo a propósito. Un "rechazar" escondido
 * detrás de un enlace gris es la forma elegante de no dar opción.
 */
export function AvisoDeCookies() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hayMedicion()) return
    // La etiqueta se carga igual, con el consentimiento como esté: así Google
    // mide sin cookies a quien no acepta, y no hay que recargar al aceptar.
    iniciarMedicion()
    setVisible(decisionGuardada() === null)
  }, [])

  if (!visible) return null

  function responder(acepta: boolean) {
    if (acepta) aceptarCookies()
    else rechazarCookies()
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Uso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-900/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <p className="text-sm text-ink-100">
          Usamos cookies para medir cómo se usa el sitio y cuántas consultas llegan desde nuestros
          anuncios. Podés seguir navegando sin aceptarlas.{' '}
          <Link to="/privacidad" className="underline transition hover:text-white">
            Ver la política de privacidad
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => responder(false)}
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => responder(true)}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-ink-100"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
