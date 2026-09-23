import { beforeEach, describe, expect, it } from 'vitest'
import { decisionGuardada, hayMedicion, registrarCotizacionEnviada } from './medicion'

/**
 * Sin identificadores de Google configurados —que es como corre el sitio en
 * desarrollo y en las pruebas— nada de esto debe cargar etiquetas ni pedir
 * cookies. Es lo que evita que un despliegue sin configurar empiece a medir
 * por su cuenta.
 */
describe('medición', () => {
  beforeEach(() => {
    localStorage.clear()
    delete (window as { dataLayer?: unknown[] }).dataLayer
  })

  it('no hay nada que medir sin identificadores', () => {
    expect(hayMedicion()).toBe(false)
  })

  it('sin decisión guardada, no inventa una', () => {
    expect(decisionGuardada()).toBeNull()
  })

  it('lee la decisión guardada y descarta cualquier otra cosa', () => {
    localStorage.setItem('moimpresiones.cookies', 'aceptado')
    expect(decisionGuardada()).toBe('aceptado')

    localStorage.setItem('moimpresiones.cookies', 'cualquier cosa')
    expect(decisionGuardada()).toBeNull()
  })

  it('registrar una conversión sin medición configurada no rompe ni deja rastro', () => {
    expect(() => registrarCotizacionEnviada()).not.toThrow()
    expect((window as { dataLayer?: unknown[] }).dataLayer).toBeUndefined()
  })
})
