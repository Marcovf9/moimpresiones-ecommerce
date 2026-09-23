-- Cuándo se avisó que una cotización seguía sin responder.
--
-- Se guarda para no repetir el recordatorio todos los días sobre el mismo
-- pedido: el aviso deja de servir apenas se vuelve rutina.
ALTER TABLE quote_requests
    ADD COLUMN recordatorio_enviado_en TIMESTAMPTZ;

-- Las que están pendientes son pocas frente al total, y son las únicas que
-- mira la tarea del recordatorio.
CREATE INDEX idx_quote_requests_recordatorio
    ON quote_requests (created_at)
    WHERE status = 'PENDIENTE' AND recordatorio_enviado_en IS NULL;
