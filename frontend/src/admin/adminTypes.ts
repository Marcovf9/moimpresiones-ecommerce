/** Tipos propios del panel de administracion. */

export type QuoteStatus = 'PENDIENTE' | 'RESPONDIDA' | 'CERRADA'

export interface AdminSession {
  token: string
  username: string
  fullName: string | null
  /** Momento (epoch ms) en que el token deja de servir. */
  expiresAt: number
}

export interface DashboardTaskRef {
  nombre: string
  slug: string
}

export interface DashboardTask {
  codigo: string
  titulo: string
  detalle: string
  cantidad: number
  severidad: 'alta' | 'media' | 'baja'
  enlace: string
  elementos: DashboardTaskRef[]
}

export interface Dashboard {
  kpis: {
    cotizacionesEsteMes: number
    cotizacionesPendientes: number
    cotizacionesTotales: number
    productosPublicados: number
    productosDespublicados: number
    terminaciones: number
  }
  tareasPendientes: DashboardTask[]
  cotizacionesPorSemana: { semana: string; cantidad: number }[]
  productosMasPedidos: { nombre: string; slug: string; cantidad: number }[]
  ultimasCotizaciones: {
    id: number
    nombre: string
    empresa: string | null
    telefono: string
    producto: string | null
    estado: QuoteStatus
    fecha: string
  }[]
}

export interface AdminQuoteItem {
  productName: string | null
  productSlug: string | null
  quantity: string | null
  format: string | null
  material: string | null
  finishings: string | null
  notes: string | null
}

export interface AdminQuoteAttachment {
  id: number
  downloadPath: string
  filename: string
  contentType: string | null
  sizeBytes: number | null
}

export interface AdminQuote {
  id: number
  fullName: string
  company: string | null
  phone: string
  whatsappUrl: string | null
  email: string | null
  items: AdminQuoteItem[]
  attachments: AdminQuoteAttachment[]
  message: string | null
  status: QuoteStatus
  internalNotes: string | null
  createdAt: string
  answeredAt: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
}

export interface SaveProductPayload {
  categorySlug: string
  slug: string
  name: string
  summary: string
  description: string
  displayOrder: number
  active: boolean
  specs: { label: string; value: string }[]
  images: { url: string; altText: string }[]
}

export interface SaveCategoryPayload {
  slug: string
  name: string
  description: string
  displayOrder: number
}

export interface SaveFinishingPayload {
  slug: string
  name: string
  description: string
  imageUrl: string
  displayOrder: number
}

export interface FilaReporte {
  clave: string
  etiqueta: string
  visitas: number
  visitantes: number
}

export interface Reporte {
  desde: string
  hasta: string
  resumen: {
    visitas: number
    visitantes: number
    visitasPeriodoPrevio: number
    visitantesPeriodoPrevio: number
    cotizaciones: number
  }
  porDia: { dia: string; visitas: number; visitantes: number }[]
  paginas: FilaReporte[]
  productos: FilaReporte[]
  origenes: FilaReporte[]
}

/** Un texto del sitio editable desde el panel. */
export interface TextoEditable {
  clave: string
  titulo: string
  ayuda: string
  valor: string
}
