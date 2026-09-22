package com.moimpresiones.api.notificaciones;

import com.moimpresiones.api.quote.QuoteItem;
import com.moimpresiones.api.quote.QuoteRequest;
import java.util.ArrayList;
import java.util.List;

/** Arma el texto del aviso que recibe la imprenta cuando entra un pedido. */
public final class MailCotizacion {

    private MailCotizacion() {
    }

    public static String asunto(QuoteRequest quote) {
        String quien = quote.getCompany() != null
                ? quote.getFullName() + " (" + quote.getCompany() + ")"
                : quote.getFullName();
        int cantidad = quote.getItems().size();
        return "Nueva cotizacion: " + quien + " - " + cantidad
                + (cantidad == 1 ? " producto" : " productos");
    }

    /**
     * @param urlPanel direccion de la bandeja de cotizaciones; si viene vacia el
     *                 mail no incluye el enlace.
     */
    public static String cuerpo(QuoteRequest quote, String urlPanel) {
        List<String> l = new ArrayList<>();
        l.add("Entro un pedido de presupuesto desde el sitio.");
        l.add("");
        l.add("CONTACTO");
        l.add("  Nombre:   " + quote.getFullName());
        agregar(l, "  Empresa:  ", quote.getCompany());
        l.add("  Telefono: " + quote.getPhone());
        agregar(l, "  Email:    ", quote.getEmail());
        l.add("");

        l.add(quote.getItems().size() == 1 ? "PRODUCTO" : "PRODUCTOS");
        int n = 1;
        for (QuoteItem item : quote.getItems()) {
            String nombre = item.getProductName() == null ? "Producto a definir" : item.getProductName();
            l.add("  " + n++ + ". " + nombre);
            agregar(l, "     Cantidad:      ", item.getQuantity());
            agregar(l, "     Formato:       ", item.getFormat());
            agregar(l, "     Material:      ", item.getMaterial());
            agregar(l, "     Terminaciones: ", item.getFinishings());
            agregar(l, "     Detalle:       ", item.getNotes());
        }

        if (quote.getMessage() != null) {
            l.add("");
            l.add("COMENTARIOS");
            l.add("  " + quote.getMessage());
        }

        if (!quote.getAttachments().isEmpty()) {
            l.add("");
            int a = quote.getAttachments().size();
            // Los archivos no viajan en el mail a proposito: son del cliente y
            // solo se abren desde el panel, con sesion iniciada.
            l.add("Adjunto " + a + (a == 1 ? " archivo" : " archivos")
                    + ". Se ven desde el panel.");
        }

        if (urlPanel != null && !urlPanel.isBlank()) {
            l.add("");
            l.add("Ver y responder en el panel: " + urlPanel);
        }

        return String.join("\n", l);
    }

    private static void agregar(List<String> lineas, String etiqueta, String valor) {
        if (valor != null && !valor.isBlank()) {
            lineas.add(etiqueta + valor.trim());
        }
    }
}
