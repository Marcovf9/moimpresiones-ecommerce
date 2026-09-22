package com.moimpresiones.api.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Guarda los adjuntos en Cloudinary como recursos autenticados.
 *
 * <p>A diferencia de las fotos del catalogo, estos suben con type=authenticated:
 * no se entregan por URL publica ni aunque alguien la adivine. Para leerlos, el
 * servidor genera una URL firmada de corta vida y trae el contenido, que despues
 * el panel envia a quien tiene sesion iniciada.
 */
@Service
@ConditionalOnProperty(name = "app.attachment-provider", havingValue = "cloudinary")
public class CloudinaryPrivateStorage implements PrivateFileStorage {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryPrivateStorage.class);

    private static final String CARPETA = "moimpresiones/adjuntos";

    private final Cloudinary cloudinary;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public CloudinaryPrivateStorage() {
        this.cloudinary = new Cloudinary();
        if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()) {
            throw new IllegalStateException("Falta la variable de entorno CLOUDINARY_URL");
        }
    }

    @Override
    public String store(MultipartFile file) {
        MediaTypes.requireNotEmpty(file);
        String extension = MediaTypes.extensionFor(file.getContentType());
        // En recursos raw la extension forma parte del identificador.
        String publicId = CARPETA + "/" + UUID.randomUUID() + extension;

        try {
            cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "raw",
                    // La clave: sin esto el archivo quedaria accesible por URL.
                    "type", "authenticated",
                    "overwrite", false));
            return publicId;
        } catch (IOException ex) {
            log.error("Fallo la subida del adjunto: {}", ex.getMessage());
            throw new InvalidMediaException("No pudimos subir el archivo: " + ex.getMessage());
        }
    }

    @Override
    public InputStream open(String storageKey) {
        String firmada = urlFirmada(storageKey);
        try {
            HttpResponse<InputStream> respuesta = http.send(
                    HttpRequest.newBuilder(URI.create(firmada)).GET().build(),
                    HttpResponse.BodyHandlers.ofInputStream());
            if (respuesta.statusCode() != 200) {
                throw new InvalidMediaException(
                        "Cloudinary respondió " + respuesta.statusCode() + " al pedir el adjunto");
            }
            return respuesta.body();
        } catch (IOException ex) {
            throw new InvalidMediaException("No pudimos leer el archivo: " + ex.getMessage());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new InvalidMediaException("Se interrumpió la lectura del archivo");
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            cloudinary.uploader().destroy(storageKey, ObjectUtils.asMap(
                    "resource_type", "raw",
                    "type", "authenticated"));
        } catch (IOException ex) {
            log.warn("No se pudo borrar el adjunto {}: {}", storageKey, ex.getMessage());
        }
    }

    private String urlFirmada(String publicId) {
        return cloudinary.url().resourceType("raw").type("authenticated").signed(true)
                .generate(publicId);
    }
}
