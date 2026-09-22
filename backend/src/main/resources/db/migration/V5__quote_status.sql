-- Seguimiento de las cotizaciones: el dueño necesita saber cuáles ya atendió.

ALTER TABLE quote_requests
    ADD COLUMN status         VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    ADD COLUMN internal_notes TEXT,
    ADD COLUMN answered_at    TIMESTAMPTZ;

-- Las consultas de la bandeja filtran por estado y ordenan por fecha.
CREATE INDEX idx_quote_requests_status ON quote_requests (status, created_at DESC);
