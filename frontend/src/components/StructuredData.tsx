import { useEffect } from 'react'
import { EMPRESA, domicilioCompleto } from '../config/empresa'
import { useContactInfo } from '../hooks/useContactInfo'

const SCRIPT_ID = 'datos-estructurados-negocio'

/**
 * Datos estructurados schema.org para que Google entienda que esto es una
 * imprenta local de Córdoba. Es lo que alimenta la ficha del negocio en los
 * resultados de búsqueda.
 */
export function StructuredData() {
  const contact = useContactInfo()

  useEffect(() => {
    const domicilio = domicilioCompleto()

    const negocio: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'PrintingService',
      name: EMPRESA.nombreComercial,
      description:
        'Empresa gráfica familiar de Córdoba, Argentina, con más de 30 años de trayectoria en impresión offset, packaging, editorial e impresos numerados.',
      foundingDate: String(EMPRESA.fundacion),
      areaServed: { '@type': 'Country', name: 'Argentina' },
    }

    if (EMPRESA.sitioWeb) {
      negocio.url = EMPRESA.sitioWeb
      negocio.image = `${EMPRESA.sitioWeb}/imagenes/og.jpg`
      negocio.logo = `${EMPRESA.sitioWeb}/imagenes/logo.webp`
    }

    // En formato schema.org, no en texto libre: asi Google puede mostrar si
    // el local esta abierto en este momento.
    negocio.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: EMPRESA.horarioEstructurado.dias,
        opens: EMPRESA.horarioEstructurado.abre,
        closes: EMPRESA.horarioEstructurado.cierra,
      },
    ]

    negocio.geo = {
      '@type': 'GeoCoordinates',
      latitude: EMPRESA.domicilio.coordenadas.lat,
      longitude: EMPRESA.domicilio.coordenadas.lon,
    }
    if (contact?.email) negocio.email = contact.email
    if (contact?.whatsappNumber) negocio.telephone = `+${contact.whatsappNumber}`
    if (contact?.instagramUrl) negocio.sameAs = [contact.instagramUrl]

    // Sin calle cargada, publicamos solo la ciudad: es preferible a inventar una dirección.
    negocio.address = {
      '@type': 'PostalAddress',
      ...(domicilio ? { streetAddress: EMPRESA.domicilio.calle } : {}),
      ...(EMPRESA.domicilio.codigoPostal ? { postalCode: EMPRESA.domicilio.codigoPostal } : {}),
      addressLocality: EMPRESA.domicilio.ciudad,
      addressRegion: EMPRESA.domicilio.provincia,
      addressCountry: 'AR',
    }

    let script = document.getElementById(SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.setAttribute('type', 'application/ld+json')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(negocio)
  }, [contact])

  return null
}
