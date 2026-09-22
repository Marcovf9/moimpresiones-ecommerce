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
 * Adjuntos en el disco del servidor, para desarrollo.
 *
 * <p>Van a una carpeta aparte de las fotos del catalogo, que ademas no se
 * publica como estatica: a estos archivos solo se llega por el panel.
 */
@Service
@ConditionalOnProperty(name = "app.attachment-provider", havingValue = "local", matchIfMissing = true)
public class LocalPrivateStorage implements PrivateFileStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalPrivateStorage.class);

    private final AppProperties properties;
    private Path raiz;

    public LocalPrivateStorage(AppProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() throws IOException {
        this.raiz = Paths.get(properties.getMediaStoragePath(), "adjuntos")
                .toAbsolutePath().normalize();
        Files.createDirectories(raiz);
        log.info("Adjuntos de cotizaciones en {}", raiz);
    }

    @Override
    public String store(MultipartFile file) {
        MediaTypes.requireNotEmpty(file);
        String nombre = UUID.randomUUID() + MediaTypes.extensionFor(file.getContentType());
        Path destino = resolver(nombre);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new InvalidMediaException("No pudimos guardar el archivo: " + ex.getMessage());
        }
        return nombre;
    }

    @Override
    public InputStream open(String storageKey) {
        try {
            return Files.newInputStream(resolver(storageKey));
        } catch (IOException ex) {
            throw new InvalidMediaException("No encontramos el archivo");
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(resolver(storageKey));
        } catch (IOException ex) {
            log.warn("No se pudo borrar el adjunto {}: {}", storageKey, ex.getMessage());
        }
    }

    /** La clave nunca puede escapar de la carpeta de adjuntos. */
    private Path resolver(String storageKey) {
        Path destino = raiz.resolve(storageKey).normalize();
        if (!destino.startsWith(raiz)) {
            throw new InvalidMediaException("Clave de archivo inválida");
        }
        return destino;
    }
}
