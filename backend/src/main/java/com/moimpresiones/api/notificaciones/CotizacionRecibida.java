package com.moimpresiones.api.notificaciones;

/**
 * Se publica cuando se guarda una cotizacion.
 *
 * <p>Lleva el mail ya armado y no la entidad: el envio corre en otro hilo,
 * despues de cerrada la transaccion, y ahi ya no se puede leer nada perezoso
 * de la base.
 */
public record CotizacionRecibida(Long cotizacionId, String asunto, String cuerpo) {
}
