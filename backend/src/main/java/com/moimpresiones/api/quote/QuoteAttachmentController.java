package com.moimpresiones.api.quote;

import com.moimpresiones.api.common.DireccionIp;
import com.moimpresiones.api.common.LimiteDeEnvios;
import com.moimpresiones.api.media.InvalidMediaException;
import com.moimpresiones.api.media.PrivateFileStorage;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Subida de los archivos que el cliente adjunta al pedir presupuesto.
 *
 * <p>Es publico, asi que esta acotado a proposito: solo PDF e imagenes, un tope
 * por IP y por hora, y nada de ejecutables ni documentos con macros. Sin esos
 * limites, un endpoint de subida abierto se convierte en alojamiento gratuito
 * para cualquiera.
 *
 * <p>Los formatos de diseño (AI, CDR, PSD) quedan afuera a proposito: son
 * pesados y no aportan nada para presupuestar. Para esos, el cliente los manda
 * por WhatsApp una vez que arranca el trabajo.
 */
@RestController
@RequestMapping("/api/quotes/attachments")
public class QuoteAttachmentController {

    private static final Logger log = LoggerFactory.getLogger(QuoteAttachmentController.class);

    private static final List<String> TIPOS_ACEPTADOS =
            List.of("application/pdf", "image/jpeg", "image/png", "image/webp");

    private static final int SUBIDAS_POR_HORA = 12;

    private final PrivateFileStorage storage;
    private final LimiteDeEnvios limite;

    public QuoteAttachmentController(PrivateFileStorage storage, LimiteDeEnvios limite) {
        this.storage = storage;
        this.limite = limite;
    }

    @PostMapping
    public AdjuntoSubido subir(@RequestParam("file") MultipartFile file, HttpServletRequest http) {
        limite.registrar(DireccionIp.de(http), SUBIDAS_POR_HORA);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }

        String tipo = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT).trim();
        if (!TIPOS_ACEPTADOS.contains(tipo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se aceptan PDF, JPG, PNG o WebP. Si tenés el diseño en otro formato, "
                            + "mandánoslo por WhatsApp.");
        }

        try {
            String storageKey = storage.store(file);
            log.info("Adjunto de cotización recibido: {} ({} bytes)",
                    nombreSeguro(file.getOriginalFilename()), file.getSize());
            return new AdjuntoSubido(storageKey, nombreSeguro(file.getOriginalFilename()),
                    tipo, file.getSize());
        } catch (InvalidMediaException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    /**
     * El nombre original solo se usa para mostrarlo en el panel, nunca como
     * ruta, pero igual se limpia: podria traer HTML o separadores de directorio.
     */
    private static String nombreSeguro(String original) {
        if (original == null || original.isBlank()) {
            return "archivo";
        }
        String limpio = original.replaceAll("[\\\\/\\r\\n<>]", "").trim();
        if (limpio.isEmpty()) {
            return "archivo";
        }
        return limpio.length() > 255 ? limpio.substring(limpio.length() - 255) : limpio;
    }

    public record AdjuntoSubido(String storageKey, String filename, String contentType,
            long sizeBytes) {
    }
}
