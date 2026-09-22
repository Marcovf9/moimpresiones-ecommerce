package com.moimpresiones.api.media;

import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

/**
 * Archivos que no deben ser publicos: los disenos que adjunta un cliente al
 * pedir presupuesto.
 *
 * <p>Es una interfaz aparte de {@link MediaStorage} a proposito. Las fotos del
 * catalogo se sirven por CDN y cuanto mas accesibles, mejor. Un archivo de un
 * cliente es lo contrario: solo tiene que poder abrirlo el panel, con la sesion
 * iniciada. Mezclar las dos cosas terminaria exponiendo lo que no corresponde.
 */
public interface PrivateFileStorage {

    /**
     * @return la clave con la que despues se recupera el archivo. No es una URL
     *         y no sirve para descargarlo sin pasar por el panel.
     */
    String store(MultipartFile file);

    /** Abre el archivo para que el panel lo envie a quien tiene sesion iniciada. */
    InputStream open(String storageKey);

    void delete(String storageKey);
}
