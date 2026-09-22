package com.moimpresiones.api.quote;

import jakarta.persistence.*;

/** Archivo que el cliente adjunta al pedir presupuesto. */
@Entity
@Table(name = "quote_attachments")
public class QuoteAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quote_id", nullable = false)
    private QuoteRequest quote;

    /** Clave de almacenamiento. No es una URL: no sirve para descargar sin el panel. */
    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    /** Nombre original, para que en el panel se reconozca de que archivo se trata. */
    @Column(nullable = false, length = 255)
    private String filename;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuoteRequest getQuote() {
        return quote;
    }

    public void setQuote(QuoteRequest quote) {
        this.quote = quote;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
