package com.moimpresiones.api.quote.dto;

/**
 * Respuesta al enviar el formulario: el id del pedido guardado y el enlace de
 * WhatsApp con el mensaje ya armado, que el frontend abre en una pestana nueva.
 */
public record QuoteCreatedResponse(Long id, String whatsappUrl) {
}
