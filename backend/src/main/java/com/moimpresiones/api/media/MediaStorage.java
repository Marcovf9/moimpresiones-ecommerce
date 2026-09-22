package com.moimpresiones.api.media;

import org.springframework.web.multipart.MultipartFile;

/**
 * Donde viven las imagenes que sube el panel.
 *
 * <p>Hay dos implementaciones: disco local para desarrollo y Cloudinary para
 * produccion. Se elige con {@code app.media-provider}. El resto del codigo no
 * sabe cual esta activa: siempre recibe una URL publica lista para guardar.
 */
public interface MediaStorage {

    /**
     * @return la URL publica del archivo, lista para persistir en la base.
     * @throws InvalidMediaException si el archivo viene vacio o con un tipo no permitido.
     */
    String store(MultipartFile file);

    /** Borra el archivo asociado a una URL publica. No falla si ya no existe. */
    void delete(String publicUrl);
}
