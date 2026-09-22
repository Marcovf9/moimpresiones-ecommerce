package com.moimpresiones.api.quote;

import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.media.PrivateFileStorage;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Entrega los adjuntos de una cotizacion a quien tiene sesion de administrador.
 *
 * <p>Es el unico camino para llegar a esos archivos: no se publican por URL. El
 * diseno de un cliente no tiene por que ser descargable por cualquiera que
 * conozca el enlace.
 */
@RestController
@RequestMapping("/api/admin/quotes/attachments")
public class AdminAttachmentController {

    private final QuoteAttachmentRepository adjuntos;
    private final PrivateFileStorage storage;

    public AdminAttachmentController(QuoteAttachmentRepository adjuntos, PrivateFileStorage storage) {
        this.adjuntos = adjuntos;
        this.storage = storage;
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<InputStreamResource> descargar(@PathVariable Long id) {
        QuoteAttachment adjunto = adjuntos.findById(id)
                .orElseThrow(() -> NotFoundException.of("el adjunto", id));

        InputStream contenido = storage.open(adjunto.getStorageKey());

        MediaType tipo = adjunto.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(adjunto.getContentType());

        // inline para que el PDF se abra en el navegador en lugar de bajarse,
        // que es lo comodo cuando solo se quiere mirar el diseno.
        String nombre = URLEncoder.encode(adjunto.getFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename*=UTF-8''" + nombre)
                .body(new InputStreamResource(contenido));
    }
}
