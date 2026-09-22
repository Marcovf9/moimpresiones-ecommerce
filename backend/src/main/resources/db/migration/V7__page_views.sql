-- Registro de visitas para los reportes del panel.
--
-- No se guarda ningún dato personal: ni IP, ni user agent, ni cookies. El
-- visitante se representa con visitor_hash, un SHA-256 de IP + user agent +
-- fecha + una sal del servidor. Al incluir la fecha, el hash cambia todos los
-- días, así que no permite seguir a nadie a lo largo del tiempo; y al ser un
-- resumen criptográfico, no se puede volver atrás para recuperar la IP.
--
-- Por eso el sitio no necesita cartel de cookies.

CREATE TABLE page_views (
    id            BIGSERIAL PRIMARY KEY,
    path          VARCHAR(300) NOT NULL,
    -- Cuando la visita es a una ficha, qué producto: alimenta "lo más visto".
    product_slug  VARCHAR(140),
    -- VARCHAR y no CHAR: CHAR rellena con espacios y eso ensucia la comparación de hashes.
    visitor_hash  VARCHAR(64)  NOT NULL,
    -- Solo el dominio de origen, nunca la URL completa (puede traer datos).
    referrer_host VARCHAR(200),
    occurred_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Los reportes siempre filtran por rango de fechas.
CREATE INDEX idx_page_views_fecha ON page_views (occurred_at DESC);
CREATE INDEX idx_page_views_producto ON page_views (product_slug, occurred_at DESC)
    WHERE product_slug IS NOT NULL;
CREATE INDEX idx_page_views_visitante ON page_views (visitor_hash, occurred_at DESC);
