package com.moimpresiones.api.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Sube las imagenes a Cloudinary y guarda la URL del CDN.
 *
 * <p>Es el modo de produccion: a diferencia del disco local, lo que sube el
 * cliente sobrevive a los despliegues, y Cloudinary entrega cada imagen ya
 * optimizada segun el dispositivo que la pide.
 *
 * <p>Las credenciales se leen de la variable de entorno {@code CLOUDINARY_URL}
 * ({@code cloudinary://<api_key>:<api_secret>@<cloud_name>}), que es la
 * convencion del propio SDK. Nunca van en el repositorio.
 */
@Service
@ConditionalOnProperty(name = "app.media-provider", havingValue = "cloudinary")
public class CloudinaryMediaStorage implements MediaStorage {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryMediaStorage.class);

    /** Carpeta dentro de la cuenta, para no mezclar con otros proyectos. */
    private static final String CARPETA = "moimpresiones";

    private static final String MARCA_SUBIDA = "/upload/";

    /** Segmento de version: v1712345678. */
    private static final Pattern VERSION = Pattern.compile("v\\d+");

    /**
     * Segmento de transformacion: f_auto, w_500, o varios separados por coma.
     * Se compara contra los prefijos reales de Cloudinary y no contra cualquier
     * cosa con guion bajo, para no confundir una carpeta con una transformacion.
     */
    private static final Pattern TRANSFORMACION = Pattern.compile(
            "(w|h|c|f|q|g|x|y|r|e|a|b|o|t|u|z|l|d|ar|bo|co|cs|du|eo|fl|fn|so|vc|br|ac|af|dpr|pg|ki)"
                    + "_[A-Za-z0-9.:%_-]+(,[a-z]{1,3}_[A-Za-z0-9.:%_-]+)*");

    private final Cloudinary cloudinary;

    public CloudinaryMediaStorage() {
        // Sin CLOUDINARY_URL definida el SDK arranca sin credenciales y toda
        // subida falla; avisamos temprano para que no se descubra en produccion.
        this.cloudinary = new Cloudinary();
        if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()) {
            throw new IllegalStateException(
                    "app.media-provider=cloudinary pero falta la variable de entorno CLOUDINARY_URL");
        }
        log.info("Almacenamiento de medios: Cloudinary (cuenta {})", cloudinary.config.cloudName);
    }

    @Override
    public String store(MultipartFile file) {
        MediaTypes.requireNotEmpty(file);
        // Valida el tipo igual que el modo local, antes de gastar una subida.
        MediaTypes.extensionFor(file.getContentType());

        String tipo = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String recurso = switch (tipo) {
            case "video/mp4" -> "video";
            // raw y no image: asi el PDF se descarga tal cual, sin que
            // Cloudinary intente rasterizarlo ni pida permisos de entrega.
            case "application/pdf" -> "raw";
            default -> "image";
        };

        // En recursos raw el identificador incluye la extension, y ademas hace
        // falta que la URL la traiga para que el navegador sepa que abrir.
        String nombre = CARPETA + "/" + UUID.randomUUID()
                + ("raw".equals(recurso) ? MediaTypes.extensionFor(tipo) : "");

        try {
            Map<?, ?> resultado = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", nombre,
                            "resource_type", recurso,
                            "overwrite", false));

            Object url = resultado.get("secure_url");
            if (url == null) {
                throw new InvalidMediaException("Cloudinary no devolvio una URL");
            }
            return url.toString();

        } catch (IOException ex) {
            log.error("Fallo la subida a Cloudinary: {}", ex.getMessage());
            throw new InvalidMediaException("No pudimos subir el archivo: " + ex.getMessage());
        }
    }

    @Override
    public void delete(String publicUrl) {
        String publicId = extractPublicId(publicUrl);
        if (publicId == null) {
            return;
        }
        String recurso = recursoDe(publicUrl);
        try {
            // Sin resource_type, destroy asume "image" y no encuentra los PDF.
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", recurso));
        } catch (IOException ex) {
            // Un archivo huerfano en Cloudinary no justifica fallar la operacion.
            log.warn("No se pudo borrar {} de Cloudinary: {}", publicId, ex.getMessage());
        }
    }

    /** El tipo de recurso viaja en la URL: /image/upload/, /video/upload/, /raw/upload/. */
    static String recursoDe(String url) {
        if (url == null) {
            return "image";
        }
        if (url.contains("/raw/upload/")) {
            return "raw";
        }
        if (url.contains("/video/upload/")) {
            return "video";
        }
        return "image";
    }

    /**
     * Saca el identificador de una URL de entrega. Tras /upload/ pueden venir
     * transformaciones y una version antes del identificador real; se descartan
     * ambas y tambien la extension.
     *
     * <p>Visible para pruebas.
     *
     * @return null si la URL no es de Cloudinary, como pasa con las del modo
     *         local, que conviven en la base con estas.
     */
    static String extractPublicId(String url) {
        if (url == null) {
            return null;
        }
        int inicio = url.indexOf(MARCA_SUBIDA);
        if (inicio < 0) {
            return null;
        }

        String resto = url.substring(inicio + MARCA_SUBIDA.length());
        int corte = resto.indexOf('?');
        if (corte >= 0) {
            resto = resto.substring(0, corte);
        }

        String[] segmentos = resto.split("/");
        int desde = 0;
        while (desde < segmentos.length
                && (VERSION.matcher(segmentos[desde]).matches()
                        || TRANSFORMACION.matcher(segmentos[desde]).matches())) {
            desde++;
        }
        if (desde >= segmentos.length) {
            return null;
        }

        String publicId = String.join("/", Arrays.copyOfRange(segmentos, desde, segmentos.length));

        // En imagenes y videos la extension no forma parte del identificador;
        // en raw si, y recortarla haria que el borrado no encuentre el archivo.
        if ("raw".equals(recursoDe(url))) {
            return publicId;
        }
        int punto = publicId.lastIndexOf('.');
        return punto > 0 ? publicId.substring(0, punto) : publicId;
    }
}
