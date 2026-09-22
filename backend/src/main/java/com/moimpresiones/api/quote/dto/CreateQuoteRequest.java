package com.moimpresiones.api.quote.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Datos que carga el visitante en la pagina "Cotiza tu proyecto". */
public record CreateQuoteRequest(
        @NotBlank(message = "Contanos tu nombre")
        @Size(max = 160, message = "El nombre es demasiado largo")
        String fullName,

        @NotBlank(message = "Necesitamos un telefono para responderte")
        @Size(max = 60, message = "El telefono es demasiado largo")
        String phone,

        @Email(message = "El email no parece valido")
        @Size(max = 180)
        String email,

        @Size(max = 180)
        String company,

        @Size(max = 4000, message = "El detalle es demasiado largo")
        String message,

        /** Al menos un producto: sin eso no hay nada que cotizar. */
        @NotEmpty(message = "Agregá al menos un producto")
        @Size(max = 20, message = "Son demasiados productos para un solo pedido")
        @Valid
        List<Item> items,

        /** Claves devueltas por /api/quotes/attachments. */
        @Size(max = 5, message = "Podés adjuntar hasta 5 archivos")
        @Valid
        List<Attachment> attachments) {

    public record Item(
            /** Slug del producto del catalogo, si se eligio uno. */
            @Size(max = 140) String productSlug,
            /** Producto escrito a mano, cuando no se eligio del catalogo. */
            @Size(max = 180) String productName,
            @Size(max = 120) String quantity,
            @Size(max = 180) String format,
            @Size(max = 180) String material,
            @Size(max = 500) String finishings,
            @Size(max = 2000) String notes) {
    }

    public record Attachment(
            @NotBlank @Size(max = 500) String storageKey,
            @NotBlank @Size(max = 255) String filename,
            @Size(max = 100) String contentType,
            Long sizeBytes) {
    }
}
