import { useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import type { Finishing } from '../../api/types'
import { adminApi } from '../adminClient'
import type { SaveFinishingPayload } from '../adminTypes'
import { useAdminData } from '../useAdminData'
import { toSlug } from '../slug'
import { Banner, Button, Card, Spinner, TextArea, TextField } from '../components/AdminUI'

const EMPTY: SaveFinishingPayload = {
  slug: '',
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: 0,
}

export function FinishingsPage() {
  const { data, loading, error, reload } = useAdminData<Finishing[]>(() => adminApi.finishings(), [])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<SaveFinishingPayload>(EMPTY)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function startEdit(finishing: Finishing) {
    setEditing(finishing.slug)
    setForm({
      slug: finishing.slug,
      name: finishing.name,
      description: finishing.description,
      imageUrl: finishing.imageUrl ?? '',
      displayOrder: finishing.displayOrder,
    })
    setSaveError(null)
    setFieldErrors({})
  }

  function startNew() {
    setEditing('nuevo')
    setForm({ ...EMPTY, displayOrder: (data?.length ?? 0) + 1 })
    setSaveError(null)
    setFieldErrors({})
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setSaveError(null)
    try {
      const url = await adminApi.uploadMedia(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No pudimos subir la imagen.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function save() {
    setSaveError(null)
    setFieldErrors({})
    try {
      if (editing === 'nuevo') {
        await adminApi.createFinishing(form)
      } else if (editing) {
        await adminApi.updateFinishing(editing, form)
      }
      setEditing(null)
      reload()
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        if (Object.keys(err.fieldErrors).length === 0) setSaveError(err.message)
      } else {
        setSaveError('No pudimos guardar la terminación.')
      }
    }
  }

  async function remove(finishing: Finishing) {
    if (!window.confirm(`¿Eliminar la terminación "${finishing.name}"?`)) return
    try {
      await adminApi.deleteFinishing(finishing.slug)
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No pudimos eliminarla.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Terminaciones</h1>
          <p className="mt-1 text-ink-500">
            La página es visual: la foto es lo que más ayuda a que se entienda cada acabado.
          </p>
        </div>
        <Button onClick={startNew}>Nueva terminación</Button>
      </div>

      {loading && <Spinner label="Cargando terminaciones" />}
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
          </div>

          <div className="mt-5">
            <TextArea
              label="Descripción"
              rows={3}
              value={form.description}
              error={fieldErrors.description}
              onChange={(value) => setForm((f) => ({ ...f, description: value }))}
            />
          </div>

          <div className="mt-5">
            <span className="mb-1.5 block text-sm font-medium text-ink-900">Imagen</span>
            {form.imageUrl ? (
              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={form.imageUrl}
                  alt=""
                  className="aspect-[4/3] w-40 rounded-lg object-cover"
                />
                <Button variant="ghost" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}>
                  Quitar
                </Button>
              </div>
            ) : (
              <p className="text-sm text-ink-500">Sin imagen: se muestra un recuadro vacío.</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => uploadImage(event.target.files?.[0])}
              className="hidden"
            />
            <div className="mt-3">
              <Button
                variant="secondary"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? 'Subiendo...' : form.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </Button>
            </div>
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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((finishing) => (
            <li key={finishing.slug}>
              <Card className="flex h-full flex-col">
                {finishing.imageUrl ? (
                  <img
                    src={finishing.imageUrl}
                    alt=""
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid aspect-[4/3] w-full place-items-center rounded-lg border border-dashed border-ink-300 text-xs text-brand-600">
                    Sin imagen
                  </div>
                )}
                <h2 className="mt-3 font-medium text-ink-900">{finishing.name}</h2>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-ink-500">
                  {finishing.description}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => startEdit(finishing)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => remove(finishing)}>
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
