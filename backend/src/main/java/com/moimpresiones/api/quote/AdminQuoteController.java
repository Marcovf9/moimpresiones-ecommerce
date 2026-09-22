package com.moimpresiones.api.quote;

import com.moimpresiones.api.common.NotFoundException;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Bandeja de pedidos de cotizacion recibidos. Requiere token de administrador. */
@RestController
@RequestMapping("/api/admin/quotes")
public class AdminQuoteController {

    private static final int MAX_PAGE_SIZE = 100;

    private final QuoteRequestRepository quotes;

    public AdminQuoteController(QuoteRequestRepository quotes) {
        this.quotes = quotes;
    }

    /** @param status filtra por estado; si viene vacio devuelve todos. */
    @GetMapping
    @Transactional(readOnly = true)
    public Page<QuoteDetail> list(
            @RequestParam(required = false) QuoteStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));
        var found = status == null
                ? quotes.findAllByOrderByCreatedAtDesc(pageable)
                : quotes.findByStatusOrderByCreatedAtDesc(status, pageable);
        return found.map(AdminQuoteController::toDetail);
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
