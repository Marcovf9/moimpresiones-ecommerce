package com.moimpresiones.api.common;

import java.time.Instant;
import java.util.Map;

/** Cuerpo uniforme de error devuelto por la API. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors) {

    public static ApiError of(int status, String error, String message) {
        return new ApiError(Instant.now(), status, error, message, Map.of());
    }

    public static ApiError validation(String message, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), 400, "Bad Request", message, fieldErrors);
    }
}
