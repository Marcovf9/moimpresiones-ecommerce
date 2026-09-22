-- Esquema inicial del catalogo de MO Impresiones

CREATE TABLE categories (
    id            BIGSERIAL PRIMARY KEY,
    slug          VARCHAR(120) NOT NULL UNIQUE,
    name          VARCHAR(160) NOT NULL,
    description   TEXT,
    display_order INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id            BIGSERIAL PRIMARY KEY,
    category_id   BIGINT       NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
    slug          VARCHAR(140) NOT NULL UNIQUE,
    name          VARCHAR(180) NOT NULL,
    summary       TEXT,
    description   TEXT,
    display_order INTEGER      NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products (category_id);

-- Ficha tecnica: pares caracteristica/opciones
CREATE TABLE product_specs (
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    label         VARCHAR(120) NOT NULL,
    value         TEXT         NOT NULL,
    display_order INTEGER      NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_specs_product ON product_specs (product_id);

CREATE TABLE product_images (
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    url           VARCHAR(500) NOT NULL,
    alt_text      VARCHAR(250),
    display_order INTEGER      NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_images_product ON product_images (product_id);

CREATE TABLE finishings (
    id            BIGSERIAL PRIMARY KEY,
    slug          VARCHAR(120) NOT NULL UNIQUE,
    name          VARCHAR(160) NOT NULL,
    description   TEXT         NOT NULL,
    image_url     VARCHAR(500),
    display_order INTEGER      NOT NULL DEFAULT 0
);

-- Cotizaciones enviadas desde el formulario (se guardan ademas de abrir WhatsApp)
CREATE TABLE quote_requests (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(160) NOT NULL,
    email         VARCHAR(180),
    phone         VARCHAR(60)  NOT NULL,
    company       VARCHAR(180),
    product_id    BIGINT       REFERENCES products (id) ON DELETE SET NULL,
    product_name  VARCHAR(180),
    quantity      VARCHAR(120),
    format        VARCHAR(180),
    material      VARCHAR(180),
    finishings    VARCHAR(500),
    message       TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_quote_requests_created ON quote_requests (created_at DESC);

CREATE TABLE admin_users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    full_name     VARCHAR(160),
    role          VARCHAR(40)  NOT NULL DEFAULT 'ROLE_ADMIN',
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
