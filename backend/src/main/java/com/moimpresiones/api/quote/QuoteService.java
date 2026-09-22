package com.moimpresiones.api.quote;

import com.moimpresiones.api.catalog.ProductRepository;
import com.moimpresiones.api.config.AppProperties;
import com.moimpresiones.api.notificaciones.CotizacionRecibida;
import com.moimpresiones.api.notificaciones.MailCotizacion;
import com.moimpresiones.api.quote.dto.ContactInfo;
import com.moimpresiones.api.quote.dto.CreateQuoteRequest;
import com.moimpresiones.api.quote.dto.QuoteCreatedResponse;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuoteService {

    private static final Logger log = LoggerFactory.getLogger(QuoteService.class);

    private final QuoteRequestRepository quotes;
    private final ProductRepository products;
    private final AppProperties properties;
    private final ApplicationEventPublisher eventos;

    public QuoteService(QuoteRequestRepository quotes, ProductRepository products,
            AppProperties properties, ApplicationEventPublisher eventos) {
        this.quotes = quotes;
        this.products = products;
        this.properties = properties;
        this.eventos = eventos;
    }

    /**
     * Guarda el pedido con todos sus productos y devuelve el enlace de WhatsApp
     * con el mensaje armado. Si el slug de algun producto no existe se guarda
     * igual: no queremos perder el contacto por un dato del catalogo.
     */
    @Transactional
    public QuoteCreatedResponse create(CreateQuoteRequest request) {
        QuoteRequest quote = new QuoteRequest();
        quote.setFullName(request.fullName().trim());
        quote.setPhone(request.phone().trim());
        quote.setEmail(trimToNull(request.email()));
        quote.setCompany(trimToNull(request.company()));
        quote.setMessage(trimToNull(request.message()));

        for (CreateQuoteRequest.Item entrada : request.items()) {
            QuoteItem item = new QuoteItem();
            item.setQuantity(trimToNull(entrada.quantity()));
            item.setFormat(trimToNull(entrada.format()));
            item.setMaterial(trimToNull(entrada.material()));
            item.setFinishings(trimToNull(entrada.finishings()));
            item.setNotes(trimToNull(entrada.notes()));
            item.setProductName(trimToNull(entrada.productName()));

            String slug = trimToNull(entrada.productSlug());
            if (slug != null) {
                products.findBySlug(slug).ifPresentOrElse(
                        producto -> {
                            item.setProduct(producto);
                            item.setProductName(producto.getName());
                        },
                        () -> log.warn("Cotizacion con un producto desconocido: {}", slug));
            }
            quote.addItem(item);
        }

        List<CreateQuoteRequest.Attachment> adjuntos =
                request.attachments() == null ? List.of() : request.attachments();
        for (CreateQuoteRequest.Attachment entrada : adjuntos) {
            QuoteAttachment adjunto = new QuoteAttachment();
            adjunto.setStorageKey(entrada.storageKey().trim());
            adjunto.setFilename(entrada.filename().trim());
            adjunto.setContentType(trimToNull(entrada.contentType()));
            adjunto.setSizeBytes(entrada.sizeBytes());
            quote.addAttachment(adjunto);
        }

        QuoteRequest saved = quotes.save(quote);

        // El mail se arma aca, con todo en memoria, y se manda recien cuando la
        // transaccion confirma: ver NotificadorCotizaciones.
        String urlPanel = properties.getPublicUrl() == null || properties.getPublicUrl().isBlank()
                ? null
                : properties.getPublicUrl().replaceAll("/$", "") + "/admin/cotizaciones";
        eventos.publishEvent(new CotizacionRecibida(saved.getId(),
                MailCotizacion.asunto(saved), MailCotizacion.cuerpo(saved, urlPanel)));

        String whatsappUrl = WhatsAppLinkBuilder.buildQuoteLink(
                properties.getContact().getWhatsappNumber(), saved);
        return new QuoteCreatedResponse(saved.getId(), whatsappUrl);
    }

    public ContactInfo contactInfo() {
        AppProperties.Contact contact = properties.getContact();
        return new ContactInfo(
                emptyToNull(contact.getWhatsappNumber()),
                WhatsAppLinkBuilder.buildPlainLink(contact.getWhatsappNumber()),
                emptyToNull(contact.getInstagramUrl()),
                emptyToNull(contact.getEmail()));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
