package com.moimpresiones.api.notificaciones;

import static org.assertj.core.api.Assertions.assertThat;

import com.moimpresiones.api.quote.QuoteItem;
import com.moimpresiones.api.quote.QuoteRequest;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class MailRecordatorioTest {

    private static final Instant AHORA = Instant.parse("2026-09-25T12:00:00Z");

    private static QuoteRequest pedido(String nombre, String empresa, Instant cuando, String... productos) {
        QuoteRequest pedido = new QuoteRequest();
        pedido.setFullName(nombre);
        pedido.setCompany(empresa);
        pedido.setPhone("3516211435");
        pedido.setCreatedAt(cuando);
        for (String nombreProducto : productos) {
            QuoteItem item = new QuoteItem();
            item.setProductName(nombreProducto);
            pedido.getItems().add(item);
        }
        return pedido;
    }

    @Test
    void elAsuntoDiceCuantasSonYEnSingularCuandoEsUna() {
        var uno = List.of(pedido("Ana", null, AHORA, "Tarjetas"));
        var dos = List.of(pedido("Ana", null, AHORA, "Tarjetas"), pedido("Beto", null, AHORA));

        assertThat(MailRecordatorio.asunto(uno)).isEqualTo("Hay una cotizacion sin responder");
        assertThat(MailRecordatorio.asunto(dos)).isEqualTo("Hay 2 cotizaciones sin responder");
    }

    @Test
    void elCuerpoTraeLoNecesarioParaResponderSinAbrirElPanel() {
        var pendientes = List.of(
                pedido("Ana Gómez", "Panadería del Centro", AHORA.minusSeconds(30 * 3600), "Tarjetas"));

        String cuerpo = MailRecordatorio.cuerpo(pendientes, "https://moimpresiones.com", AHORA);

        assertThat(cuerpo).contains("Ana Gómez (Panadería del Centro)");
        assertThat(cuerpo).contains("3516211435");
        assertThat(cuerpo).contains("Tarjetas");
        assertThat(cuerpo).contains("hace 1 dia");
        assertThat(cuerpo).contains("https://moimpresiones.com/admin/cotizaciones");
    }

    @Test
    void sinProductoCargadoNoQuedaUnRenglonVacio() {
        var pendientes = List.of(pedido("Ana", null, AHORA.minusSeconds(3600)));

        assertThat(MailRecordatorio.cuerpo(pendientes, "", AHORA)).contains("un trabajo a definir");
    }

    @Test
    void sinDireccionDelPanelNoSeEscribeUnEnlaceRoto() {
        var pendientes = List.of(pedido("Ana", null, AHORA.minusSeconds(3600), "Tarjetas"));

        assertThat(MailRecordatorio.cuerpo(pendientes, null, AHORA))
                .doesNotContain("/admin/cotizaciones");
    }

    @Test
    void elTiempoTranscurridoSeLeeComoLoDiriaUnaPersona() {
        assertThat(MailRecordatorio.hace(AHORA.minusSeconds(3600), AHORA)).isEqualTo("hace 1 hora");
        assertThat(MailRecordatorio.hace(AHORA.minusSeconds(26 * 3600), AHORA)).isEqualTo("hace 1 dia");
        assertThat(MailRecordatorio.hace(AHORA.minusSeconds(72 * 3600), AHORA)).isEqualTo("hace 3 dias");
        // Menos de una hora se redondea a una: "hace 0 horas" no dice nada.
        assertThat(MailRecordatorio.hace(AHORA.minusSeconds(120), AHORA)).isEqualTo("hace 1 hora");
    }
}
