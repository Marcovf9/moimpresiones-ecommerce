package com.moimpresiones.api.media;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * El identificador es lo unico con lo que se puede borrar un archivo de
 * Cloudinary. Si el parseo falla, el borrado no rompe nada visible pero deja
 * archivos huerfanos acumulandose en la cuenta.
 */
class CloudinaryMediaStorageTest {

    @Test
    void extraeElIdentificadorDeUnaUrlConVersion() {
        String url = "https://res.cloudinary.com/mo-impresiones/image/upload/v1712345678/moimpresiones/abc-123.jpg";

        assertThat(CloudinaryMediaStorage.extractPublicId(url)).isEqualTo("moimpresiones/abc-123");
    }

    @Test
    void extraeElIdentificadorSinVersion() {
        String url = "https://res.cloudinary.com/mo-impresiones/image/upload/moimpresiones/abc-123.webp";

        assertThat(CloudinaryMediaStorage.extractPublicId(url)).isEqualTo("moimpresiones/abc-123");
    }

    @Test
    void funcionaConVideoYConTransformaciones() {
        String video = "https://res.cloudinary.com/mo-impresiones/video/upload/v1/moimpresiones/portada.mp4";
        assertThat(CloudinaryMediaStorage.extractPublicId(video)).isEqualTo("moimpresiones/portada");

        String conTransformacion =
                "https://res.cloudinary.com/mo-impresiones/image/upload/f_auto,q_auto/v1712/moimpresiones/tarjeta.png";
        assertThat(CloudinaryMediaStorage.extractPublicId(conTransformacion))
                .isEqualTo("moimpresiones/tarjeta");
    }

    @Test
    void enRawConservaLaExtensionDelIdentificador() {
        // Los PDF suben como recurso raw, y ahi la extensión es parte del
        // identificador: recortarla haría que el borrado no encuentre el archivo.
        String pdf = "https://res.cloudinary.com/wadqifnu/raw/upload/v1789/moimpresiones/abc-123.pdf";

        assertThat(CloudinaryMediaStorage.extractPublicId(pdf)).isEqualTo("moimpresiones/abc-123.pdf");
    }

    @Test
    void reconoceElTipoDeRecursoPorLaUrl() {
        // destroy sin resource_type asume "image" y no encuentra los PDF ni los videos.
        assertThat(CloudinaryMediaStorage.recursoDe(
                "https://res.cloudinary.com/x/raw/upload/v1/a.pdf")).isEqualTo("raw");
        assertThat(CloudinaryMediaStorage.recursoDe(
                "https://res.cloudinary.com/x/video/upload/v1/a.mp4")).isEqualTo("video");
        assertThat(CloudinaryMediaStorage.recursoDe(
                "https://res.cloudinary.com/x/image/upload/v1/a.png")).isEqualTo("image");
        assertThat(CloudinaryMediaStorage.recursoDe(null)).isEqualTo("image");
    }

    @Test
    void devuelveNullCuandoLaUrlNoEsDeCloudinary() {
        // Las URLs del modo local conviven en la base con las de Cloudinary.
        assertThat(CloudinaryMediaStorage.extractPublicId("/media/abc-123.jpg")).isNull();
        assertThat(CloudinaryMediaStorage.extractPublicId(null)).isNull();
        assertThat(CloudinaryMediaStorage.extractPublicId("https://ejemplo.com/foto.jpg")).isNull();
    }
}
