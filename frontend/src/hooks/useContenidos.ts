import { useEffect, useState } from 'react'
import { api } from '../api/client'
import institucional from '../config/institucional.json'
import { contenidosDelHtml } from '../api/datosDelHtml'

/**
 * Textos que el dueño edita desde el panel.
 *
 * <p>Antes vivían en el código: cambiar el horario de atención era una tarea
 * de programación y un despliegue. Ahora salen de la base.
 *
 * <p>Los valores de acá abajo son el respaldo. Se usan si la API no contesta,
 * y hacen que la pantalla nunca aparezca con un hueco donde debería haber un
 * texto. Al publicar, el HTML ya viene con los textos guardados, así que este
 * respaldo casi nunca se ve.
 */
export interface Contenidos {
  quienes_somos: string
  horario_atencion: string
  portada_bajada: string
  frase_destacada: string
}

export const CONTENIDOS_POR_DEFECTO: Contenidos = {
  quienes_somos: institucional.quienesSomos.join('\n\n'),
  horario_atencion: 'Lunes a viernes de 8 a 16 h, de corrido',
  portada_bajada:
    'Imprenta en Córdoba, Argentina. Más de 30 años de oficio gráfico, del pliego a la terminación final.',
  frase_destacada: 'Más de tres décadas imprimiendo ideas y construyendo relaciones.',
}

/** Los párrafos de un texto largo, separados por renglones vacíos. */
export function parrafos(texto: string): string[] {
  return texto
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)
}

export function useContenidos(): Contenidos {
  const [contenidos, setContenidos] = useState<Contenidos>(
    () => ({ ...CONTENIDOS_POR_DEFECTO, ...(contenidosDelHtml ?? {}) }),
  )

  useEffect(() => {
    let cancelado = false
    api
      .contenidos()
      .then((guardados) => {
        if (!cancelado) setContenidos((actuales) => ({ ...actuales, ...guardados }))
      })
      .catch(() => {
        // Sin respuesta se queda con lo que ya tenía: el sitio no puede
        // quedarse sin su texto institucional porque la API tardó.
      })
    return () => {
      cancelado = true
    }
  }, [])

  return contenidos
}
