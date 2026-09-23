-- Textos del sitio que el dueño puede cambiar sin tocar el código.
--
-- Hasta ahora vivían en el frontend: cambiar el horario de atención o un
-- párrafo de "quiénes somos" era una tarea de programación y un despliegue.
-- Son pocos y no cambian seguido, así que alcanza con clave y valor: una
-- tabla por cada texto sería más de lo que el problema pide.
CREATE TABLE contenidos (
    clave          VARCHAR(60) PRIMARY KEY,
    valor          TEXT        NOT NULL,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Los valores actuales, para que el sitio siga mostrando lo mismo.
INSERT INTO contenidos (clave, valor) VALUES
('quienes_somos',
 'Somos una empresa gráfica familiar de Córdoba, Argentina, con más de 30 años de trayectoria en la industria.

Desde 1994, trabajamos acompañando a empresas, comercios y emprendimientos en el desarrollo de sus proyectos gráficos, combinando experiencia, calidad y atención personalizada.

A lo largo de los años fuimos creciendo, incorporando tecnología y ampliando nuestras capacidades de producción, sin perder la esencia que nos caracteriza desde el comienzo: el compromiso con cada trabajo y la cercanía con nuestros clientes.

Hoy seguimos apostando a la industria gráfica, ofreciendo soluciones a medida y cuidando cada etapa del proceso, desde la impresión hasta la terminación final.'),
('horario_atencion', 'Lunes a viernes de 8 a 16 h, de corrido'),
('portada_bajada',
 'Imprenta en Córdoba, Argentina. Más de 30 años de oficio gráfico, del pliego a la terminación final.'),
('frase_destacada', 'Más de tres décadas imprimiendo ideas y construyendo relaciones.');
