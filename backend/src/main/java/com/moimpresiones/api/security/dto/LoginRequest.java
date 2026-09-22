package com.moimpresiones.api.security.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Ingresa tu usuario") String username,
        @NotBlank(message = "Ingresa tu contrasena") String password) {
}
