package com.moimpresiones.api.quote;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class WhatsAppLinkBuilderTest {

    private static QuoteItem item(String nombre, String cantidad, String formato) {
        QuoteItem item = new QuoteItem();
        item.setProductName(nombre);
        item.setQuantity(cantidad);
        item.setFormat(formato);
        return item;
    }

    private static QuoteRequest pedido(QuoteItem... items) {
        QuoteRequest quote = new QuoteRequest();
        quote.setFullName("Juana Perez");
        quote.setPhone("351 555 1234");
        quote.setCompany("Grafica del Sur");
        for (QuoteItem item : items) {
            quote.addItem(item);
        }
        return quote;
    }

    @Test
    void armaElMensajeSoloConLosCamposCompletos() {
        String mensaje = WhatsAppLinkBuilder.buildMessage(
                pedido(item("Carpetas Institucionales", "250", "A4")));

        assertThat(mensaje)
                .contains("*Carpetas Institucionales*")
                .contains("*Cantidad:* 250")
                .contains("*Formato:* A4")
                .contains("*Nombre:* Juana Perez")
                .contains("*Empresa:* Grafica del Sur");
        // Material y Terminaciones quedaron vacios: no deben aparecer.
        assertThat(mensaje).doesNotContain("*Material:*").doesNotContain("*Terminaciones:*");
    }

    @Test
    void conUnSoloProductoNoNumeraLaLista() {
        String mensaje = WhatsAppLinkBuilder.buildMessage(pedido(item("Estuches", "500", null)));

        // Numerar un unico producto suena raro en el chat.
        assertThat(mensaje).contains("*Estuches*").doesNotContain("1) ");
    }

    @Test
    void numeraCuandoHayVariosProductos() {
        String mensaje = WhatsAppLinkBuilder.buildMessage(pedido(
                item("Tarjetas personales", "1000", "8,5 x 5 cm"),
                item("Carpetas Institucionales", "250", "A4"),
                item("Folletos", "2000", "A5")));

        assertThat(mensaje)
                .contains("*1) Tarjetas personales*")
                .contains("*2) Carpetas Institucionales*")
                .contains("*3) Folletos*")
                .contains("*Cantidad:* 1000")
                .contains("*Cantidad:* 2000");
    }

    @Test
    void avisaCuandoElClienteAdjuntoArchivos() {
        QuoteRequest quote = pedido(item("Estuches", "500", null));
        QuoteAttachment adjunto = new QuoteAttachment();
        adjunto.setStorageKey("adjuntos/abc-123.pdf");
        adjunto.setFilename("diseno.pdf");
        quote.addAttachment(adjunto);

        assertThat(WhatsAppLinkBuilder.buildMessage(quote)).contains("Adjunte 1 archivo");
    }

    @Test
    void sinNombreDeProductoNoDejaElRenglonVacio() {
        String mensaje = WhatsAppLinkBuilder.buildMessage(pedido(item(null, "500", "A4")));

        assertThat(mensaje).contains("*Producto a definir*").contains("*Cantidad:* 500");
    }

    @Test
    void limpiaElNumeroYCodificaElTexto() {
        String enlace = WhatsAppLinkBuilder.buildQuoteLink("+54 9 351 123-4567",
                pedido(item("Estuches", "500", null)));

        assertThat(enlace).startsWith("https://wa.me/5493511234567?text=");
        // El mensaje viaja url-encoded: sin espacios ni saltos de linea crudos.
        assertThat(enlace).doesNotContain(" ").doesNotContain("\n");
    }

    @Test
    void sinNumeroConfiguradoNoDevuelveEnlace() {
        QuoteRequest quote = pedido(item("Estuches", "500", null));

        assertThat(WhatsAppLinkBuilder.buildQuoteLink("", quote)).isNull();
        assertThat(WhatsAppLinkBuilder.buildQuoteLink(null, quote)).isNull();
        assertThat(WhatsAppLinkBuilder.buildPlainLink("  ")).isNull();
    }
}
