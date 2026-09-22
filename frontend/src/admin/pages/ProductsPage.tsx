import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProductSummary } from '../../api/types'
import { adminApi } from '../adminClient'
import { useAdminData } from '../useAdminData'
import { Banner, EmptyState, Spinner } from '../components/AdminUI'

export function ProductsPage() {
  const { data, loading, error } = useAdminData<ProductSummary[]>(() => adminApi.products(), [])
  const [term, setTerm] = useState('')

  const filtered = useMemo(() => {
    if (!data) return []
    const needle = term.trim().toLowerCase()
    if (!needle) return data
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) || p.categoryName.toLowerCase().includes(needle),
    )
  }, [data, term])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Productos</h1>
          <p className="mt-1 text-ink-500">
            {data ? `${data.length} en el catálogo` : 'Cargando el catálogo'}
          </p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          Nuevo producto
        </Link>
      </div>

      {loading && <Spinner label="Cargando productos" />}
      {error && <Banner kind="error">{error}</Banner>}

      {data && (
        <>
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por nombre o rubro..."
            className="w-full max-w-sm rounded-lg border border-ink-300 px-3 py-2 text-sm focus:border-ink-900 focus:outline-none"
          />

          {filtered.length === 0 ? (
            <EmptyState>No hay productos que coincidan con «{term}».</EmptyState>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
              <table className="w-full min-w-[40rem] text-sm">
                <thead className="border-b border-ink-100 text-left text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Rubro</th>
                    <th className="px-4 py-3 font-medium">Fotos</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filtered.map((product) => (
                    <tr key={product.slug}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink-900">{product.name}</span>
                        <span className="block text-xs text-ink-500">/{product.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{product.categoryName}</td>
                      <td className="px-4 py-3">
                        {product.coverImageUrl ? (
                          <img
                            src={product.coverImageUrl}
                            alt=""
                            className="size-10 rounded object-cover"
                          />
                        ) : (
                          <span className="text-xs text-brand-600">Sin fotos</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/productos/${product.slug}`}
                          className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
