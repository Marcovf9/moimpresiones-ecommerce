/**
 * Datos de la empresa que aparecen en las páginas legales, en el pie y en los
 * datos estructurados que lee Google.
 *
 * Todo lo que quede en cadena vacía se oculta del sitio, y las páginas legales
 * avisan que falta el dato.
 */
export const EMPRESA = {
  nombreComercial: 'MO Impresiones',

  /** Razón social completa, tal como figura en la constancia de AFIP. */
  razonSocial: 'Mariela Olocco',

  /** CUIT con guiones: 30-12345678-9 */
  cuit: '27-20310329-3',

  domicilio: {
    calle: 'José Javier Díaz 50',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    codigoPostal: '',
    pais: 'Argentina',
    /**
     * Coordenadas del local, para el marcador del mapa. Se obtuvieron
     * geocodificando la dirección con Nominatim (OpenStreetMap).
     */
    coordenadas: { lat: -31.4453068, lon: -64.1974441 },
  },

  /** Horario de atención, en texto libre. Ej: 'Lunes a viernes de 8 a 17 h'. */
  horarioAtencion: 'Lunes a viernes de 8 a 16 h, de corrido',

  /** Dominio propio, sin barra final. */
  sitioWeb: 'https://moimpresiones.com',

  fundacion: 1994,
} as const

/** Domicilio en una línea, o null si todavía no se cargó. */
export function domicilioCompleto(): string | null {
  const { calle, ciudad, provincia, codigoPostal } = EMPRESA.domicilio
  if (!calle) return null
  return [calle, codigoPostal, ciudad, provincia].filter(Boolean).join(', ')
}

/** Identificación fiscal para las páginas legales, o null si falta. */
export function identificacionFiscal(): string | null {
  if (!EMPRESA.razonSocial && !EMPRESA.cuit) return null
  return [EMPRESA.razonSocial, EMPRESA.cuit && `CUIT ${EMPRESA.cuit}`]
    .filter(Boolean)
    .join(' — ')
}
