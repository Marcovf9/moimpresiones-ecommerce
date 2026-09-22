import { EMPRESA, domicilioCompleto, identificacionFiscal } from '../config/empresa'
import { useContactInfo } from '../hooks/useContactInfo'
import { usePageMeta } from '../hooks/usePageMeta'
import { metaDe } from '../config/paginas'
import { LegalPage, LegalSection } from '../components/LegalPage'

export function PrivacidadPage() {
  usePageMeta(metaDe('/privacidad'))

  const contact = useContactInfo()
  const fiscal = identificacionFiscal()
  const domicilio = domicilioCompleto()

  return (
    <LegalPage title="Política de privacidad" updatedAt="22 de septiembre de 2026">
      <LegalSection title="1. Responsable de los datos">
        <p>
          {EMPRESA.nombreComercial}
          {fiscal && <> ({fiscal})</>}
          {domicilio && <>, con domicilio en {domicilio}</>}, es responsable de la base de datos
          que se conforma con la información que enviás a través de este sitio.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recolectamos">
        <p>
          Únicamente los que cargás en el formulario de cotización: nombre y apellido, teléfono y,
          si querés, correo electrónico y empresa, junto con los datos del proyecto que querés
          presupuestar (producto, cantidad, formato, material, terminaciones y el detalle que nos
          escribas).
        </p>
        <p>
          El teléfono y el nombre son obligatorios porque son los que necesitamos para responderte.
          El resto es opcional.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué los usamos">
        <p>
          Exclusivamente para elaborar y enviarte el presupuesto que pediste, y para comunicarnos
          con vos sobre ese pedido.
        </p>
        <p>
          <strong>No vendemos ni cedemos tus datos a terceros</strong>, y no los usamos para
          enviarte publicidad no solicitada.
        </p>
      </LegalSection>

      <LegalSection title="4. WhatsApp">
        <p>
          Al enviar el formulario se abre WhatsApp con tu consulta ya redactada, para que la envíes
          vos. Esa conversación se rige por las políticas de WhatsApp, que es un servicio ajeno a
          nosotros. Los datos del formulario también quedan registrados en nuestro sistema, de modo
          que podamos responderte aunque no llegues a enviar el mensaje.
        </p>
      </LegalSection>

      <LegalSection title="5. Cuánto tiempo los conservamos">
        <p>
          Conservamos las consultas mientras sean útiles para la relación comercial. Podés pedirnos
          que las eliminemos en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies y estadísticas de visitas">
        <p>
          <strong>Este sitio no usa cookies</strong> de publicidad ni de seguimiento, ni comparte
          datos con Google ni con ninguna otra empresa de analítica.
        </p>
        <p>
          Sí llevamos una estadística propia de cuántas personas visitan el sitio y qué secciones
          miran, para saber qué les interesa. Para contar visitantes distintos sin identificar a
          nadie, el servidor genera un código a partir de la dirección IP, el navegador y la fecha
          del día. Ese código <strong>no se puede revertir</strong> para recuperar la dirección
          original y <strong>cambia todos los días</strong>, así que no permite seguir a una misma
          persona a lo largo del tiempo.
        </p>
        <p>
          No guardamos direcciones IP, ni identificadores de dispositivo, ni nada que permita
          reconocerte. De los enlaces por los que llega la gente guardamos únicamente el dominio
          (por ejemplo, «instagram.com»), nunca la dirección completa.
        </p>
        <p>
          El panel de administración guarda datos en el navegador de quien lo usa, solo para
          mantener la sesión iniciada.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Conforme a la Ley 25.326 de Protección de los Datos Personales, podés acceder a tus
          datos, rectificarlos, actualizarlos o pedir su supresión.
        </p>
        <p>
          Para ejercer estos derechos escribinos
          {contact?.email ? (
            <>
              {' '}a{' '}
              <a
                href={`mailto:${contact.email}`}
                className="text-brand-600 underline hover:text-brand-700"
              >
                {contact.email}
              </a>
            </>
          ) : (
            <> por cualquiera de nuestros canales de contacto</>
          )}
          .
        </p>
        <p className="text-sm text-ink-500">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a
          los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se
          acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso
          3 de la Ley 25.326. La Agencia de Acceso a la Información Pública, órgano de control de
          la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan
          quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en
          materia de protección de datos personales.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
