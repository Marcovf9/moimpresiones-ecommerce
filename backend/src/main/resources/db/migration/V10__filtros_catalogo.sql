-- Relación explícita entre productos y terminaciones, para poder filtrar.
--
-- Hoy las terminaciones de un producto viven como texto libre en su ficha
-- ("OPP mate o brillante, UV sectorizado, cuño en seco"). Eso se lee bien pero
-- no se puede consultar: alguien que quiere saber qué se puede hacer con hot
-- stamping no tiene manera de averiguarlo.

CREATE TABLE product_finishings (
    product_id   BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    finishing_id BIGINT NOT NULL REFERENCES finishings (id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, finishing_id)
);

CREATE INDEX idx_product_finishings_terminacion ON product_finishings (finishing_id);

-- Carga inicial: se deduce de lo que ya dice cada ficha. Es una lectura del
-- texto libre, así que puede quedar incompleta; el panel permite corregirla.
INSERT INTO product_finishings (product_id, finishing_id)
SELECT DISTINCT s.product_id, f.id
FROM product_specs s
JOIN finishings f ON TRUE
WHERE s.label IN ('Terminaciones', 'Troquelado')
  AND (
       (f.slug = 'plastificado-opp'    AND lower(unaccent(s.value)) LIKE '%opp%')
    OR (f.slug = 'barniz-uv'           AND lower(unaccent(s.value)) LIKE '%barniz uv%')
    OR (f.slug = 'uv-sectorizado'      AND lower(unaccent(s.value)) LIKE '%uv sectorizado%')
    OR (f.slug = 'hot-stamping'        AND lower(unaccent(s.value)) LIKE '%hot stamping%')
    OR (f.slug = 'troquelado'          AND lower(unaccent(s.value)) LIKE '%troquelad%')
    OR (f.slug = 'puntillado-numerado' AND (lower(unaccent(s.value)) LIKE '%puntillado%'
                                         OR lower(unaccent(s.value)) LIKE '%perforado%'
                                         OR lower(unaccent(s.value)) LIKE '%numerad%'))
    OR (f.slug = 'despuntado-esquinas' AND (lower(unaccent(s.value)) LIKE '%redondeado%'
                                         OR lower(unaccent(s.value)) LIKE '%despuntado%'))
    OR (f.slug = 'plegado'             AND lower(unaccent(s.value)) LIKE '%plegad%')
    OR (f.slug = 'cuno-en-seco'        AND lower(unaccent(s.value)) LIKE '%cuno en seco%')
  );

-- Material normalizado, para poder agrupar productos por el papel que usan.
-- Se guarda derivado del texto libre por el mismo motivo que arriba.
ALTER TABLE products ADD COLUMN material_text TEXT;

UPDATE products p
SET material_text = (
    SELECT lower(unaccent(string_agg(s.value, ' ')))
    FROM product_specs s
    WHERE s.product_id = p.id AND s.label = 'Material'
);
