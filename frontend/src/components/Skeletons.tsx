/**
 * Siluetas grises que ocupan el lugar del contenido mientras carga.
 *
 * <p>Reemplazan al texto "Cargando...": la página se siente más rápida porque
 * el visitante ve enseguida la forma de lo que viene, en vez de una pantalla
 * vacía. El tiempo real de carga es el mismo.
 *
 * <p>Van con aria-hidden y el estado de carga se anuncia una sola vez con
 * role="status": para un lector de pantalla, describir cada silueta sería ruido.
 */

function Bloque({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className}`} />
}

/** Aviso invisible para lectores de pantalla, que no ven las siluetas. */
function Anuncio({ label }: { label: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  )
}

export function SkeletonTarjetaProducto() {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      <Bloque className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-5">
        <Bloque className="h-4 w-2/3" />
        <Bloque className="h-3 w-full" />
        <Bloque className="h-3 w-4/5" />
      </div>
    </div>
  )
}

export function SkeletonListadoProductos() {
  return (
    <div className="pt-24 pb-20" aria-busy="true">
      <Anuncio label="Cargando los productos" />
      <div className="mx-auto max-w-6xl px-6" aria-hidden="true">
        <Bloque className="h-3 w-24" />
        <Bloque className="mt-4 h-10 w-64" />
        <Bloque className="mt-4 h-4 w-full max-w-xl" />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bloque key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
          <div className="hidden rounded-2xl border border-ink-100 bg-white p-8 lg:block">
            <Bloque className="h-7 w-48" />
            <Bloque className="mt-3 h-4 w-full max-w-lg" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonTarjetaProducto key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonFichaProducto() {
  return (
    <div className="pt-24 pb-20" aria-busy="true">
      <Anuncio label="Cargando el producto" />
      <div className="mx-auto max-w-6xl px-6" aria-hidden="true">
        <Bloque className="h-3 w-40" />
        <Bloque className="mt-6 h-12 w-3/4 max-w-lg" />
        <Bloque className="mt-4 h-4 w-full max-w-2xl" />
        <Bloque className="mt-2 h-4 w-5/6 max-w-2xl" />
        <Bloque className="mt-10 aspect-[4/3] w-full rounded-2xl" />
        <div className="mt-4 flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bloque key={i} className="size-20 rounded-lg" />
          ))}
        </div>
        <Bloque className="mt-12 h-7 w-44" />
        <div className="mt-4 space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bloque key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonTerminaciones() {
  return (
    <div className="pt-24 pb-20" aria-busy="true">
      <Anuncio label="Cargando las terminaciones" />
      <div className="mx-auto max-w-6xl px-6" aria-hidden="true">
        <Bloque className="h-3 w-24" />
        <Bloque className="mt-4 h-10 w-72" />
        <Bloque className="mt-4 h-4 w-full max-w-xl" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Bloque className="aspect-[4/3] w-full rounded-xl" />
              <Bloque className="mt-3 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
