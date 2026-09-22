import { api } from '../api/client'
import { useApi } from './useApi'
import type { ContactInfo } from '../api/types'

/** Datos de contacto que usan el menu, el pie y el cotizador. */
export function useContactInfo(): ContactInfo | null {
  const { data } = useApi<ContactInfo>(() => api.contact(), [])
  return data
}
