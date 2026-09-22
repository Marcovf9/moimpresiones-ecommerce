-- Una cotización pasa a poder pedir varios productos.
--
-- Antes cada pedido llevaba un solo producto en sus propias columnas, así que
-- un cliente que necesitaba tarjetas, carpetas y folletos tenía que mandar tres
-- consultas separadas.

CREATE TABLE quote_items (
    id            BIGSERIAL PRIMARY KEY,
    quote_id      BIGINT       NOT NULL REFERENCES quote_requests (id) ON DELETE CASCADE,
    -- Si el producto se elimina del catálogo, el pedido conserva el nombre.
    product_id    BIGINT       REFERENCES products (id) ON DELETE SET NULL,
    product_name  VARCHAR(180),
    quantity      VARCHAR(120),
    format        VARCHAR(180),
    material      VARCHAR(180),
    finishings    VARCHAR(500),
    notes         TEXT,
    display_order INTEGER      NOT NULL DEFAULT 0
);

CREATE INDEX idx_quote_items_quote ON quote_items (quote_id, display_order);
CREATE INDEX idx_quote_items_producto ON quote_items (product_id) WHERE product_id IS NOT NULL;

-- Las cotizaciones que ya existen pasan a tener un único ítem, para no perder
-- nada de lo que los clientes ya habían pedido.
INSERT INTO quote_items (quote_id, product_id, product_name, quantity, format, material, finishings, display_order)
SELECT id, product_id, product_name, quantity, format, material, finishings, 1
FROM quote_requests
WHERE product_id IS NOT NULL
   OR product_name IS NOT NULL
   OR quantity IS NOT NULL
   OR format IS NOT NULL
   OR material IS NOT NULL
   OR finishings IS NOT NULL;

-- Ya migradas, las columnas viejas sobran: dejarlas invitaría a escribir en
-- dos lugares distintos lo mismo.
ALTER TABLE quote_requests
    DROP COLUMN product_id,
    DROP COLUMN product_name,
    DROP COLUMN quantity,
    DROP COLUMN format,
    DROP COLUMN material,
    DROP COLUMN finishings;

-- Archivos que el cliente adjunta al pedir presupuesto (su diseño o un boceto).
--
-- Se guarda una clave de almacenamiento, no una URL pública: el diseño de un
-- cliente no tiene por qué quedar descargable por cualquiera que tenga el
-- enlace. Solo el panel, con sesión iniciada, puede abrirlos.
CREATE TABLE quote_attachments (
    id           BIGSERIAL PRIMARY KEY,
    quote_id     BIGINT       NOT NULL REFERENCES quote_requests (id) ON DELETE CASCADE,
    storage_key  VARCHAR(500) NOT NULL,
    filename     VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    size_bytes   BIGINT
);

CREATE INDEX idx_quote_attachments_quote ON quote_attachments (quote_id);
