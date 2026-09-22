import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  itemVacio,
  MAX_ITEMS,
  PresupuestoProvider,
  usePresupuesto,
} from './usePresupuesto'

const CLAVE = 'moimpresiones.presupuesto'

/**
 * La lista de presupuesto es lo único que el visitante arma a lo largo de la
 * visita, y vive en localStorage: si se pierde o se duplica, el pedido que
 * llega a la imprenta queda mal. Por eso se prueba acá y no a ojo.
 */

/** Deja al descubierto el valor del contexto para manejarlo desde el test. */
let api: ReturnType<typeof usePresupuesto>

function Sonda() {
  api = usePresupuesto()
  return <span data-testid="cantidad">{api.items.length}</span>
}

function montar() {
  return render(
    <PresupuestoProvider>
      <Sonda />
    </PresupuestoProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('usePresupuesto', () => {
  it('agrega un producto y lo deja guardado', () => {
    montar()

    act(() => api.agregar(itemVacio({ productSlug: 'tarjetas', productName: 'Tarjetas' })))

    expect(api.items).toHaveLength(1)
    expect(api.contiene('tarjetas')).toBe(true)
    expect(JSON.parse(localStorage.getItem(CLAVE)!)).toHaveLength(1)
  })

  it('no repite un producto del catálogo', () => {
    montar()

    act(() => api.agregar(itemVacio({ productSlug: 'tarjetas', productName: 'Tarjetas' })))
    act(() => api.agregar(itemVacio({ productSlug: 'tarjetas', productName: 'Tarjetas' })))

    expect(api.items).toHaveLength(1)
  })

  it('admite varias líneas sueltas, que no vienen del catálogo', () => {
    montar()

    act(() => api.agregar(itemVacio({ productName: 'Algo a medida' })))
    act(() => api.agregar(itemVacio({ productName: 'Otra cosa a medida' })))

    expect(api.items).toHaveLength(2)
  })

  it('no pasa del tope que acepta el backend', () => {
    montar()

    act(() => {
      for (let i = 0; i < MAX_ITEMS + 5; i++) {
        api.agregar(itemVacio({ productSlug: `producto-${i}`, productName: `Producto ${i}` }))
      }
    })

    expect(api.items).toHaveLength(MAX_ITEMS)
  })

  it('recupera lo guardado al volver a entrar', () => {
    localStorage.setItem(
      CLAVE,
      JSON.stringify([itemVacio({ productSlug: 'carpetas', productName: 'Carpetas' })]),
    )

    montar()

    expect(screen.getByTestId('cantidad')).toHaveTextContent('1')
    expect(api.contiene('carpetas')).toBe(true)
  })

  it('empieza vacío si lo guardado está corrupto, en vez de romper la página', () => {
    localStorage.setItem(CLAVE, 'esto no es json')

    montar()

    expect(api.items).toEqual([])
  })

  it('sigue funcionando sin acceso a localStorage, como en modo privado', () => {
    const leer = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    const escribir = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })

    montar()
    act(() => api.agregar(itemVacio({ productSlug: 'sobres', productName: 'Sobres' })))

    expect(api.items).toHaveLength(1)

    leer.mockRestore()
    escribir.mockRestore()
  })

  it('edita, quita y vacía', () => {
    montar()

    act(() => api.agregar(itemVacio({ productSlug: 'libros', productName: 'Libros' })))
    act(() => api.actualizar(0, { quantity: '500' }))
    expect(api.items[0].quantity).toBe('500')

    act(() => api.agregar(itemVacio({ productSlug: 'sobres', productName: 'Sobres' })))
    act(() => api.quitar(0))
    expect(api.items).toHaveLength(1)
    expect(api.items[0].productSlug).toBe('sobres')

    act(() => api.vaciar())
    expect(api.items).toEqual([])
    expect(JSON.parse(localStorage.getItem(CLAVE)!)).toEqual([])
  })
})
