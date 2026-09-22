package com.moimpresiones.api.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SaveCategoryRequest(
        @NotBlank(message = "El slug es obligatorio")
        @Size(max = 120)
        @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*",
                message = "El slug solo admite minusculas, numeros y guiones")
        String slug,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 160)
        String name,

        String description,

        int displayOrder) {
}
