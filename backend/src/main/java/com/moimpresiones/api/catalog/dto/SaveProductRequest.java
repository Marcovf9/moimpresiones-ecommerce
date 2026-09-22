package com.moimpresiones.api.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Alta y edicion de un producto desde el panel. La ficha tecnica y las fotos se
 * mandan completas: lo que llega reemplaza a lo que habia.
 */
public record SaveProductRequest(
        @NotBlank(message = "Elegi el rubro")
        @Size(max = 120)
        String categorySlug,

        @NotBlank(message = "El slug es obligatorio")
        @Size(max = 140)
        @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*",
                message = "El slug solo admite minusculas, numeros y guiones")
        String slug,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 180)
        String name,

        @Size(max = 500, message = "El resumen es demasiado largo")
        String summary,

        String description,

        int displayOrder,

        boolean active,

        @Valid List<SpecInput> specs,

        @Valid List<ImageInput> images) {

    public record SpecInput(
            @NotBlank(message = "La caracteristica no puede quedar vacia")
            @Size(max = 120) String label,

            @NotBlank(message = "El valor no puede quedar vacio")
            String value) {
    }

    public record ImageInput(
            @NotBlank(message = "Falta la URL de la imagen")
            @Size(max = 500) String url,

            @Size(max = 250) String altText) {
    }
}
