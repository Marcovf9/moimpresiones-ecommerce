package com.moimpresiones.api.quote;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido de cotizacion enviado desde la pagina "Cotiza tu proyecto".
 *
 * <p>Guarda los datos de contacto y agrupa uno o varios productos. Se persiste
 * para que la imprenta no dependa solo del chat de WhatsApp.
 */
@Entity
@Table(name = "quote_requests")
public class QuoteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(length = 180)
    private String email;

    @Column(nullable = false, length = 60)
    private String phone;

    @Column(length = 180)
    private String company;

    @Column(columnDefinition = "text")
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuoteStatus status = QuoteStatus.PENDIENTE;

    /** Notas del equipo sobre el pedido. Nunca se muestran al cliente. */
    @Column(name = "internal_notes", columnDefinition = "text")
    private String internalNotes;

    @Column(name = "answered_at")
    private Instant answeredAt;

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<QuoteItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<QuoteAttachment> attachments = new ArrayList<>();

    public void addItem(QuoteItem item) {
        item.setQuote(this);
        item.setDisplayOrder(items.size() + 1);
        items.add(item);
    }

    public void addAttachment(QuoteAttachment attachment) {
        attachment.setQuote(this);
        attachments.add(attachment);
    }

    /** Resumen de los productos pedidos, para listados y tableros. */
    public String describirProductos() {
        if (items.isEmpty()) {
            return null;
        }
        List<String> nombres = items.stream()
                .map(QuoteItem::getProductName)
                .filter(n -> n != null && !n.isBlank())
                .toList();
        if (nombres.isEmpty()) {
            return null;
        }
        if (nombres.size() == 1) {
            return nombres.getFirst();
        }
        return nombres.getFirst() + " y " + (nombres.size() - 1) + " más";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public QuoteStatus getStatus() {
        return status;
    }

    public void setStatus(QuoteStatus status) {
        this.status = status;
    }

    public String getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(String internalNotes) {
        this.internalNotes = internalNotes;
    }

    public Instant getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(Instant answeredAt) {
        this.answeredAt = answeredAt;
    }

    public List<QuoteItem> getItems() {
        return items;
    }

    public void setItems(List<QuoteItem> items) {
        this.items = items;
    }

    public List<QuoteAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<QuoteAttachment> attachments) {
        this.attachments = attachments;
    }
}
