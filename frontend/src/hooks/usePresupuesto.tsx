import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const CLAVE = 'moimpresiones.presupuesto'
/** Tope alineado con el del backend. */
export const MAX_ITEMS = 20

export interface ItemPresupuesto {
  productSlug?: string
  productName: string
  coverImageUrl?: string | null
  quantity: string
  format: string
  material: string
  finishings: string
  notes: string
}

export function itemVacio(parcial: Partial<ItemPresupuesto> = {}): ItemPresupuesto {
  return {
    productName: '',
    quantity: '',
    format: '',
    material: '',
    finishings: '',
    notes: '',
    ...parcial,
  }
}

interface Valor {
  items: ItemPresupuesto[]
  agregar: (item: ItemPresupuesto) => void
  actualizar: (indice: number, cambios: Partial<ItemPresupuesto>) => void
  quitar: (indice: number) => void
  vaciar: () => void
  contiene: (productSlug: string) => boolean
}

const Contexto = createContext<Valor | null>(null)

function leerGuardado(): ItemPresupuesto[] {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return []
    const datos = JSON.parse(crudo)
    return Array.isArray(datos) ? datos.slice(0, MAX_ITEMS) : []
  } catch {
    // Modo privado, almacenamiento lleno o datos corruptos: se empieza vacío.
    return []
  }
}

/**
 * Lista de productos que el visitante va juntando para pedir presupuesto.
 *
 * <p>Vive en localStorage para que sobreviva a la navegación y a recargar la
 * página: alguien que arma un pedido de varias piezas no debería perderlo por
 * entrar a mirar otra ficha.
 */
export function PresupuestoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemPresupuesto[]>(leerGuardado)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items))
    } catch {
      // Si no se puede guardar, la lista igual funciona durante la visita.
    }
  }, [items])

  const agregar = useCallback((item: ItemPresupuesto) => {
    setItems((actuales) => {
      // No repetimos un producto del catálogo: se edita el que ya está.
      if (item.productSlug && actuales.some((i) => i.productSlug === item.productSlug)) {
        return actuales
      }
      if (actuales.length >= MAX_ITEMS) return actuales
      return [...actuales, item]
    })
  }, [])

  const actualizar = useCallback((indice: number, cambios: Partial<ItemPresupuesto>) => {
    setItems((actuales) =>
      actuales.map((item, i) => (i === indice ? { ...item, ...cambios } : item)),
    )
  }, [])

  const quitar = useCallback((indice: number) => {
    setItems((actuales) => actuales.filter((_, i) => i !== indice))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const contiene = useCallback(
    (productSlug: string) => items.some((i) => i.productSlug === productSlug),
    [items],
  )

  const valor = useMemo(
    () => ({ items, agregar, actualizar, quitar, vaciar, contiene }),
    [items, agregar, actualizar, quitar, vaciar, contiene],
  )

  return <Contexto value={valor}>{children}</Contexto>
}

export function usePresupuesto(): Valor {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('usePresupuesto debe usarse dentro de PresupuestoProvider')
  return valor
}
