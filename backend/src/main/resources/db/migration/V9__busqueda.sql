-- Buscador que tolera tildes y encuentra por ficha técnica.
--
-- Antes solo miraba nombre, resumen, descripción y rubro, y distinguía tildes:
-- "comics" no encontraba "Cómics", y "troquelado" no encontraba nada aunque
-- varios productos lo ofrezcan.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Texto derivado, en minúsculas y sin tildes, con todo lo que vale la pena
-- buscar de un producto: sus datos y toda su ficha técnica.
ALTER TABLE products ADD COLUMN search_text TEXT;

CREATE OR REPLACE FUNCTION calcular_search_text(p_id BIGINT) RETURNS TEXT AS $$
    SELECT lower(unaccent(
        coalesce(p.name, '') || ' ' ||
        coalesce(p.summary, '') || ' ' ||
        coalesce(p.description, '') || ' ' ||
        coalesce(c.name, '') || ' ' ||
        coalesce((
            SELECT string_agg(s.label || ' ' || s.value, ' ')
            FROM product_specs s WHERE s.product_id = p.id
        ), '')
    ))
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = p_id;
$$ LANGUAGE sql STABLE;

-- Se mantiene con disparadores y no desde la aplicación: el texto sale de dos
-- tablas, y recordar actualizarlo en cada camino que las toca es una fuente
-- segura de datos desactualizados.
CREATE OR REPLACE FUNCTION refrescar_search_text_producto() RETURNS TRIGGER AS $$
BEGIN
    UPDATE products SET search_text = calcular_search_text(NEW.id) WHERE id = NEW.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refrescar_search_text_ficha() RETURNS TRIGGER AS $$
DECLARE
    afectado BIGINT := coalesce(NEW.product_id, OLD.product_id);
BEGIN
    UPDATE products SET search_text = calcular_search_text(afectado) WHERE id = afectado;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_search_text_producto
    AFTER INSERT OR UPDATE OF name, summary, description, category_id ON products
    FOR EACH ROW EXECUTE FUNCTION refrescar_search_text_producto();

CREATE TRIGGER trg_search_text_ficha
    AFTER INSERT OR UPDATE OR DELETE ON product_specs
    FOR EACH ROW EXECUTE FUNCTION refrescar_search_text_ficha();

-- Carga inicial para lo que ya existe.
UPDATE products SET search_text = calcular_search_text(id);

-- Índice de trigramas: sirve tanto para el LIKE con comodines a ambos lados
-- como para la búsqueda por parecido cuando el visitante escribe con errores.
CREATE INDEX idx_products_search_trgm ON products USING gin (search_text gin_trgm_ops);
