import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePresupuesto } from '../hooks/usePresupuesto'
import { useApi } from '../hooks/useApi'
import { imagenOptimizada } from '../api/imagenes'
import { api } from '../api/client'
import type { Category, ContactInfo, ProductSummary } from '../api/types'
import {
  ChevronDownIcon,
  CloseIcon,
  InstagramIcon,
  MailIcon,
  SearchIcon,
  WhatsAppIcon,
} from './Icons'

interface MenuOverlayProps {
  open: boolean
  onClose: () => void
  contact: ContactInfo | null
}

/**
 * Menu principal, segun el boceto: Buscar, Inicio, Quienes somos, Productos,
 * Terminaciones, Contacto (que despliega los canales) y Cotiza tu producto.
 */
export function MenuOverlay({ open, onClose, contact }: MenuOverlayProps) {
  const [contactOpen, setContactOpen] = useState(false)
  const [productosOpen, setProductosOpen] = useState(false)
  const { items } = usePresupuesto()
  // Solo se piden al abrir el menú: no hace falta cargarlos en cada pantalla.
  const { data: rubros } = useApi<Category[]>(
    () => (open ? api.categories() : Promise.resolve([])),
    [open],
  )

  useEffect(() => {
    if (!open) {
      setContactOpen(false)
      setProductosOpen(false)
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <nav
        aria-label="Menú principal"
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-ink-900 text-ink-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6">
          <span className="font-display text-sm tracking-[0.3em] text-ink-300 uppercase">Menú</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-full p-1 text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6">
          <SearchBox onNavigate={onClose} />
        </div>

        <ul className="mt-8 flex-1 space-y-1 px-6 pb-10">
          <MenuLink to="/" onClick={onClose}>Inicio</MenuLink>
          <MenuLink to="/#quienes-somos" onClick={onClose}>¿Quiénes somos?</MenuLink>
          <li>
            <button
              type="button"
              onClick={() => setProductosOpen((valor) => !valor)}
              aria-expanded={productosOpen}
              aria-controls="menu-rubros"
              className="flex w-full items-center justify-between border-b border-white/10 py-3.5 font-display text-xl text-ink-50 transition hover:text-brand-500 sm:py-4 sm:text-2xl"
            >
              Productos
              <ChevronDownIcon
                className={`size-5 transition-transform ${productosOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {productosOpen && (
              <ul id="menu-rubros" className="border-b border-white/10 py-2">
                {/* Cada rubro entra directo a su listado, sin pasar por la
                    pantalla intermedia ni obligar a bajar buscándolo. */}
                {(rubros ?? []).map((rubro) => (
                  <li key={rubro.slug}>
                    <Link
                      to={`/productos?rubro=${encodeURIComponent(rubro.slug)}`}
                      onClick={onClose}
                      className="flex items-center justify-between gap-3 py-2.5 pl-4 text-ink-100 transition hover:text-brand-500"
                    >
                      {rubro.name}
                      <span className="text-xs text-ink-300">{rubro.products.length}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/productos"
                    onClick={onClose}
                    className="block py-2.5 pl-4 text-sm text-ink-300 underline transition hover:text-brand-500"
                  >
                    Ver todo el catálogo
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <MenuLink to="/terminaciones" onClick={onClose}>Terminaciones</MenuLink>
          <MenuLink to="/preguntas-frecuentes" onClick={onClose}>Preguntas frecuentes</MenuLink>

          <li>
            <button
              type="button"
              onClick={() => setContactOpen((value) => !value)}
              aria-expanded={contactOpen}
              className="flex w-full items-center justify-between border-b border-white/10 py-3.5 font-display text-xl text-ink-50 transition hover:text-brand-500 sm:py-4 sm:text-2xl"
            >
              Contacto
              <ChevronDownIcon
                className={`size-5 transition-transform ${contactOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {contactOpen && <ContactChannels contact={contact} />}
          </li>

          <li>
            <Link
              to="/cotiza"
              onClick={onClose}
              className="flex items-center justify-between gap-3 border-b border-white/10 py-3.5 font-display text-xl text-ink-50 transition hover:text-brand-500 sm:py-4 sm:text-2xl"
            >
              Cotizá tu producto
              {/* El contador avisa que hay un pedido a medio armar. */}
              {items.length > 0 && (
                <span className="grid min-w-7 place-items-center rounded-full bg-brand-600 px-2 py-0.5 text-sm font-medium text-white">
                  {items.length}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

function MenuLink({ to, onClick, children }: { to: string; onClick: () => void; children: string }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className="block border-b border-white/10 py-3.5 font-display text-xl transition hover:text-brand-500 sm:py-4 sm:text-2xl"
      >
        {children}
      </Link>
    </li>
  )
}

/** Los canales que pidio el cliente: WhatsApp, Instagram y mail. */
function ContactChannels({ contact }: { contact: ContactInfo | null }) {
  const channels = [
    contact?.whatsappUrl && {
      href: contact.whatsappUrl,
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="size-5" />,
      external: true,
    },
    contact?.instagramUrl && {
      href: contact.instagramUrl,
      label: 'Instagram',
      icon: <InstagramIcon className="size-5" />,
      external: true,
    },
    contact?.email && {
      href: `mailto:${contact.email}`,
      label: contact.email,
      icon: <MailIcon className="size-5" />,
      external: false,
    },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode; external: boolean }[]

  if (channels.length === 0) {
    return (
      <p className="py-4 text-sm text-ink-300">
        Estamos cargando nuestros datos de contacto.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2 py-4 pl-1">
      {channels.map((channel) => (
        <li key={channel.label}>
          <a
            href={channel.href}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noreferrer' : undefined}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-ink-100 transition hover:bg-white/10 hover:text-white"
          >
            {channel.icon}
            <span>{channel.label}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Buscador del menu: consulta la API a partir de dos caracteres. */
function SearchBox({ onNavigate }: { onNavigate: () => void }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<ProductSummary[]>([])
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const trimmed = term.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }

    let cancelled = false
    setSearching(true)
    // Pequena espera para no disparar una consulta por tecla.
    const timer = setTimeout(() => {
      api.search(trimmed)
        .then((found) => {
          if (!cancelled) setResults(found)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term])

  return (
    <div>
      <label className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 focus-within:bg-white/15">
        <SearchIcon className="size-5 shrink-0 text-ink-300" />
        <span className="sr-only">Buscar productos</span>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar productos..."
          className="w-full bg-transparent text-ink-50 placeholder:text-ink-300 focus:outline-none"
        />
      </label>

      {term.trim().length >= 2 && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl bg-white/5">
          {searching && <p className="px-4 py-3 text-sm text-ink-300">Buscando...</p>}
          {!searching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-300">
              No encontramos productos para «{term.trim()}».
            </p>
          )}
          {results.map((product) => (
            <button
              key={product.slug}
              type="button"
              onClick={() => {
                navigate(`/productos/${product.slug}`)
                onNavigate()
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
            >
              {product.coverImageUrl && (
                <img
                  {...imagenOptimizada(product.coverImageUrl, 96)}
                  alt=""
                  loading="lazy"
                  className="size-12 shrink-0 rounded bg-white/10 object-contain"
                />
              )}
              <span className="min-w-0">
                <span className="block truncate text-ink-50">{product.name}</span>
                <span className="block text-xs text-ink-300">{product.categoryName}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
