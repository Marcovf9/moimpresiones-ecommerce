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
 * <p>Ademas, cada archivo lleva dentro de #root un resumen de la pagina en
 * HTML: titulo, texto y los enlaces del catalogo. React lo reemplaza apenas
 * arranca, asi que el visitante nunca lo ve como algo aparte, pero cambia dos
 * cosas: Google encuentra contenido aunque la API no conteste en ese instante
 * —lo dio por "Soft 404" cuando rastreo /productos justo durante un reinicio
 * del backend— y quien entra con el backend caido ve al menos que existen y
 * como se llaman los productos, en vez de un error.
 *
 * <p>Esto no es renderizado del lado del servidor: el cuerpo real lo arma
 * React. Lo incrustado es un resumen, no una copia de la pantalla.
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

function armarHtml(base, { titulo, descripcion, ruta, imagen, contenido, datos }) {
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

  if (contenido) {
    // Los datos van en un <script type="application/json">: el navegador no lo
    // ejecuta, y el sitio lo lee para arrancar con el catalogo ya cargado.
    const json = datos
      ? `<script id="datos-del-sitio" type="application/json">${JSON.stringify(datos).replaceAll(
          '</',
          '<\\/',
        )}</script>`
      : ''
    html = reemplazar(
      html,
      /<div id="root"><\/div>/,
      `<div id="root">${contenido}</div>${json}`,
    )
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

/** Texto plano, escapado, para el contenido incrustado. */
function texto(valor) {
  return escapar(valor ?? '')
}

function enlace(ruta, etiqueta) {
  return `<a href="${escapar(ruta)}">${texto(etiqueta)}</a>`
}

/**
 * Resumen de la pagina en HTML, para que el archivo no llegue vacio.
 *
 * <p>Usa las clases del sitio para que el cambio a la version de React no se
 * note: mismos colores y mismos margenes.
 */
function resumen({ titulo, descripcion, cuerpo = '' }) {
  return `<div class="mx-auto max-w-6xl px-6 pt-24 pb-14">
      <h1 class="font-display text-3xl font-semibold text-white sm:text-5xl">${texto(titulo)}</h1>
      <p class="mt-3 max-w-2xl text-ink-300 sm:text-lg">${texto(descripcion)}</p>
      ${cuerpo}
    </div>`
}

/** El catalogo entero como lista de enlaces. */
function cuerpoDelCatalogo(categorias) {
  return categorias
    .map(
      (categoria) => `<section class="mt-8">
        <h2 class="font-display text-2xl font-semibold text-white">${texto(categoria.name)}</h2>
        ${categoria.description ? `<p class="mt-1 text-ink-300">${texto(categoria.description)}</p>` : ''}
        <ul class="mt-3 space-y-1 text-ink-100">
          ${(categoria.products ?? [])
            .map(
              (producto) =>
                `<li>${enlace(`/productos/${producto.slug}`, producto.name)}${
                  producto.summary ? ` — ${texto(producto.summary)}` : ''
                }</li>`,
            )
            .join('\n          ')}
        </ul>
      </section>`,
    )
    .join('\n      ')
}

function cuerpoDeTerminaciones(terminaciones) {
  return `<ul class="mt-8 space-y-3 text-ink-100">
        ${terminaciones
          .map(
            (terminacion) =>
              `<li><strong class="text-white">${texto(terminacion.name)}</strong>${
                terminacion.description ? ` — ${texto(terminacion.description)}` : ''
              }</li>`,
          )
          .join('\n        ')}
      </ul>`
}

function cuerpoDeProducto(producto, categoria) {
  return `<p class="mt-4 text-ink-100">${texto(producto.summary ?? '')}</p>
      <p class="mt-6 text-ink-300">Rubro: ${enlace(
        `/productos?rubro=${categoria.slug}`,
        categoria.name,
      )}</p>
      <p class="mt-2 text-ink-300">${enlace('/cotiza', 'Pedí un presupuesto')} · ${enlace(
        '/terminaciones',
        'Ver las terminaciones',
      )}</p>`
}

/** La ficha completa de un producto, con su ficha tecnica. */
async function detalleDe(slug) {
  try {
    const respuesta = await fetch(`${API}/api/products/${slug}`, {
      signal: AbortSignal.timeout(20_000),
    })
    return respuesta.ok ? await respuesta.json() : null
  } catch {
    return null
  }
}

/** Las fichas de producto, con su propia foto para compartir. */
async function fichasDesde(categorias) {
  const fichas = categorias.flatMap((categoria) =>
    (categoria.products ?? []).map((producto) => {
      const descripcion =
        producto.summary ??
        'Materiales, formatos y terminaciones disponibles. Pedí tu presupuesto sin compromiso.'
      return {
        ruta: `/productos/${producto.slug}`,
        titulo: producto.name,
        descripcion,
        imagen: producto.coverImageUrl ?? undefined,
        contenido: resumen({
          titulo: producto.name,
          descripcion,
          cuerpo: cuerpoDeProducto(producto, categoria),
        }),
      }
    }),
  )

  // El detalle se pide de a uno: la lista del catalogo no trae la ficha
  // tecnica, que es la mitad de lo que muestra la pantalla del producto.
  for (const ficha of fichas) {
    const slug = ficha.ruta.replace('/productos/', '')
    const producto = await detalleDe(slug)
    if (producto) ficha.datos = { producto }
  }

  return fichas
}

/** Las terminaciones, para el resumen de esa pantalla. */
async function listaDeTerminaciones() {
  const respuesta = await fetch(`${API}/api/finishings`, { signal: AbortSignal.timeout(20_000) })
  if (!respuesta.ok) throw new Error(`La API respondio ${respuesta.status}`)
  return respuesta.json()
}

const base = await readFile(join(DIST, 'index.html'), 'utf8')

const destinos = Object.entries(paginas).map(([ruta, pagina]) => ({
  ruta,
  titulo: pagina.titulo,
  descripcion: pagina.descripcion,
  contenido: resumen({ titulo: pagina.titulo, descripcion: pagina.descripcion }),
}))

/** Devuelve el destino ya armado de una ruta fija, para completarle el cuerpo. */
function destinoDe(ruta) {
  return destinos.find((destino) => destino.ruta === ruta)
}

try {
  const categorias = await pedirCatalogo()

  const catalogo = destinoDe('/productos')
  catalogo.contenido = resumen({
    titulo: catalogo.titulo,
    descripcion: catalogo.descripcion,
    cuerpo: cuerpoDelCatalogo(categorias),
  })
  catalogo.datos = { categorias }

  // La portada muestra los rubros con su foto.
  destinoDe('/').datos = { categorias }

  destinos.push(...(await fichasDesde(categorias)))
} catch (error) {
  console.warn(
    `[prerender] Sin fichas de producto: ${error.message}. ` +
      'Se generan solo las pantallas fijas.',
  )
}

try {
  const terminaciones = await listaDeTerminaciones()
  const destino = destinoDe('/terminaciones')
  destino.contenido = resumen({
    titulo: destino.titulo,
    descripcion: destino.descripcion,
    cuerpo: cuerpoDeTerminaciones(terminaciones),
  })
  destino.datos = { terminaciones }
} catch (error) {
  console.warn(`[prerender] Sin el detalle de terminaciones: ${error.message}.`)
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
