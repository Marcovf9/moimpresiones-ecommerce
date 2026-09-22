package com.moimpresiones.api.media;

import com.moimpresiones.api.config.AppProperties;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Guarda las imagenes en el disco del servidor. Es el modo de desarrollo.
 *
 * <p><strong>No sirve para produccion en hosting con disco efimero</strong>
 * (Railway, Render, Fly): cada despliegue borraria todo lo que subio el cliente.
 * Para eso esta {@link CloudinaryMediaStorage}.
 *
 * <p>El nombre original que manda el navegador nunca se usa como ruta: se genera
 * un UUID y la extension sale del tipo de contenido, de modo que no hay forma de
 * escribir fuera de la carpeta configurada.
 */
@Service
@ConditionalOnProperty(name = "app.media-provider", havingValue = "local", matchIfMissing = true)
public class LocalMediaStorage implements MediaStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalMediaStorage.class);

    private final AppProperties properties;
    private Path storageRoot;

    public LocalMediaStorage(AppProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() throws IOException {
        this.storageRoot = Paths.get(properties.getMediaStoragePath()).toAbsolutePath().normalize();
        Files.createDirectories(storageRoot);
        log.info("Almacenamiento de medios: disco local en {}", storageRoot);
    }

    @Override
    public String store(MultipartFile file) {
        MediaTypes.requireNotEmpty(file);
        String extension = MediaTypes.extensionFor(file.getContentType());

        String filename = UUID.randomUUID() + extension;
        Path target = storageRoot.resolve(filename).normalize();
        if (!target.startsWith(storageRoot)) {
            throw new InvalidMediaException("Ruta de destino invalida");
        }

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new InvalidMediaException("No pudimos guardar el archivo: " + ex.getMessage());
        }

        return properties.getMediaPublicPath() + "/" + filename;
    }

    @Override
    public void delete(String publicUrl) {
        if (publicUrl == null || !publicUrl.startsWith(properties.getMediaPublicPath() + "/")) {
            return;
        }
        String filename = publicUrl.substring(properties.getMediaPublicPath().length() + 1);
        Path target = storageRoot.resolve(filename).normalize();
        if (!target.startsWith(storageRoot)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            log.warn("No se pudo borrar {}: {}", target, ex.getMessage());
        }
    }
}
