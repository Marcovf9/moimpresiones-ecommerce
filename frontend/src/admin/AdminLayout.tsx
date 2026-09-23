import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import {
  IconoCotizaciones,
  IconoInicio,
  IconoProductos,
  IconoReportes,
  IconoRubros,
  IconoTerminaciones,
  IconoTextos,
} from './components/IconosAdmin'
import { MenuIcon } from '../components/Icons'

const SECCIONES = [
  { to: '/admin', label: 'Inicio', end: true, icono: IconoInicio },
  { to: '/admin/cotizaciones', label: 'Cotizaciones', icono: IconoCotizaciones },
  { to: '/admin/reportes', label: 'Reportes', icono: IconoReportes },
  { to: '/admin/productos', label: 'Productos', icono: IconoProductos },
  { to: '/admin/rubros', label: 'Rubros', icono: IconoRubros },
  { to: '/admin/terminaciones', label: 'Terminaciones', icono: IconoTerminaciones },
  { to: '/admin/textos', label: 'Textos del sitio', icono: IconoTextos },
]

/**
 * Armazón del panel: una columna con las secciones y el contenido al lado.
 *
 * <p>Antes las secciones eran seis botones apretados en una fila arriba, todos
 * del mismo color: había que leerlos para saber dónde se estaba parado. En
 * columna entran con su ícono, se ve cuál está activa y queda lugar para
 * sumar secciones sin rehacer nada.
 *
 * <p>En teléfono la columna se abre y se cierra: el dueño entra desde el
 * celular a mirar las cotizaciones del día.
 */
export function AdminLayout() {
  const { session, logout } = useAuth()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Al cambiar de sección se cierra sola: si no, tapa lo que se vino a ver.
  useEffect(() => setMenuAbierto(false), [location.pathname])

  return (
    <div className="min-h-dvh bg-ink-50">
      <div className="mx-auto flex max-w-[92rem] gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <aside
          className={`${
            menuAbierto ? 'block' : 'hidden'
          } fixed inset-0 z-40 bg-ink-900/50 p-4 lg:static lg:z-auto lg:block lg:w-60 lg:shrink-0 lg:bg-transparent lg:p-0`}
          onClick={() => setMenuAbierto(false)}
        >
          <div
            className="h-full w-72 max-w-full rounded-2xl border border-ink-100 bg-white p-4 lg:sticky lg:top-6 lg:h-auto lg:w-auto"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-4">
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-ink-900 uppercase">
                MO Impresiones
              </span>
            </div>

            <nav aria-label="Secciones del panel" className="space-y-1">
              {SECCIONES.map(({ to, label, end, icono: Icono }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-ink-900 text-white'
                        : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
                    }`
                  }
                >
                  <Icono className="size-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 border-t border-ink-100 pt-4">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
              >
                Ver el sitio ↗
              </a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir secciones"
              className="grid size-10 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-50 lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>

            <span className="truncate text-sm text-ink-500">
              {session?.fullName ?? session?.username}
            </span>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
            >
              Salir
            </button>
          </header>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
