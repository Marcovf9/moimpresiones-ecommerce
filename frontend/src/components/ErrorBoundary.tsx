import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Evita que un error de JavaScript deje la pantalla en blanco.
 *
 * <p>Para un sitio comercial esto importa: una pantalla vacía es un cliente
 * perdido sin siquiera saber que hubo un problema. Mostramos algo que permita
 * seguir navegando o escribirnos igual.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Queda en la consola para poder diagnosticarlo desde el navegador del cliente.
    console.error('Error no controlado en la interfaz:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="grid min-h-dvh place-items-center bg-ink-900 px-6 text-center">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-brand-500 uppercase">
            MO Impresiones
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-white">
            Algo se rompió de nuestro lado
          </h1>
          <p className="mt-3 text-ink-300">
            Perdón por el inconveniente. Probá recargar la página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full bg-white px-7 py-3 font-medium text-ink-900 transition hover:bg-ink-100"
          >
            Recargar
          </button>
        </div>
      </main>
    )
  }
}
