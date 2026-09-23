package com.moimpresiones.api.quote;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Arma la planilla de cotizaciones que se baja desde el panel.
 *
 * <p>Es un CSV y no un Excel a proposito: Excel y Google Sheets lo abren
 * igual, y generar un .xlsx obligaria a sumar una biblioteca entera para
 * ahorrarle dos clics a alguien que abre esto una vez por mes.
 */
final class PlanillaDeCotizaciones {

    private static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");

    private static final DateTimeFormatter FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(CORDOBA);

    private static final List<String> COLUMNAS = List.of(
            "Fecha", "Estado", "Nombre", "Empresa", "Telefono", "Email",
            "Productos", "Comentarios", "Notas internas", "Respondida el");

    private PlanillaDeCotizaciones() {
    }

    static String armar(List<QuoteRequest> cotizaciones) {
        StringBuilder csv = new StringBuilder();

        // Excel en Windows abre el archivo en su codificacion local y rompe los
        // acentos salvo que encuentre esta marca al principio.
        csv.append('﻿');
        csv.append(String.join(";", COLUMNAS)).append("\r\n");

        for (QuoteRequest cotizacion : cotizaciones) {
            csv.append(fila(cotizacion)).append("\r\n");
        }
        return csv.toString();
    }

    private static String fila(QuoteRequest cotizacion) {
        return String.join(";", List.of(
                celda(FECHA.format(cotizacion.getCreatedAt())),
                celda(cotizacion.getStatus().name()),
                celda(cotizacion.getFullName()),
                celda(cotizacion.getCompany()),
                celda(cotizacion.getPhone()),
                celda(cotizacion.getEmail()),
                celda(productos(cotizacion)),
                celda(cotizacion.getMessage()),
                celda(cotizacion.getInternalNotes()),
                celda(cotizacion.getAnsweredAt() == null ? null : FECHA.format(cotizacion.getAnsweredAt()))));
    }

    /** Todos los productos del pedido en una celda, uno por renglon. */
    private static String productos(QuoteRequest cotizacion) {
        return cotizacion.getItems().stream()
                .map(PlanillaDeCotizaciones::describir)
                .collect(Collectors.joining("\n"));
    }

    private static String describir(QuoteItem item) {
        StringBuilder texto = new StringBuilder(
                item.getProductName() == null ? "(sin nombre)" : item.getProductName());
        agregar(texto, "cantidad", item.getQuantity());
        agregar(texto, "formato", item.getFormat());
        agregar(texto, "material", item.getMaterial());
        agregar(texto, "terminaciones", item.getFinishings());
        agregar(texto, "nota", item.getNotes());
        return texto.toString();
    }

    private static void agregar(StringBuilder texto, String etiqueta, String valor) {
        if (valor != null && !valor.isBlank()) {
            texto.append(" | ").append(etiqueta).append(": ").append(valor.trim());
        }
    }

    /**
     * Una celda del CSV.
     *
     * <p>Va siempre entre comillas: los textos traen punto y coma, comas y
     * saltos de linea, y cualquiera de los tres correria las columnas.
     *
     * <p>Lo que empieza con =, +, - o @ lleva un apostrofo adelante. Excel
     * interpreta esas celdas como formulas, y un texto que empiece asi —basta
     * con que alguien escriba "-500 unidades" en el comentario— puede terminar
     * ejecutandose al abrir el archivo.
     */
    private static String celda(String valor) {
        if (valor == null || valor.isBlank()) return "\"\"";

        String limpio = valor.trim();
        if ("=+-@".indexOf(limpio.charAt(0)) >= 0) {
            limpio = "'" + limpio;
        }
        return '"' + limpio.replace("\"", "\"\"") + '"';
    }
}
