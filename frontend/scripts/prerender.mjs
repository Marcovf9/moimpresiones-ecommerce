/**
 * Genera un HTML por direccion despues del build de Vite.
 *
 * <p>El sitio es una sola pagina: el servidor devolvia el mismo index.html para
 * todas las direcciones, y ese archivo traia el titulo, la descripcion y el
 * canonical de la portada. React los corrige al arrancar, pero quien lee el
 * HTML sin ejecutar JavaScript ve otra cosa: Google, en su primera pasada,
 * entendia que /productos era una copia de la portada y la dejaba sin indexar
 * ("Pagina alternativa con etiqueta canonica adecuada"), y WhatsApp mostraba
 * la vista previa de la portada al compartir cualquier ficha.
 *
 * <p>Esto no es renderizado del lado del servidor: el cuerpo de la pagina sigue
 * armandolo React. Lo unico que cambia por direccion son las etiquetas del
 * encabezado, que es lo que leen los buscadores y las redes.
 *
 * <p>Si la API no responde al publicar, se generan igual las pantallas fijas y
 * el build no falla: es preferible publicar sin las fichas a no publicar.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const DIST = join(AQUI, '..', 'dist')
const SITIO = (process.env.SITE_URL ?? 'https://moimpresiones.com').replace(/\/$/, '')
const API = (process.env.VITE_API_URL ?? 'https://api.moimpresiones.com').replace(/\/$/, '')
const IMAGEN_POR_DEFECTO = `${SITIO}/imagenes/og.jpg`
const SUFIJO = 'MO Impresiones'

const paginas = JSON.parse(
  await readFile(join(AQUI, '..', 'src', 'config', 'paginas.json'), 'utf8'),
)

/** Escapa lo que se inserta en un atributo HTML. */
function escapar(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Reemplaza el valor de una etiqueta que ya existe en el HTML. */
function reemplazar(html, patron, reemplazo) {
  if (!patron.test(html)) {
    throw new Error(`No encontre esta etiqueta en dist/index.html: ${patron}`)
  }
  return html.replace(patron, reemplazo)
}

function armarHtml(base, { titulo, descripcion, ruta, imagen }) {
  const tituloCompleto = titulo === SUFIJO ? titulo : `${titulo} — ${SUFIJO}`
  const url = `${SITIO}${ruta}`
  let html = base

  html = reemplazar(html, /<title>[\s\S]*?<\/title>/, `<title>${escapar(tituloCompleto)}</title>`)
  html = reemplazar(
    html,
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta name="description" content="${escapar(descripcion)}" />`,
  )
  html = reemplazar(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${escapar(url)}" />`,
  )
  html = reemplazar(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${escapar(url)}" />`,
  )
  html = reemplazar(
    html,
    /<meta property="og:title" content="[\s\S]*?" \/>/,
    `<meta property="og:title" content="${escapar(tituloCompleto)}" />`,
  )
  html = reemplazar(
    html,
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/,
    `<meta property="og:description" content="${escapar(descripcion)}" />`,
  )
  html = reemplazar(
    html,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapar(imagen ?? IMAGEN_POR_DEFECTO)}" />`,
  )
  html = reemplazar(
    html,
    /<meta property="og:image:alt" content="[^"]*" \/>/,
    `<meta property="og:image:alt" content="${escapar(tituloCompleto)}" />`,
  )

  // Las medidas anunciadas son las de la imagen por defecto. La foto de un
  // producto tiene otras, y declarar unas que no son deja la vista previa
  // recortada.
  if (imagen) {
    html = html
      .replace(/\s*<meta property="og:image:width" content="[^"]*" \/>/, '')
      .replace(/\s*<meta property="og:image:height" content="[^"]*" \/>/, '')
  }

  return html
}

const esperar = (ms) => new Promise((seguir) => setTimeout(seguir, ms))

/**
 * Consulta el catalogo, reintentando.
 *
 * <p>El backend se reinicia en cada despliegue y en ese rato responde 502. Si
 * el build cae justo ahi, el sitio se publica sin las fichas: paso una vez, y
 * el aviso queda enterrado en el registro del build. Reintentar cubre esa
 * ventana, que dura menos de un minuto.
 */
async function pedirCatalogo(intentos = 5) {
  for (let intento = 1; ; intento++) {
    try {
      const respuesta = await fetch(`${API}/api/categories`, {
        signal: AbortSignal.timeout(20_000),
      })
      if (!respuesta.ok) throw new Error(`La API respondio ${respuesta.status}`)
      return await respuesta.json()
    } catch (error) {
      if (intento >= intentos) throw error
      console.warn(`[prerender] Intento ${intento} de ${intentos}: ${error.message}. Reintento...`)
      await esperar(15_000)
    }
  }
}

/** Las fichas de producto, con su propia foto para compartir. */
async function fichasDeProducto() {
  const categorias = await pedirCatalogo()
  return categorias.flatMap((categoria) =>
    (categoria.products ?? []).map((producto) => ({
      ruta: `/productos/${producto.slug}`,
      titulo: producto.name,
      descripcion:
        producto.summary ??
        'Materiales, formatos y terminaciones disponibles. Pedí tu presupuesto sin compromiso.',
      imagen: producto.coverImageUrl ?? undefined,
    })),
  )
}

const base = await readFile(join(DIST, 'index.html'), 'utf8')

const destinos = Object.entries(paginas).map(([ruta, pagina]) => ({
  ruta,
  titulo: pagina.titulo,
  descripcion: pagina.descripcion,
}))

try {
  destinos.push(...(await fichasDeProducto()))
} catch (error) {
  console.warn(
    `[prerender] Sin fichas de producto: ${error.message}. ` +
      'Se generan solo las pantallas fijas.',
  )
}

for (const destino of destinos) {
  const html = armarHtml(base, destino)
  // Un archivo plano (productos.html) y no una carpeta con index.html: con
  // carpeta, Netlify responde /productos con un 301 a /productos/, y el
  // canonical quedaria apuntando a una direccion que redirige. Asi la
  // direccion que se publica es la misma que se sirve.
  const salida = destino.ruta === '/' ? join(DIST, 'index.html') : join(DIST, `${destino.ruta}.html`)
  await mkdir(dirname(salida), { recursive: true })
  await writeFile(salida, html)
}

console.log(`[prerender] ${destinos.length} direcciones con su propio HTML`)
