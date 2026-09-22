import { Link } from 'react-router-dom'
import { EMPRESA, domicilioCompleto, identificacionFiscal } from '../config/empresa'
import { usePageMeta } from '../hooks/usePageMeta'
import { LegalPage, LegalSection } from '../components/LegalPage'

export function TerminosPage() {
  usePageMeta({
    title: 'Términos y condiciones',
    description:
      'Condiciones de uso del sitio de MO Impresiones y del servicio de solicitud de presupuestos.',
    path: '/terminos',
  })

  const fiscal = identificacionFiscal()
  const domicilio = domicilioCompleto()

  return (
    <LegalPage title="Términos y condiciones" updatedAt="1 de septiembre de 2026">
      <LegalSection title="1. Quiénes somos">
        <p>
          Este sitio pertenece a {EMPRESA.nombreComercial}
          {fiscal && <> ({fiscal})</>}, empresa gráfica con domicilio en{' '}
          {domicilio ?? `${EMPRESA.domicilio.ciudad}, ${EMPRESA.domicilio.provincia}, Argentina`}.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué ofrece este sitio">
        <p>
          El sitio tiene finalidad informativa: presenta nuestros productos, materiales y
          terminaciones, y permite solicitar un presupuesto.
        </p>
        <p>
          <strong>No es una tienda en línea.</strong> No se realizan compras ni pagos a través del
          sitio. Enviar el formulario de cotización no perfecciona ninguna venta ni genera
          obligación de contratar para ninguna de las partes.
        </p>
      </LegalSection>

      <LegalSection title="3. Presupuestos">
        <p>
          Los presupuestos se elaboran a pedido y se comunican por WhatsApp, correo electrónico u
          otro medio acordado. Salvo indicación expresa en contrario, tienen una validez de 7 días
          corridos desde su emisión, ya que dependen de precios de materiales sujetos a variación.
        </p>
        <p>
          Las características publicadas —materiales, formatos, cantidades mínimas y
          terminaciones— son orientativas y pueden variar según la disponibilidad de insumos y las
          particularidades de cada trabajo. Las condiciones definitivas son las del presupuesto
          aceptado.
        </p>
      </LegalSection>

      <LegalSection title="4. Archivos y responsabilidad sobre el contenido">
        <p>
          Quien encarga un trabajo declara ser titular de los derechos sobre los textos, imágenes,
          marcas y logotipos que nos entrega, o contar con autorización para reproducirlos, y
          responde por el contenido de lo que se imprime.
        </p>
        <p>
          Los archivos deben entregarse en las condiciones técnicas que se indiquen para cada
          trabajo. No respondemos por errores de ortografía, color o diseño presentes en el
          material provisto por el cliente y aprobado por este antes de la impresión.
        </p>
      </LegalSection>

      <LegalSection title="5. Colores">
        <p>
          Los colores que se ven en pantalla no coinciden exactamente con los impresos: cada
          monitor los reproduce distinto y los procesos de impresión tienen sus propias
          tolerancias. Para trabajos con color crítico, recomendamos solicitar una prueba física
          antes de la tirada.
        </p>
      </LegalSection>

      <LegalSection title="6. Plazos">
        <p>
          Los plazos de producción se informan en cada presupuesto y comienzan a correr desde la
          aprobación definitiva de los archivos y, cuando corresponda, desde la acreditación de la
          seña. Pueden verse afectados por causas ajenas a nuestro control, en cuyo caso lo
          comunicaremos a la brevedad.
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual del sitio">
        <p>
          Los textos, imágenes y el diseño de este sitio pertenecen a {EMPRESA.nombreComercial}. No
          está permitida su reproducción sin autorización previa.
        </p>
      </LegalSection>

      <LegalSection title="8. Datos personales">
        <p>
          El tratamiento de los datos que se cargan en el formulario de cotización se explica en
          nuestra{' '}
          <Link to="/privacidad" className="text-brand-600 underline hover:text-brand-700">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios en estos términos">
        <p>
          Podemos actualizar estos términos. La versión vigente es siempre la publicada en esta
          página, con su fecha de última actualización.
        </p>
      </LegalSection>

      <LegalSection title="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Ante cualquier
          controversia serán competentes los tribunales ordinarios de la ciudad de{' '}
          {EMPRESA.domicilio.ciudad}, provincia de {EMPRESA.domicilio.provincia}.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
