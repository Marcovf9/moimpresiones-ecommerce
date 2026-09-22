import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { BotonAgregarPresupuesto } from './BotonAgregarPresupuesto'
import { PresupuestoProvider } from '../hooks/usePresupuesto'
import type { ProductDetail } from '../api/types'

const PRODUCTO: ProductDetail = {
  id: 1,
  slug: 'carpetas-institucionales',
  name: 'Carpetas Institucionales',
  summary: null,
  description: null,
  categorySlug: 'institucional',
  categoryName: 'Institucional',
  active: true,
  images: [
    {
      id: 1,
      url: 'https://res.cloudinary.com/wadqifnu/image/upload/v1/foto.png',
      altText: null,
      displayOrder: 1,
    },
  ],
  specs: [],
  finishings: [],
}

function montar() {
  return render(
    <MemoryRouter>
      <PresupuestoProvider>
        <BotonAgregarPresupuesto product={PRODUCTO} />
      </PresupuestoProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('BotonAgregarPresupuesto', () => {
  it('confirma el agregado sin sacar al visitante de la ficha', async () => {
    montar()

    await userEvent.click(screen.getByRole('button', { name: /agregar a mi presupuesto/i }))

    expect(screen.getByText(/agregado a tu presupuesto/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir a pedir el presupuesto/i })).toHaveAttribute(
      'href',
      '/cotiza',
    )
  })

  it('al volver a la ficha con el producto ya cargado, no ofrece agregarlo de nuevo', () => {
    localStorage.setItem(
      'moimpresiones.presupuesto',
      JSON.stringify([{ productSlug: PRODUCTO.slug, productName: PRODUCTO.name }]),
    )

    montar()

    expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver mi presupuesto/i })).toBeInTheDocument()
  })
})
