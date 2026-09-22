import { useEffect, useRef, useState } from 'react'
import { useContactInfo } from '../hooks/useContactInfo'
import { WhatsAppIcon } from './Icons'

/** Cuánto tarda en aparecer por primera vez, ya con la página leída. */
const PRIMERA_APARICION = 6_000
/** Cuánto queda visible. */
const DURACION = 7_000
/** Descanso entre una aparición y la siguiente. */
const INTERVALO = 45_000

/**
 * Botón flotante de WhatsApp. En Argentina es la vía por la que la mayoría
 * escribe, y ahorra tener que buscar el contacto en el menú.
 *
 * <p>Cada tanto asoma un globo invitando a cotizar. Se calla apenas alguien lo
 * cierra o toca el botón: insistir después de eso molesta más de lo que suma.
 */
export function WhatsAppFab() {
  const contact = useContactInfo()
  const [visible, setVisible] = useState(false)
  const [silenciado, setSilenciado] = useState(false)
  // En una ref y no en el estado: el ciclo no debe reiniciarse al mostrar u ocultar.
  const silenciadoRef = useRef(false)

  useEffect(() => {
    silenciadoRef.current = silenciado
  }, [silenciado])

  useEffect(() => {
    if (!contact?.whatsappUrl) return

    const temporizadores: number[] = []

    const mostrar = () => {
      if (silenciadoRef.current) return
      setVisible(true)
      temporizadores.push(window.setTimeout(() => setVisible(false), DURACION))
    }

    temporizadores.push(window.setTimeout(mostrar, PRIMERA_APARICION))
    const ciclo = window.setInterval(mostrar, INTERVALO)

    return () => {
      temporizadores.forEach(window.clearTimeout)
      window.clearInterval(ciclo)
    }
  }, [contact?.whatsappUrl])

  if (!contact?.whatsappUrl) return null

  function callar() {
    setVisible(false)
    setSilenciado(true)
  }

  return (
    // El contenedor no recibe toques: ocupa el ancho del globo aunque esté
    // oculto, y ese rectángulo invisible se tragaba los clics de lo que
    // estuviera debajo, como el botón "Finalizado" de la barra del catálogo.
    <div className="pointer-events-none fixed right-5 bottom-5 z-30 flex items-end gap-2">
      {/* aria-hidden: el globo repite lo que ya dice el botón, y para quien usa
          lector de pantalla sería una interrupción sin motivo. */}
      <div
        aria-hidden="true"
        className={`relative mb-1 max-w-[15rem] origin-bottom-right rounded-2xl rounded-br-sm bg-white px-4 py-3 text-sm text-ink-900 shadow-lg transition-all duration-500 ${
          visible
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={callar}
          aria-label="Cerrar mensaje"
          className="absolute -top-3 -right-3 grid size-9 place-items-center rounded-full bg-ink-900 text-sm text-white shadow transition hover:bg-ink-700"
        >
          ✕
        </button>
        ¡Contactanos para cotizar tu proyecto!
      </div>

      <a
        href={contact.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        onClick={callar}
        aria-label="Escribinos por WhatsApp"
        className="pointer-events-auto grid size-14 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  )
}
