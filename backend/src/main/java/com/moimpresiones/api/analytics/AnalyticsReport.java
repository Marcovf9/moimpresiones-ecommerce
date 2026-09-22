package com.moimpresiones.api.analytics;

import java.time.LocalDate;
import java.util.List;

/** Reporte de visitas para el rango que elija el dueño en el panel. */
public record AnalyticsReport(
        LocalDate desde,
        LocalDate hasta,
        Resumen resumen,
        List<PuntoDiario> porDia,
        List<Fila> paginas,
        List<Fila> productos,
        List<Fila> origenes) {

    public record Resumen(
            long visitas,
            long visitantes,
            /** Visitas del período anterior de igual largo, para comparar. */
            long visitasPeriodoPrevio,
            long visitantesPeriodoPrevio,
            long cotizaciones) {
    }

    public record PuntoDiario(LocalDate dia, long visitas, long visitantes) {
    }

    /** Una fila de ranking: página, producto u origen. */
    public record Fila(String clave, String etiqueta, long visitas, long visitantes) {
    }
}
