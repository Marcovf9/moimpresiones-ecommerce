import { useState } from 'react'
import { ApiError } from '../../api/client'
import type { Category } from '../../api/types'
import { adminApi } from '../adminClient'
import type { SaveCategoryPayload } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { toSlug } from '../slug'
import { Banner, Button, Card, Spinner, TextArea, TextField } from '../components/AdminUI'

const EMPTY: SaveCategoryPayload = { slug: '', name: '', description: '', displayOrder: 0 }

export function CategoriesPage() {
  const { data, loading, error, reload } = useAdminData<Category[]>(() => adminApi.categories(), [])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<SaveCategoryPayload>(EMPTY)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function startNew() {
    setEditing('nuevo')
    setForm({ ...EMPTY, displayOrder: (data?.length ?? 0) + 1 })
    setSaveError(null)
    setFieldErrors({})
  }

  function startEdit(category: Category) {
    setEditing(category.slug)
    setForm({
      slug: category.slug,
      name: category.name,
      description: category.description ?? '',
      displayOrder: category.displayOrder,
    })
    setSaveError(null)
    setFieldErrors({})
  }

  async function save() {
    setSaveError(null)
    setFieldErrors({})
    try {
      if (editing === 'nuevo') {
        await adminApi.createCategory(form)
      } else if (editing) {
        await adminApi.updateCategory(editing, form)
      }
      setEditing(null)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        if (Object.keys(err.fieldErrors).length === 0) setSaveError(err.message)
      } else {
        setSaveError('No pudimos guardar el rubro.')
      }
    }
  }

  async function remove(category: Category) {
    if (!window.confirm(`¿Eliminar el rubro "${category.name}"?`)) return
    try {
      await adminApi.deleteCategory(category.slug)
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No pudimos eliminar el rubro.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Rubros</h1>
          <p className="mt-1 text-ink-500">
            Agrupan los productos. El orden es el que ve el visitante en la página de Productos.
          </p>
        </div>
        <Button onClick={startNew}>Nuevo rubro</Button>
      </div>

      {loading && <Spinner label="Cargando rubros" />}
      {error && <Banner kind="error">{error}</Banner>}
      {saveError && <Banner kind="error">{saveError}</Banner>}

      {editing && (
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nombre"
              value={form.name}
              required
              error={fieldErrors.name}
              onChange={(value) =>
                setForm((f) => ({
                  ...f,
                  name: value,
                  slug: editing === 'nuevo' ? toSlug(value) : f.slug,
                }))
              }
            />
            <TextField
              label="Slug"
              value={form.slug}
              required
              error={fieldErrors.slug}
              onChange={(value) => setForm((f) => ({ ...f, slug: value }))}
            />
            <TextField
              label="Orden"
              type="number"
              value={String(form.displayOrder)}
              onChange={(value) => setForm((f) => ({ ...f, displayOrder: Number(value) || 0 }))}
            />
          </div>
          <div className="mt-5">
            <TextArea
              label="Descripción"
              rows={2}
              value={form.description}
              onChange={(value) => setForm((f) => ({ ...f, description: value }))}
            />
          </div>
          <div className="mt-5 flex gap-3">
            <Button onClick={save}>Guardar</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {data && (
        <ul className="space-y-3">
          {data.map((category) => (
            <li key={category.slug}>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium text-ink-900">{category.name}</h2>
                  <p className="text-sm text-ink-500">
                    {category.products.length}{' '}
                    {category.products.length === 1 ? 'producto' : 'productos'} · /{category.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => startEdit(category)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => remove(category)}>
                    Eliminar
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
