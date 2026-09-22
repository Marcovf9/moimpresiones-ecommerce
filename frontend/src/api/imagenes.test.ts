import { describe, expect, it } from 'vitest'
import { imagenOptimizada } from './imagenes'

const CLOUDINARY =
  'https://res.cloudinary.com/wadqifnu/image/upload/v1789680877/moimpresiones/foto.png'

/**
 * Sin estas transformaciones el sitio entrega los originales de varios MB.
 * Es la diferencia entre una ficha que abre al toque y una que no abre en
 * datos móviles, así que conviene que un cambio de formato falle acá.
 */
describe('imagenOptimizada', () => {
  it('pide la foto al ancho justo, en el formato que soporte el navegador', () => {
    const { src } = imagenOptimizada(CLOUDINARY, 480)

    expect(src).toBe(
      'https://res.cloudinary.com/wadqifnu/image/upload/f_auto,q_auto,c_limit,w_480/v1789680877/moimpresiones/foto.png',
    )
  })

  it('agrega la versión al doble para pantallas de alta densidad', () => {
    const { srcSet } = imagenOptimizada(CLOUDINARY, 480)

    expect(srcSet).toContain('w_480/')
    expect(srcSet).toContain('w_960/')
    expect(srcSet).toMatch(/ 1x, .* 2x$/)
  })

  it('deja intactas las URLs que no son de Cloudinary, como las del modo local', () => {
    const local = '/media/foto.png'

    expect(imagenOptimizada(local, 480)).toEqual({ src: local })
  })

  it('devuelve vacío cuando el producto todavía no tiene foto', () => {
    expect(imagenOptimizada(null, 480)).toEqual({ src: '' })
    expect(imagenOptimizada(undefined, 480)).toEqual({ src: '' })
  })
})
