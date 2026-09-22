package com.moimpresiones.api.quote;

import com.moimpresiones.api.catalog.Product;
import jakarta.persistence.*;

/** Uno de los productos que pide una cotizacion. */
@Entity
@Table(name = "quote_items")
public class QuoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quote_id", nullable = false)
    private QuoteRequest quote;

    /** Producto del catalogo, si el pedido salio de una ficha. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /**
     * Nombre con el que se pidio. Se guarda aparte del producto para que el
     * pedido siga siendo legible aunque despues se elimine del catalogo.
     */
    @Column(name = "product_name", length = 180)
    private String productName;

    @Column(length = 120)
    private String quantity;

    @Column(name = "format", length = 180)
    private String format;

    @Column(length = 180)
    private String material;

    @Column(length = 500)
    private String finishings;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getFinishings() {
        return finishings;
    }

    public void setFinishings(String finishings) {
        this.finishings = finishings;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
