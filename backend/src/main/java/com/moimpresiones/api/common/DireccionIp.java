package com.moimpresiones.api.common;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Direccion desde la que llega un pedido.
 *
 * <p>Detras del proxy de Render, {@code getRemoteAddr()} devuelve siempre la
 * direccion del proxy: la del visitante viaja en X-Forwarded-For, y la primera
 * de la lista es la suya. Se usa para acotar por IP, nunca para identificar a
 * nadie: los conteos de visitas guardan un hash, no la direccion.
 */
public final class DireccionIp {

    private DireccionIp() {
    }

    public static String de(HttpServletRequest http) {
        String reenviada = http.getHeader("X-Forwarded-For");
        if (reenviada != null && !reenviada.isBlank()) {
            return reenviada.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
