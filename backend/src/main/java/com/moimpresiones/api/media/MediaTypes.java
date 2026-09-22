package com.moimpresiones.api.media;

import java.util.Locale;
import java.util.Map;

/** Tipos de archivo que acepta el panel, compartidos por las dos implementaciones. */
final class MediaTypes {

    private static final Map<String, String> ALLOWED = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/avif", ".avif",
            "video/mp4", ".mp4",
            // Los diseños listos para imprimir llegan casi siempre en PDF.
            "application/pdf", ".pdf");

    private MediaTypes() {
    }

    /**
     * @return la extension que corresponde al tipo declarado por el navegador.
     * @throws InvalidMediaException si el tipo no esta permitido.
     */
    static String extensionFor(String contentType) {
        String normalized = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
        String extension = ALLOWED.get(normalized);
        if (extension == null) {
            throw new InvalidMediaException(
                    "Formato no admitido. Se aceptan JPG, PNG, WebP, AVIF, PDF y MP4.");
        }
        return extension;
    }

    static void requireNotEmpty(org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidMediaException("El archivo esta vacio");
        }
    }
}
