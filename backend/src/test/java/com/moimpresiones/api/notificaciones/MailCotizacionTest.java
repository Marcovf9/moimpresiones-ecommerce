package com.moimpresiones.api.notificaciones;

import static org.assertj.core.api.Assertions.assertThat;

import com.moimpresiones.api.quote.QuoteAttachment;
import com.moimpresiones.api.quote.QuoteItem;
import com.moimpresiones.api.quote.QuoteRequest;
import org.junit.jupiter.api.Test;

class MailCotizacionTest {

    private static QuoteRequest pedido() {
        QuoteRequest q = new QuoteRequest();
        q.setFullName("Laura Gomez");
        q.setCompany("Estudio Nube");
        q.setPhone("351 555 7788");
        QuoteItem a = new QuoteItem();
        a.setProductName("Estuches");
        a.setQuantity("1000");
        q.addItem(a);
        QuoteItem b = new QuoteItem();
        b.setProductName("Folletos");
        q.addItem(b);
        return q;
    }

    @Test
    void elAsuntoDiceQuienYCuantosProductos() {
        assertThat(MailCotizacion.asunto(pedido()))
                .isEqualTo("Nueva cotizacion: Laura Gomez (Estudio Nube) - 2 productos");
    }

    @Test
    void elCuerpoListaContactoYProductosSinRenglonesVacios() {
        String cuerpo = MailCotizacion.cuerpo(pedido(), "https://moimpresiones.com/admin/cotizaciones");

        assertThat(cuerpo)
                .contains("Telefono: 351 555 7788")
                .contains("1. Estuches")
                .contains("Cantidad:      1000")
                .contains("2. Folletos")
                .contains("Ver y responder en el panel: https://moimpresiones.com/admin/cotizaciones");
        // Sin email cargado no aparece la etiqueta vacia.
        assertThat(cuerpo).doesNotContain("Email:");
    }

    @Test
    void losAdjuntosSeMencionanPeroNoViajanEnElMail() {
        QuoteRequest q = pedido();
        QuoteAttachment adjunto = new QuoteAttachment();
        adjunto.setStorageKey("adjuntos/x.pdf");
        adjunto.setFilename("diseno.pdf");
        q.addAttachment(adjunto);

        String cuerpo = MailCotizacion.cuerpo(q, null);
        assertThat(cuerpo).contains("Adjunto 1 archivo. Se ven desde el panel.")
                .doesNotContain("adjuntos/x.pdf")
                .doesNotContain("Ver y responder");
    }
}
