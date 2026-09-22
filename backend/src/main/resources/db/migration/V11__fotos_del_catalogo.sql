-- Fotos del catalogo, que ya estan subidas a Cloudinary.
--
-- Hasta ahora solo existian en la base de desarrollo, cargadas con
-- scripts/importar_fotos.py: una base nueva (la de produccion) arrancaba con
-- los productos sin ninguna foto. Se asocian por slug porque los id cambian
-- de una base a otra.
--
-- Solo completa lo que falta: un producto que ya tiene fotos, o una
-- terminacion que ya tiene imagen, no se toca. Asi no pisa lo que se haya
-- cambiado desde el panel.

CREATE TEMPORARY TABLE fotos_catalogo (slug TEXT, url TEXT, alt_text TEXT, display_order INT);

INSERT INTO fotos_catalogo (slug, url, alt_text, display_order) VALUES
    ('anotadores-corporativos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680890/moimpresiones/90a8fc52-d397-4769-b3ef-ed0523efb43f.png', 'anotadores corporativos impresos por MO Impresiones (1 de 3)', 1),
    ('anotadores-corporativos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680892/moimpresiones/579e7388-0043-4694-a334-419a7fee623c.png', 'anotadores corporativos impresos por MO Impresiones (2 de 3)', 2),
    ('anotadores-corporativos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680894/moimpresiones/8e0f8c9a-cd6b-44e5-818a-d7c09d5adc4a.png', 'anotadores corporativos impresos por MO Impresiones (3 de 3)', 3),
    ('cajas-para-delivery', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680950/moimpresiones/ac07e0e6-7bc2-42c4-b925-46ddaca4276a.png', 'cajas para delivery impresos por MO Impresiones (1 de 2)', 1),
    ('cajas-para-delivery', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680952/moimpresiones/3787cf96-ecee-41af-bcac-5f69c617753d.png', 'cajas para delivery impresos por MO Impresiones (2 de 2)', 2),
    ('calendarios-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680970/moimpresiones/57cdf5a0-d8ae-4863-b669-5b7303d64317.png', 'calendarios personalizados impresos por MO Impresiones (1 de 4)', 1),
    ('calendarios-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680972/moimpresiones/e7fb94d5-def5-4811-91e9-3ddc4faa2f16.png', 'calendarios personalizados impresos por MO Impresiones (2 de 4)', 2),
    ('calendarios-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680974/moimpresiones/06092051-aaf2-44fd-9034-f4d9f27fccbc.png', 'calendarios personalizados impresos por MO Impresiones (3 de 4)', 3),
    ('calendarios-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680976/moimpresiones/89d5b716-7a06-4e6a-8e5e-86a88afaabb6.png', 'calendarios personalizados impresos por MO Impresiones (4 de 4)', 4),
    ('carpetas-institucionales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680877/moimpresiones/ea073f7d-0440-4034-a1da-f619281b46c5.png', 'carpetas institucionales impresos por MO Impresiones (1 de 3)', 1),
    ('carpetas-institucionales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680878/moimpresiones/f975b27e-de34-4c91-8b87-bce27d8918b9.png', 'carpetas institucionales impresos por MO Impresiones (2 de 3)', 2),
    ('carpetas-institucionales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680880/moimpresiones/6382ec59-f4ff-475c-9953-19059e7713b6.png', 'carpetas institucionales impresos por MO Impresiones (3 de 3)', 3),
    ('catalogos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680902/moimpresiones/93514bec-77f5-475b-8d34-109f3fa725e5.png', 'catalogos impresos por MO Impresiones', 1),
    ('collarines-cenefas-gondola', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680954/moimpresiones/d81a09c6-f32b-4775-a1f5-061f69649338.png', 'collarines cenefas gondola impresos por MO Impresiones (1 de 2)', 1),
    ('collarines-cenefas-gondola', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680956/moimpresiones/f060df06-50fa-42a5-a63c-ad52a36878ef.png', 'collarines cenefas gondola impresos por MO Impresiones (2 de 2)', 2),
    ('comics', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680923/moimpresiones/dc5a1ff6-8b02-4ece-9d7d-5372c2c32b1a.png', 'comics impresos por MO Impresiones (1 de 2)', 1),
    ('comics', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680925/moimpresiones/99f8a24c-be5e-465b-9825-5d04f0b3606f.png', 'comics impresos por MO Impresiones (2 de 2)', 2),
    ('cuadernos-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680962/moimpresiones/e2e3e5cd-6acf-48d9-a1d9-6dfa9f106f6e.png', 'cuadernos personalizados impresos por MO Impresiones (1 de 4)', 1),
    ('cuadernos-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680964/moimpresiones/e53e5fe3-73c1-4f67-b0b1-376dea34df57.png', 'cuadernos personalizados impresos por MO Impresiones (2 de 4)', 2),
    ('cuadernos-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680966/moimpresiones/7bc546a0-d88b-4331-91b4-0b3982bed339.png', 'cuadernos personalizados impresos por MO Impresiones (3 de 4)', 3),
    ('cuadernos-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680968/moimpresiones/aabaa561-b53e-440f-ae87-92bb050e03af.png', 'cuadernos personalizados impresos por MO Impresiones (4 de 4)', 4),
    ('entradas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680940/moimpresiones/cc37d2d1-ce82-4126-ab89-4bc4f902a0ee.png', 'entradas impresos por MO Impresiones', 1),
    ('estuches', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680942/moimpresiones/06174c36-58c1-4231-9fa2-9ad83ff8c93b.png', 'estuches impresos por MO Impresiones (1 de 2)', 1),
    ('estuches', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680944/moimpresiones/4b69f64b-9351-4037-80f4-7672d9c5134c.png', 'estuches impresos por MO Impresiones (2 de 2)', 2),
    ('etiquetas-autoadhesivas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680946/moimpresiones/5bc16f75-28e3-4218-aa79-f3b3acafc8b6.png', 'etiquetas autoadhesivas impresos por MO Impresiones (1 de 2)', 1),
    ('etiquetas-autoadhesivas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680948/moimpresiones/e9e70205-0fa3-4ee5-ad39-926c09a7be56.png', 'etiquetas autoadhesivas impresos por MO Impresiones (2 de 2)', 2),
    ('folletos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680896/moimpresiones/aa66012b-4988-4214-a1c9-6ff75081174f.png', 'folletos impresos por MO Impresiones (1 de 3)', 1),
    ('folletos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680898/moimpresiones/a5d7b108-7922-406e-9dcc-570d446af697.png', 'folletos impresos por MO Impresiones (2 de 3)', 2),
    ('folletos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680900/moimpresiones/59808c4f-1159-4c65-8851-15a820abdb23.png', 'folletos impresos por MO Impresiones (3 de 3)', 3),
    ('individuales-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680905/moimpresiones/255ee4fb-4c54-41c0-9169-0652be448583.png', 'individuales personalizados impresos por MO Impresiones (1 de 3)', 1),
    ('individuales-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680907/moimpresiones/5394b0ca-2ad7-40ce-8d5c-f70dd7eb40d5.png', 'individuales personalizados impresos por MO Impresiones (2 de 3)', 2),
    ('individuales-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680909/moimpresiones/c550ee0f-d0d1-4adf-b7a9-b2842a340332.png', 'individuales personalizados impresos por MO Impresiones (3 de 3)', 3),
    ('libros', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680912/moimpresiones/d4775f14-5944-47b7-bcf6-42dac0f4077b.png', 'libros impresos por MO Impresiones (1 de 4)', 1),
    ('libros', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680914/moimpresiones/421023ac-46f3-49f8-91bf-cdfad327c215.png', 'libros impresos por MO Impresiones (2 de 4)', 2),
    ('libros', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680916/moimpresiones/0b906c89-f2b4-4fd1-a501-7d623c0a8a90.png', 'libros impresos por MO Impresiones (3 de 4)', 3),
    ('libros', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680919/moimpresiones/901985cd-ed44-48a3-9840-4b89754d9a1c.png', 'libros impresos por MO Impresiones (4 de 4)', 4),
    ('manuales-instructivos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680927/moimpresiones/79d27de2-c958-4aeb-9d6b-b1f0634e903b.png', 'manuales instructivos impresos por MO Impresiones (1 de 2)', 1),
    ('manuales-instructivos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680929/moimpresiones/816595cd-6574-4969-b97e-4f8abffd1366.png', 'manuales instructivos impresos por MO Impresiones (2 de 2)', 2),
    ('naipes-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680958/moimpresiones/a7e0d404-e6cc-4ca8-a029-89108ffb8b64.png', 'naipes personalizados impresos por MO Impresiones (1 de 2)', 1),
    ('naipes-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680960/moimpresiones/6aade0cc-eea5-4bd8-9d46-fa387dea48bb.png', 'naipes personalizados impresos por MO Impresiones (2 de 2)', 2),
    ('remitos', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680934/moimpresiones/a8474178-05cd-4d8d-ac89-48799d1a9b31.png', 'remitos impresos por MO Impresiones', 1),
    ('revistas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680921/moimpresiones/35156511-f5ae-4090-a1c1-86f9045f3896.png', 'revistas impresos por MO Impresiones', 1),
    ('rifas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680936/moimpresiones/5ce9425c-96ea-4b6c-a765-e4c1b3570ff9.png', 'rifas impresos por MO Impresiones (1 de 2)', 1),
    ('rifas', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680938/moimpresiones/346bbee1-c6c4-45d4-9437-38e771cdd405.png', 'rifas impresos por MO Impresiones (2 de 2)', 2),
    ('sobres-personalizados', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680888/moimpresiones/9f862285-412e-4d23-8b62-a5e7e3355b7f.png', 'sobres personalizados impresos por MO Impresiones', 1),
    ('talonarios', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680932/moimpresiones/08f21511-4569-4fac-a08a-e7b5bd6fb2a0.png', 'talonarios impresos por MO Impresiones', 1),
    ('tarjetas-personales-empresariales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680882/moimpresiones/56b09a4b-4c81-4e17-8a88-9ccec1d7fa51.png', 'tarjetas personales empresariales impresos por MO Impresiones (1 de 3)', 1),
    ('tarjetas-personales-empresariales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680885/moimpresiones/230cfd20-c8ad-45cd-9ed7-e740f8844c9c.png', 'tarjetas personales empresariales impresos por MO Impresiones (2 de 3)', 2),
    ('tarjetas-personales-empresariales', 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680886/moimpresiones/5774e97b-e1ef-4b84-9580-cbe68c525315.png', 'tarjetas personales empresariales impresos por MO Impresiones (3 de 3)', 3);

INSERT INTO product_images (product_id, url, alt_text, display_order)
SELECT p.id, f.url, f.alt_text, f.display_order
FROM fotos_catalogo f
JOIN products p ON p.slug = f.slug
WHERE NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id)
ORDER BY p.id, f.display_order;

DROP TABLE fotos_catalogo;

UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680980/moimpresiones/884b9b96-1792-47ab-9d66-2441a6691ade.png' WHERE slug = 'barniz-uv' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680994/moimpresiones/4cbcd357-9efd-4c2c-b926-ef3b89e3460b.png' WHERE slug = 'cuno-en-seco' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680989/moimpresiones/1c15b754-744a-4f30-b91c-91102715537c.png' WHERE slug = 'despuntado-esquinas' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680983/moimpresiones/9ca9b85d-b220-41ca-95d0-98de2d5afa3f.png' WHERE slug = 'hot-stamping' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680978/moimpresiones/62c792b1-a88b-4ddd-a2fe-8d3b8c286df6.png' WHERE slug = 'plastificado-opp' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680992/moimpresiones/08c6d7e0-07bb-4cec-9f22-0834d6048b79.png' WHERE slug = 'plegado' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680988/moimpresiones/63fdd856-5a84-4c71-b7e2-69216c5c7014.png' WHERE slug = 'puntillado-numerado' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680986/moimpresiones/41c45424-4073-4b3c-83cd-b3332900ed26.png' WHERE slug = 'troquelado' AND image_url IS NULL;
UPDATE finishings SET image_url = 'https://res.cloudinary.com/wadqifnu/image/upload/v1789680981/moimpresiones/f37c27da-961c-4c91-bc6f-829ffb5b920f.png' WHERE slug = 'uv-sectorizado' AND image_url IS NULL;
