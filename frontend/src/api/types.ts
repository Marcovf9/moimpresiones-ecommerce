/** Tipos que devuelve la API de Spring Boot. */

export interface ProductSummary {
  id: number
  slug: string
  name: string
  summary: string | null
  categorySlug: string
  categoryName: string
  coverImageUrl: string | null
}

export interface ProductImage {
  id: number
  url: string
  altText: string | null
  displayOrder: number
}

export interface ProductSpec {
  id: number
  label: string
  value: string
  displayOrder: number
}

export interface ProductDetail {
  id: number
  slug: string
  name: string
  summary: string | null
  description: string | null
  categorySlug: string
  categoryName: string
  active: boolean
  images: ProductImage[]
  specs: ProductSpec[]
  finishings: { slug: string; name: string }[]
}

export interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  displayOrder: number
  products: ProductSummary[]
}

export interface Finishing {
  id: number
  slug: string
  name: string
  description: string
  imageUrl: string | null
  displayOrder: number
}

export interface ContactInfo {
  whatsappNumber: string | null
  whatsappUrl: string | null
  instagramUrl: string | null
  email: string | null
}

export interface QuoteItemValues {
  productSlug?: string
  productName?: string
  quantity?: string
  format?: string
  material?: string
  finishings?: string
  notes?: string
}

export interface QuoteAttachmentValues {
  storageKey: string
  filename: string
  contentType?: string
  sizeBytes?: number
}

export interface QuoteFormValues {
  fullName: string
  phone: string
  email?: string
  company?: string
  message?: string
  items: QuoteItemValues[]
  attachments?: QuoteAttachmentValues[]
}

export interface QuoteCreated {
  id: number
  whatsappUrl: string | null
}

/** Error de validacion devuelto por la API. */
export interface ApiErrorBody {
  status: number
  error: string
  message: string
  fieldErrors?: Record<string, string>
}

export interface OpcionFiltro {
  clave: string
  etiqueta: string
  cantidad: number
}

export interface FiltrosDisponibles {
  terminaciones: OpcionFiltro[]
  materiales: OpcionFiltro[]
}
