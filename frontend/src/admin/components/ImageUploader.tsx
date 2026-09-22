import { useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import { adminApi } from '../adminClient'
import { Banner, Button } from './AdminUI'

export interface UploadedImage {
  url: string
  altText: string
}

/**
 * Sube fotos al backend y arma la lista ordenada del producto.
 * La primera imagen es la portada: la que se ve en el listado y en el menu.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: UploadedImage[] = []
      for (const file of Array.from(files)) {
        const url = await adminApi.uploadMedia(file)
        uploaded.push({ url, altText: '' })
      }
      onChange([...images, ...uploaded])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No pudimos subir la imagen.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
          id="subir-fotos"
        />
        <Button
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Subiendo...' : 'Agregar fotos'}
        </Button>
        <span className="text-xs text-ink-500">JPG, PNG, WebP o AVIF. Hasta 8 MB cada una.</span>
      </div>

      {error && (
        <div className="mt-3">
          <Banner kind="error">{error}</Banner>
        </div>
      )}

      {images.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-ink-300 px-4 py-6 text-center text-sm text-ink-500">
          Sin fotos. En el sitio se muestra un cartel de "estamos preparando las fotos".
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.url} className="rounded-xl border border-ink-100 p-3">
              <div className="relative">
                <img
                  src={image.url}
                  alt=""
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-ink-900 px-2 py-0.5 text-xs text-white">
                    Portada
                  </span>
                )}
              </div>

              <input
                type="text"
                value={image.altText}
                onChange={(event) => {
                  const next = [...images]
                  next[index] = { ...image, altText: event.target.value }
                  onChange(next)
                }}
                placeholder="Descripción de la foto"
                className="mt-2 w-full rounded-lg border border-ink-300 px-2 py-1 text-xs focus:border-ink-900 focus:outline-none"
              />
              <span className="mt-1 block text-[10px] text-ink-500">
                Ayuda a quien usa lector de pantalla y al buscador de Google.
              </span>

              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover antes"
                  className="rounded px-2 py-1 text-xs text-ink-500 transition hover:bg-ink-100 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="Mover después"
                  className="rounded px-2 py-1 text-xs text-ink-500 transition hover:bg-ink-100 disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  className="ml-auto rounded px-2 py-1 text-xs text-brand-600 transition hover:bg-brand-500/10"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
