import { useEffect } from 'react'
import { EMPRESA } from '../config/empresa'

interface PageMeta {
  title: string
  description: string
  /** Ruta canónica, sin el dominio. Ej: '/productos/estuches' */
  path?: string
  /** Imagen para cuando el enlace se comparte por WhatsApp o redes. */
  image?: string
}

const SUFIJO = 'MO Impresiones';

/**
 * Ajusta título, descripción y etiquetas Open Graph de cada pantalla.
 *
 * <p>Es una SPA: sin esto todas las páginas comparten el título del index y
 * comparten mal en WhatsApp, que es por donde llega buena parte del tráfico.
 * Google ejecuta JavaScript, así que lee estos valores igual.
 */
export function usePageMeta({ title, description, path, image }: PageMeta) {
  useEffect(() => {
    const tituloCompleto = title === SUFIJO ? title : `${title} — ${SUFIJO}`
    document.title = tituloCompleto

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', tituloCompleto)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SUFIJO)
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')

    // Sin dominio configurado no publicamos URLs absolutas rotas.
    if (EMPRESA.sitioWeb && path) {
      const url = `${EMPRESA.sitioWeb}${path}`
      setMeta('property', 'og:url', url)
      setCanonical(url)
    }
    if (EMPRESA.sitioWeb && image) {
      setMeta('property', 'og:image', image.startsWith('http') ? image : `${EMPRESA.sitioWeb}${image}`)
    }
  }, [title, description, path, image])
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}
