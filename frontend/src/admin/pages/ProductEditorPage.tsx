import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { Category, ProductDetail } from '../../api/types'
import { adminApi } from '../adminClient'
import type { SaveProductPayload } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { toSlug } from '../slug'
import { Banner, Button, Card, SectionTitle, Spinner, TextArea, TextField } from '../components/AdminUI'
import { ImageUploader, type UploadedImage } from '../components/ImageUploader'
import { SpecEditor, type SpecRow } from '../components/SpecEditor'

interface FormState {
  categorySlug: string
  slug: string
  name: string
  summary: string
  description: string
  displayOrder: number
  active: boolean
  specs: SpecRow[]
  images: UploadedImage[]
}

const EMPTY: FormState = {
  categorySlug: '',
  slug: '',
  name: '',
  summary: '',
  description: '',
  displayOrder: 0,
  active: true,
  specs: [],
  images: [],
}

export function ProductEditorPage() {
  const { slug } = useParams()
  const isNew = slug === undefined
  const navigate = useNavigate()

  const { data: categories } = useAdminData<Category[]>(() => adminApi.categories(), [])
  const { data: existing, loading } = useAdminData<ProductDetail | null>(
    () => (isNew ? Promise.resolve(null) : adminApi.product(slug)),
    [slug],
  )

  const [form, setForm] = useState<FormState>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  /** En alta, el slug sigue al nombre hasta que alguien lo edita a mano. */
  const [slugTocado, setSlugTocado] = useState(!isNew)

  useEffect(() => {
    if (existing) {
      setForm({
        categorySlug: existing.categorySlug,
        slug: existing.slug,
        name: existing.name,
        summary: existing.summary ?? '',
        description: existing.description ?? '',
        displayOrder: 0,
        active: existing.active,
        specs: existing.specs.map((s) => ({ label: s.label, value: s.value })),
        images: existing.images.map((i) => ({ url: i.url, altText: i.altText ?? '' })),
      })
    }
  }, [existing])

  // Al crear, preseleccionamos el primer rubro para no dejar el select vacío.
  useEffect(() => {
    if (isNew && categories && categories.length > 0 && form.categorySlug === '') {
      setForm((current) => ({ ...current, categorySlug: categories[0].slug }))
    }
  }, [isNew, categories, form.categorySlug])

  function update(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setFieldErrors({})

    const payload: SaveProductPayload = {
      ...form,
      // Las filas vacías del editor no llegan al backend.
      specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
      images: form.images,
    }

    try {
      if (isNew) {
        await adminApi.createProduct(payload)
      } else {
        await adminApi.updateProduct(slug, payload)
      }
      navigate('/admin/productos')
    } catch (err) {
      setSaving(false)
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        if (Object.keys(err.fieldErrors).length === 0) setError(err.message)
      } else {
        setError('No pudimos guardar el producto.')
      }
    }
  }

  async function handleDelete() {
    if (isNew) return
    const confirmado = window.confirm(
      `¿Eliminar "${form.name}"? Se borran también sus fotos. No se puede deshacer.`,
    )
    if (!confirmado) return
    try {
      await adminApi.deleteProduct(slug)
      navigate('/admin/productos')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos eliminar el producto.')
    }
  }

  if (!isNew && loading) return <Spinner label="Cargando el producto" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            {isNew ? 'Nuevo producto' : form.name}
          </h1>
          {!isNew && <p className="mt-1 text-sm text-ink-500">/productos/{form.slug}</p>}
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/productos')}>
          Volver
        </Button>
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <Card>
        <SectionTitle>Datos básicos</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={form.name}
            required
            error={fieldErrors.name}
            onChange={(value) => {
              update({ name: value, ...(slugTocado ? {} : { slug: toSlug(value) }) })
            }}
          />
          <TextField
            label="Slug"
            value={form.slug}
            required
            error={fieldErrors.slug}
            hint="Es la dirección del producto en el sitio. Cambiarlo rompe los enlaces que ya circulan."
            onChange={(value) => {
              setSlugTocado(true)
              update({ slug: value })
            }}
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-900">
              Rubro<span className="text-brand-600"> *</span>
            </span>
            <select
              value={form.categorySlug}
              onChange={(event) => update({ categorySlug: event.target.value })}
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-ink-900 focus:border-ink-900 focus:outline-none"
            >
              {categories?.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.categorySlug && (
              <span className="mt-1 block text-sm text-brand-600">{fieldErrors.categorySlug}</span>
            )}
          </label>

          <label className="flex items-center gap-3 self-end pb-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => update({ active: event.target.checked })}
              className="size-4 rounded border-ink-300"
            />
            <span className="text-sm text-ink-900">
              Publicado
              <span className="block text-xs text-ink-500">
                Si lo destildás, deja de verse en el sitio.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 space-y-5">
          <TextField
            label="Resumen"
            value={form.summary}
            error={fieldErrors.summary}
            hint="Una línea. Es lo que se lee en el listado de productos."
            onChange={(value) => update({ summary: value })}
          />
          <TextArea
            label="Descripción"
            value={form.description}
            rows={4}
            error={fieldErrors.description}
            hint="El texto que abre la ficha del producto."
            onChange={(value) => update({ description: value })}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle>Fotos</SectionTitle>
        <ImageUploader images={form.images} onChange={(images) => update({ images })} />
      </Card>

      <Card>
        <SectionTitle>Ficha técnica</SectionTitle>
        <SpecEditor specs={form.specs} onChange={(specs) => update({ specs })} />
      </Card>

      <div className="flex flex-wrap justify-between gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        {!isNew && (
          <Button variant="danger" onClick={handleDelete}>
            Eliminar producto
          </Button>
        )}
      </div>
    </div>
  )
}
