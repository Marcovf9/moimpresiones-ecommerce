import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Sin globals de Vitest, Testing Library no limpia sola: cada render quedaria
// montado y el siguiente test encontraria dos veces el mismo elemento.
afterEach(cleanup)

/**
 * localStorage para las pruebas.
 *
 * <p>Node 25 expone un localStorage propio, a medio implementar, que tapa al
 * de jsdom: sin esto cualquier prueba que lo use falla con
 * "localStorage.clear is not a function". Se reemplaza por uno en memoria,
 * que además arranca vacío en cada prueba.
 */
class AlmacenamientoEnMemoria implements Storage {
  private datos = new Map<string, string>()

  get length() {
    return this.datos.size
  }

  clear() {
    this.datos.clear()
  }

  getItem(clave: string) {
    return this.datos.get(clave) ?? null
  }

  key(indice: number) {
    return [...this.datos.keys()][indice] ?? null
  }

  removeItem(clave: string) {
    this.datos.delete(clave)
  }

  setItem(clave: string, valor: string) {
    this.datos.set(clave, String(valor))
  }
}

const almacenamiento = new AlmacenamientoEnMemoria()

for (const objetivo of [globalThis, window]) {
  Object.defineProperty(objetivo, 'localStorage', {
    value: almacenamiento,
    configurable: true,
    writable: true,
  })
}

beforeEach(() => almacenamiento.clear())
