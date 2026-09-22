-- El cliente unificó calendarios y almanaques en un solo producto: "Calendarios
-- personalizados". Antes de borrar almanaques, calendarios absorbe los dos datos
-- de su ficha que eran más precisos, para no perder información al unificar.

UPDATE product_specs SET value = 'OPP mate o brillante, perforado y terminaciones especiales'
WHERE label = 'Terminaciones'
  AND product_id = (SELECT id FROM products WHERE slug = 'calendarios-personalizados');

UPDATE product_specs SET value = 'Logo, colores, imágenes, fechas especiales, datos de contacto y diseño adaptado a cada empresa'
WHERE label = 'Personalización'
  AND product_id = (SELECT id FROM products WHERE slug = 'calendarios-personalizados');

-- La descripción pasa a cubrir también el uso promocional que traía almanaques.
UPDATE products
SET description = 'Calendarios y almanaques personalizados para empresas, marcas e instituciones, ideales como material promocional y para mantener la marca presente durante todo el año, acompañando acciones comerciales o regalos corporativos.',
    summary     = 'Presencia de marca durante todo el año.'
WHERE slug = 'calendarios-personalizados';

-- Las cotizaciones que apuntaban a almanaques conservan el nombre del producto:
-- product_id es ON DELETE SET NULL y product_name ya está guardado aparte.
DELETE FROM products WHERE slug = 'almanaques-personalizados';
