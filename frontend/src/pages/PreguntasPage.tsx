import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { PageHeader } from '../components/PageChrome'
import { ChevronDownIcon } from '../components/Icons'
import { useContactInfo } from '../hooks/useContactInfo'

interface Pregunta {
  pregunta: string
  respuesta: React.ReactNode
}

/**
 * Preguntas frecuentes.
 *
 * <p>Todas las respuestas salen de datos reales: las fichas técnicas del
 * catálogo, los términos y condiciones, y lo que confirmó el cliente sobre
 * plazos, envíos y diseño. Nada acá es una respuesta de plantilla, porque una
 * respuesta inventada es algo que después alguien reclama.
 */
const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿Cuánto tarda un trabajo?',
    respuesta: (
      <>
        <p>
          Depende mucho de qué sea: no es lo mismo 500 tarjetas que un libro de 200 páginas con
          terminaciones especiales. La cantidad, el formato y los acabados cambian bastante el
          tiempo de producción.
        </p>
        <p className="mt-2">
          Por eso el plazo te lo confirmamos junto con el presupuesto, ya sabiendo qué hay que
          hacer. Preferimos darte una fecha real antes que una estimación que después no se
          cumple. Si tenés una fecha límite, contanosla desde el principio y te decimos si
          llegamos.
        </p>
      </>
    ),
  },
  {
    pregunta: '¿Hacen envíos o tengo que retirar?',
    respuesta: (
      <>
        <p>
          Las dos cosas. <strong>Enviamos a todo el país</strong> y también podés retirar el
          trabajo en el local, en José Javier Díaz 50, Córdoba.
        </p>
        <p className="mt-2">
          El costo del envío depende del destino y del volumen del pedido: consultanos y te lo
          pasamos junto con el presupuesto.
        </p>
      </>
    ),
  },
  {
    pregunta: '¿Ustedes hacen el diseño o tengo que traerlo hecho?',
    respuesta: (
      <>
        <p>
          Lo habitual es que el archivo venga listo para imprimir: así trabaja la gran mayoría de
          nuestros clientes. No somos un estudio de diseño.
        </p>
        <p className="mt-2">
          Dicho eso, si el trabajo es sencillo podemos resolverlo nosotros. Contanos qué necesitás
          y te decimos si podemos hacerlo o si conviene que lo prepare un diseñador.
        </p>
      </>
    ),
  },
  {
    pregunta: '¿Cuál es la cantidad mínima?',
    respuesta: (
      <>
        <p>
          Depende del producto. Las tarjetas y los sobres arrancan en 500 unidades, las carpetas
          institucionales en 250 y los individuales en 2000. En libros, revistas y cómics la mínima
          depende de la cantidad de páginas y el formato.
        </p>
        <p className="mt-2">
          La ficha de cada producto lo dice en la fila «Cantidad mínima».{' '}
          <Link to="/productos" className="text-brand-600 underline hover:text-brand-700">
            Ver el catálogo
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    pregunta: '¿Cuánto sale?',
    respuesta: (
      <p>
        No publicamos precios porque cambian con la cantidad, el papel, el formato y las
        terminaciones: el mismo producto puede costar muy distinto según cómo se haga.{' '}
        <Link to="/cotiza" className="text-brand-600 underline hover:text-brand-700">
          Pedí un presupuesto
        </Link>{' '}
        y te pasamos el número con el detalle.
      </p>
    ),
  },
  {
    pregunta: '¿Cómo se paga?',
    respuesta: <p>Aceptamos efectivo, transferencia bancaria y tarjeta.</p>,
  },
  {
    pregunta: '¿Los colores salen iguales a como los veo en pantalla?',
    respuesta: (
      <p>
        No exactamente. Cada monitor reproduce el color distinto y los procesos de impresión tienen
        sus tolerancias. Si el color es crítico para tu trabajo, pedinos una prueba física antes de
        la tirada.
      </p>
    ),
  },
  {
    pregunta: '¿Qué significan OPP, UV sectorizado, hot stamping?',
    respuesta: (
      <p>
        Son terminaciones: lo que se le hace a la pieza después de imprimirla.{' '}
        <Link to="/terminaciones" className="text-brand-600 underline hover:text-brand-700">
          Están todas explicadas con fotos
        </Link>
        , y en la ficha de cada producto podés tocar la que te interese para ver de qué se trata.
      </p>
    ),
  },
  {
    pregunta: '¿Puedo pedir una medida que no está en la lista?',
    respuesta: (
      <p>
        Sí. Casi todos los productos admiten medida personalizada, y en packaging la estructura se
        diseña a medida de cada producto. Contanos qué necesitás en el pedido de presupuesto.
      </p>
    ),
  },
  {
    pregunta: '¿Puedo mandarles mi diseño?',
    respuesta: (
      <p>
        Sí. Al pedir el presupuesto podés adjuntar el archivo en PDF, JPG o PNG. Revisamos que esté
        listo para imprimir y te avisamos si hay algo para ajustar antes de producir.
      </p>
    ),
  },
  {
    pregunta: '¿Venden por la página web?',
    respuesta: (
      <p>
        No. Este sitio muestra lo que hacemos y sirve para pedir presupuesto; no es una tienda en
        línea y no se cobra nada acá. Enviar el formulario no genera ninguna obligación.
      </p>
    ),
  },
]

export function PreguntasPage() {
  const contact = useContactInfo()

  usePageMeta({
    title: 'Preguntas frecuentes',
    description:
      'Cantidades mínimas, precios, formas de pago, terminaciones y archivos. Las dudas más comunes antes de pedir un presupuesto a MO Impresiones.',
    path: '/preguntas-frecuentes',
  })

  return (
    <div className="pt-20 pb-14 sm:pt-24 sm:pb-20">
      <PageHeader
        eyebrow="Dudas"
        title="Preguntas frecuentes"
        description="Lo que más nos consultan antes de encargar un trabajo."
      />

      <div className="mx-auto mt-7 max-w-3xl px-6 sm:mt-10">
        <ul className="divide-y divide-ink-100 rounded-2xl border border-white/10 bg-white">
          {PREGUNTAS.map((item, indice) => (
            <Desplegable key={indice} {...item} />
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/85 px-6 py-8 text-center text-white">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-ink-100">
            Escribinos y te respondemos. Sin compromiso.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {contact?.whatsappUrl && (
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#25D366] px-6 py-3 font-medium text-white transition hover:brightness-95"
              >
                Escribinos por WhatsApp
              </a>
            )}
            <Link
              to="/cotiza"
              className="rounded-full border border-white/40 px-6 py-3 font-medium transition hover:bg-white hover:text-ink-900"
            >
              Pedir presupuesto
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Desplegable({ pregunta, respuesta }: Pregunta) {
  const [abierta, setAbierta] = useState(false)

  return (
    <li>
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-ink-50"
      >
        <span className="font-medium text-ink-900">{pregunta}</span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-ink-500 transition-transform ${abierta ? 'rotate-180' : ''}`}
        />
      </button>
      {abierta && <div className="px-5 pb-5 text-ink-700">{respuesta}</div>}
    </li>
  )
}
