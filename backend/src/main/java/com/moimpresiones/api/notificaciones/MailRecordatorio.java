package com.moimpresiones.api.notificaciones;

import com.moimpresiones.api.quote.QuoteItem;
import com.moimpresiones.api.quote.QuoteRequest;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Arma el recordatorio de los pedidos que siguen sin responder.
 *
 * <p>Va uno solo con todos, y no un mail por pedido: tres avisos seguidos se
 * leen como spam y se dejan de mirar, que es justo lo contrario de lo que se
 * busca.
 */
public final class MailRecordatorio {

    private static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");

    private static final DateTimeFormatter FECHA =
            DateTimeFormatter.ofPattern("dd/MM 'a las' HH:mm").withZone(CORDOBA);

    private MailRecordatorio() {
    }

    public static String asunto(List<QuoteRequest> pendientes) {
        int cantidad = pendientes.size();
        return cantidad == 1
                ? "Hay una cotizacion sin responder"
                : "Hay " + cantidad + " cotizaciones sin responder";
    }

    public static String cuerpo(List<QuoteRequest> pendientes, String urlPanel, Instant ahora) {
        List<String> l = new ArrayList<>();
        l.add(pendientes.size() == 1
                ? "Este pedido entro por el sitio y todavia no tiene respuesta:"
                : "Estos pedidos entraron por el sitio y todavia no tienen respuesta:");
        l.add("");

        for (QuoteRequest pedido : pendientes) {
            l.add("- " + quien(pedido));
            l.add("  Entro el " + FECHA.format(pedido.getCreatedAt())
                    + " (" + hace(pedido.getCreatedAt(), ahora) + ")");
            l.add("  Telefono: " + pedido.getPhone());
            l.add("  Pidio: " + productos(pedido));
            l.add("");
        }

        if (urlPanel != null && !urlPanel.isBlank()) {
            l.add("Responder desde el panel: " + urlPanel + "/admin/cotizaciones");
            l.add("");
        }
        l.add("Cuando respondas, marcala como respondida en el panel y este aviso no vuelve.");
        return String.join("\n", l);
    }

    private static String quien(QuoteRequest pedido) {
        return pedido.getCompany() != null && !pedido.getCompany().isBlank()
                ? pedido.getFullName() + " (" + pedido.getCompany() + ")"
                : pedido.getFullName();
    }

    private static String productos(QuoteRequest pedido) {
        List<String> nombres = pedido.getItems().stream()
                .map(QuoteItem::getProductName)
                .filter(nombre -> nombre != null && !nombre.isBlank())
                .toList();
        return nombres.isEmpty() ? "un trabajo a definir" : String.join(", ", nombres);
    }

    /** "hace 2 dias", "hace 30 horas": es lo que hace entender la urgencia. */
    static String hace(Instant desde, Instant ahora) {
        Duration transcurrido = Duration.between(desde, ahora);
        long dias = transcurrido.toDays();
        if (dias >= 1) {
            return "hace " + dias + (dias == 1 ? " dia" : " dias");
        }
        long horas = Math.max(transcurrido.toHours(), 1);
        return "hace " + horas + (horas == 1 ? " hora" : " horas");
    }
}
