import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProductDetail } from '../api/types'
import { itemVacio, usePresupuesto } from '../hooks/usePresupuesto'

/**
 * Suma el producto a la lista de presupuesto sin sacar al visitante de la ficha.
 *
 * <p>Después de agregar no se navega a ningún lado a propósito: lo habitual es
 * seguir mirando y sumar otra pieza, y llevarlo al formulario cortaría eso.
 *
 * <p>Vive dentro del recuadro negro de la ficha, así que sus colores son para
 * fondo oscuro. Antes tenía texto y borde negros y no se veía.
 */
export function BotonAgregarPresupuesto({ product }: { product: ProductDetail }) {
  const { agregar, contiene } = usePresupuesto()
  const [recienAgregado, setRecienAgregado] = useState(false)
  const yaEsta = contiene(product.slug)

  function alAgregar() {
    agregar(
      itemVacio({
        productSlug: product.slug,
        productName: product.name,
        coverImageUrl: product.images[0]?.url ?? null,
      }),
    )
    setRecienAgregado(true)
  }

  if (yaEsta) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-300">
          Agregado a tu presupuesto
        </span>
        <Link
          to="/cotiza"
          className="text-sm font-medium text-brand-500 underline transition hover:text-brand-600"
        >
          {recienAgregado ? 'Ir a pedir el presupuesto' : 'Ver mi presupuesto'}
        </Link>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={alAgregar}
      className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-medium text-white transition hover:bg-white hover:text-ink-900"
    >
      Agregar a mi presupuesto
    </button>
  )
}
