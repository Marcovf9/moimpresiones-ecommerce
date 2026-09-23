import { ApiError } from '../api/client'
import type { ApiErrorBody, Category, ProductDetail, ProductSummary, Finishing } from '../api/types'
import type {
  AdminQuote,
  AdminSession,
  Dashboard,
  Page,
  QuoteStatus,
  SaveCategoryPayload,
  SaveFinishingPayload,
  SaveProductPayload,
  Reporte,
} from './adminTypes'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'moimpresiones.admin.session'

/** Se dispara cuando el token vencio o el backend lo rechazo. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión venció. Iniciá sesión de nuevo.')
    this.name = 'SessionExpiredError'
  }
}

export const sessionStore = {
  read(): AdminSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const session = JSON.parse(raw) as AdminSession
      // Un token vencido no sirve para nada: lo tiramos antes de usarlo.
      if (!session.token || session.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      return session
    } catch {
      return null
    }
  },

  write(session: AdminSession) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Navegador en modo privado o storage lleno: la sesion vive solo en memoria.
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nada que hacer.
    }
  },
}

async function request<T>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (withAuth) {
    const session = sessionStore.read()
    if (!session) throw new SessionExpiredError()
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos con el servidor.')
  }

  if (response.status === 401 && withAuth) {
    sessionStore.clear()
    throw new SessionExpiredError()
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw new ApiError(
      response.status,
      body?.message ?? 'No pudimos completar la operación.',
      body?.fieldErrors ?? {},
    )
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export interface FiltrosDeCotizaciones {
  estado: QuoteStatus | 'TODAS'
  texto?: string
  desde?: string
  hasta?: string
}

function parametros(filtros: FiltrosDeCotizaciones): URLSearchParams {
  const params = new URLSearchParams()
  if (filtros.estado !== 'TODAS') params.set('status', filtros.estado)
  if (filtros.texto?.trim()) params.set('q', filtros.texto.trim())
  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  return params
}

export const adminApi = {
  async login(username: string, password: string): Promise<AdminSession> {
    const result = await request<{
      token: string
      expiresInMinutes: number
      username: string
      fullName: string | null
    }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }, false)

    // Descontamos un minuto para no quedarnos con un token que vence mientras se usa.
    const expiresAt = Date.now() + (result.expiresInMinutes - 1) * 60_000
    const session: AdminSession = {
      token: result.token,
      username: result.username,
      fullName: result.fullName,
      expiresAt,
    }
    sessionStore.write(session)
    return session
  },

  dashboard: () => request<Dashboard>('/api/admin/dashboard'),

  reporte: (desde: string, hasta: string) =>
    request<Reporte>(`/api/admin/analytics?desde=${desde}&hasta=${hasta}`),

  cambiarPassword: (actual: string, nueva: string) =>
    request<void>('/api/admin/password', {
      method: 'POST',
      body: JSON.stringify({ actual, nueva }),
    }),

  // Rubros
  categories: () => request<Category[]>('/api/admin/catalog/categories'),
  createCategory: (payload: SaveCategoryPayload) =>
    request<Category>('/api/admin/catalog/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCategory: (slug: string, payload: SaveCategoryPayload) =>
    request<Category>(`/api/admin/catalog/categories/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (slug: string) =>
    request<void>(`/api/admin/catalog/categories/${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  // Productos
  products: () => request<ProductSummary[]>('/api/admin/catalog/products'),
  product: (slug: string) =>
    request<ProductDetail>(`/api/admin/catalog/products/${encodeURIComponent(slug)}`),
  createProduct: (payload: SaveProductPayload) =>
    request<ProductDetail>('/api/admin/catalog/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (slug: string, payload: SaveProductPayload) =>
    request<ProductDetail>(`/api/admin/catalog/products/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (slug: string) =>
    request<void>(`/api/admin/catalog/products/${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  // Terminaciones
  finishings: () => request<Finishing[]>('/api/admin/finishings'),
  createFinishing: (payload: SaveFinishingPayload) =>
    request<Finishing>('/api/admin/finishings', { method: 'POST', body: JSON.stringify(payload) }),
  updateFinishing: (slug: string, payload: SaveFinishingPayload) =>
    request<Finishing>(`/api/admin/finishings/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteFinishing: (slug: string) =>
    request<void>(`/api/admin/finishings/${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  // Cotizaciones
  quotes: (filtros: FiltrosDeCotizaciones, page = 0) => {
    const params = parametros(filtros)
    params.set('page', String(page))
    params.set('size', '20')
    return request<Page<AdminQuote>>(`/api/admin/quotes?${params}`)
  },

  /**
   * Baja la planilla con lo que se esté viendo.
   *
   * <p>Pasa por fetch y no por un enlace directo porque la descarga necesita
   * el token de la sesión, y un <a href> no puede mandarlo.
   */
  async descargarPlanilla(filtros: FiltrosDeCotizaciones): Promise<void> {
    const session = sessionStore.read()
    if (!session) throw new SessionExpiredError()

    const respuesta = await fetch(`${BASE_URL}/api/admin/quotes/planilla.csv?${parametros(filtros)}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    if (respuesta.status === 401) {
      sessionStore.clear()
      throw new SessionExpiredError()
    }
    if (!respuesta.ok) throw new ApiError(respuesta.status, 'No pudimos armar la planilla.')

    const url = URL.createObjectURL(await respuesta.blob())
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `cotizaciones-${new Date().toISOString().slice(0, 10)}.csv`
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
  updateQuote: (id: number, status: QuoteStatus, internalNotes?: string) =>
    request<AdminQuote>(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internalNotes }),
    }),
  deleteQuote: (id: number) => request<void>(`/api/admin/quotes/${id}`, { method: 'DELETE' }),

  /**
   * Los adjuntos no son públicos: hay que pedirlos con el token y abrirlos
   * desde memoria, porque un <a href> no puede mandar la cabecera de sesión.
   */
  async abrirAdjunto(downloadPath: string): Promise<string> {
    const session = sessionStore.read()
    if (!session) throw new SessionExpiredError()
    const respuesta = await fetch(`${BASE_URL}${downloadPath}`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
    if (respuesta.status === 401) {
      sessionStore.clear()
      throw new SessionExpiredError()
    }
    if (!respuesta.ok) throw new ApiError(respuesta.status, 'No pudimos abrir el archivo.')
    return URL.createObjectURL(await respuesta.blob())
  },

  /** Sube un archivo y devuelve la URL publica con la que guardarlo. */
  async uploadMedia(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const result = await request<{ url: string }>('/api/admin/media', {
      method: 'POST',
      body: form,
    })
    return result.url
  },
}
