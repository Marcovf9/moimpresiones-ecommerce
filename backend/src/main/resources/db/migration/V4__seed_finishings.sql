-- Terminaciones (documento "Terminaciones web")
-- image_url queda en NULL hasta que se carguen las fotos desde el panel admin.

INSERT INTO finishings (slug, name, description, display_order) VALUES
('plastificado-opp', 'Plastificado OPP — Brillante / Mate',
 'Aplicación de una película protectora sobre el impreso que mejora su resistencia y terminación. Disponible en mate, para un acabado más sobrio y elegante, o brillante, para resaltar colores y dar mayor intensidad visual.', 1),
('barniz-uv', 'Barniz UV',
 'Aplicación de un barniz que protege la impresión y mejora su acabado, aportando mayor brillo, resistencia y realce de los colores.', 2),
('uv-sectorizado', 'UV Sectorizado',
 'Aplicación de barniz UV en sectores específicos del impreso para resaltar logos, textos o detalles, generando contraste y un acabado premium.', 3),
('hot-stamping', 'Hot Stamping',
 'Aplicación de una película metalizada mediante calor y presión para resaltar logos, textos o detalles con un acabado elegante y llamativo.', 4),
('troquelado', 'Troquelado',
 'Proceso de corte que permite crear formas, contornos y diseños especiales en papel o cartulina, logrando terminaciones personalizadas.', 5),
('puntillado-numerado', 'Puntillado y Numerado',
 'Terminaciones que permiten facilitar el desprendimiento mediante líneas perforadas y agregar numeración correlativa en talonarios, entradas, formularios y otros impresos.', 6),
('despuntado-esquinas', 'Despuntado de esquinas',
 'Terminación que suaviza las puntas del impreso mediante cortes redondeados, logrando un acabado más prolijo y moderno. Se suele usar en tarjetas personales, naipes, etiquetas, invitaciones y piezas de packaging.', 7),
('plegado', 'Plegado',
 'Proceso que permite doblar el impreso en una o varias partes, logrando diferentes formatos para folletos, dípticos, trípticos, carpetas y otras piezas gráficas.', 8),
('cuno-en-seco', 'Cuño en Seco',
 'Terminación que genera un relieve sobre el papel o cartulina mediante presión, sin utilizar tinta, logrando un acabado elegante y distintivo.', 9);
