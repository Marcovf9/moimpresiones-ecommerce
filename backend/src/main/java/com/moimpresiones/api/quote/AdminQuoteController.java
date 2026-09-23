package com.moimpresiones.api.quote;

import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.common.Texto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Bandeja de pedidos de cotizacion recibidos. Requiere token de administrador. */
@RestController
@RequestMapping("/api/admin/quotes")
public class AdminQuoteController {

    private static final int MAX_PAGE_SIZE = 100;

    private static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");

    private final QuoteRequestRepository quotes;

    public AdminQuoteController(QuoteRequestRepository quotes) {
        this.quotes = quotes;
    }

    /**
     * Bandeja del panel.
     *
     * @param status estado, o todos si viene vacio
     * @param q texto libre: nombre, empresa, telefono, mail o producto pedido
     * @param desde primera fecha incluida (aaaa-mm-dd, hora de Cordoba)
     * @param hasta ultima fecha incluida
     */
    @GetMapping
    @Transactional(readOnly = true)
    public Page<QuoteDetail> list(
            @RequestParam(required = false) QuoteStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));
        return quotes.buscar(nombreDe(status), desdeInstante(desde), hastaInstante(hasta),
                        patron(q), pageable)
                .map(AdminQuoteController::toDetail);
    }

    /** La misma bandeja, para abrir en Excel o en Google Sheets. */
    @GetMapping(value = "/planilla.csv", produces = "text/csv; charset=UTF-8")
    @Transactional(readOnly = true)
    public ResponseEntity<String> planilla(
            @RequestParam(required = false) QuoteStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        var encontradas = quotes.buscarTodas(
                nombreDe(status), desdeInstante(desde), hastaInstante(hasta), patron(q));
        String nombre = "cotizaciones-" + LocalDate.now(CORDOBA) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + "\"")
                .body(PlanillaDeCotizaciones.armar(encontradas));
    }

    /**
     * El texto de busqueda, listo para un LIKE. Vacio significa "no filtrar".
     *
     * <p>Se normaliza igual que en la consulta —minusculas y sin tildes— o
     * buscar "panaderia" no encontraria "Panaderia del Centro".
     */
    private static String patron(String texto) {
        if (texto == null || texto.isBlank()) return null;
        return "%" + Texto.normalizar(texto) + "%";
    }

    private static String nombreDe(QuoteStatus status) {
        return status == null ? null : status.name();
    }

    private static Instant desdeInstante(LocalDate fecha) {
        return fecha == null ? null : fecha.atStartOfDay(CORDOBA).toInstant();
    }

    /** El dia indicado entra completo: el corte va al arranque del siguiente. */
    private static Instant hastaInstante(LocalDate fecha) {
        return fecha == null ? null : fecha.plusDays(1).atStartOfDay(CORDOBA).toInstant();
    }

    /**
     * Marca en que punto esta el pedido. Al pasarlo a RESPONDIDA se guarda cuando
     * ocurrio, para poder mirar despues cuanto tardamos en contestar.
     */
    @PatchMapping("/{id}")
    @Transactional
    public QuoteDetail updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
        QuoteRequest quote = quotes.findById(id)
                .orElseThrow(() -> NotFoundException.of("la cotizacion", id));

        boolean pasaARespondida = request.status() == QuoteStatus.RESPONDIDA
                && quote.getStatus() != QuoteStatus.RESPONDIDA;

        quote.setStatus(request.status());
        if (request.internalNotes() != null) {
            quote.setInternalNotes(request.internalNotes().isBlank() ? null : request.internalNotes().trim());
        }
        if (pasaARespondida && quote.getAnsweredAt() == null) {
            quote.setAnsweredAt(Instant.now());
        }
        return toDetail(quote);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!quotes.existsById(id)) {
            throw NotFoundException.of("la cotizacion", id);
        }
        quotes.deleteById(id);
    }

    private static QuoteDetail toDetail(QuoteRequest quote) {
        return new QuoteDetail(
                quote.getId(),
                quote.getFullName(),
                quote.getCompany(),
                quote.getPhone(),
                // Enlace para responderle al cliente desde el panel, en un toque.
                WhatsAppLinkBuilder.buildPlainLink(quote.getPhone()),
                quote.getEmail(),
                quote.getItems().stream().map(AdminQuoteController::toItem).toList(),
                quote.getAttachments().stream().map(AdminQuoteController::toAttachment).toList(),
                quote.getMessage(),
                quote.getStatus(),
                quote.getInternalNotes(),
                quote.getCreatedAt(),
                quote.getAnsweredAt());
    }

    private static ItemDetail toItem(QuoteItem item) {
        return new ItemDetail(
                item.getProductName(),
                item.getProduct() == null ? null : item.getProduct().getSlug(),
                item.getQuantity(),
                item.getFormat(),
                item.getMaterial(),
                item.getFinishings(),
                item.getNotes());
    }

    private static AttachmentDetail toAttachment(QuoteAttachment adjunto) {
        // Ruta del propio panel, no de Cloudinary: la descarga pasa siempre por
        // el backend, que comprueba la sesion antes de entregar el archivo.
        return new AttachmentDetail(adjunto.getId(),
                "/api/admin/quotes/attachments/" + adjunto.getId(),
                adjunto.getFilename(), adjunto.getContentType(), adjunto.getSizeBytes());
    }

    public record UpdateStatusRequest(
            @NotNull(message = "Indicá el nuevo estado") QuoteStatus status,
            @Size(max = 4000) String internalNotes) {
    }

    public record QuoteDetail(
            Long id,
            String fullName,
            String company,
            String phone,
            String whatsappUrl,
            String email,
            List<ItemDetail> items,
            List<AttachmentDetail> attachments,
            String message,
            QuoteStatus status,
            String internalNotes,
            Instant createdAt,
            Instant answeredAt) {
    }

    public record ItemDetail(
            String productName,
            String productSlug,
            String quantity,
            String format,
            String material,
            String finishings,
            String notes) {
    }

    public record AttachmentDetail(Long id, String downloadPath, String filename,
            String contentType, Long sizeBytes) {
    }
}
