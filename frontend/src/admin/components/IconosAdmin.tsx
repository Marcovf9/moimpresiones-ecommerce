/**
 * Íconos de las secciones del panel.
 *
 * <p>Dibujados acá, con el mismo trazo que los del sitio, para no sumar una
 * biblioteca de íconos entera por seis dibujos.
 */
interface Props {
  className?: string
}

function Svg({ className = 'size-5', children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconoInicio(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  )
}

export function IconoCotizaciones(props: Props) {
  return (
    <Svg {...props}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 20.5l1.6-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
    </Svg>
  )
}

export function IconoReportes(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </Svg>
  )
}

export function IconoProductos(props: Props) {
  return (
    <Svg {...props}>
      <path d="M3 7.5 12 3l9 4.5-9 4.5z" />
      <path d="M3 12.5 12 17l9-4.5M3 17 12 21.5 21 17" />
    </Svg>
  )
}

export function IconoRubros(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z" />
    </Svg>
  )
}

export function IconoTerminaciones(props: Props) {
  return (
    <Svg {...props}>
      <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" />
    </Svg>
  )
}

export function IconoBuscar(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  )
}

export function IconoDescargar(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M4 19h16" />
    </Svg>
  )
}
