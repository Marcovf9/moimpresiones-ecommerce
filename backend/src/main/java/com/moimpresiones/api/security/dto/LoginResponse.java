package com.moimpresiones.api.security.dto;

/** Token de acceso al panel, con su duracion en minutos y el usuario que lo pidio. */
public record LoginResponse(String token, long expiresInMinutes, String username, String fullName) {
}
