import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Inicio', end: true },
  { to: '/admin/reportes', label: 'Reportes' },
  { to: '/admin/cotizaciones', label: 'Cotizaciones' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/rubros', label: 'Rubros' },
  { to: '/admin/terminaciones', label: 'Terminaciones' },
]

export function AdminLayout() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-ink-900 uppercase">
              MO Impresiones
            </span>
            <nav aria-label="Secciones del panel" className="flex flex-wrap gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      isActive ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-ink-500 transition hover:text-ink-900"
            >
              Ver el sitio ↗
            </a>
            <span className="text-ink-500">{session?.fullName ?? session?.username}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-1.5 font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
