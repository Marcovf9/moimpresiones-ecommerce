package com.moimpresiones.api.analytics;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

/** Reportes de visitas del panel. Requiere token de administrador. */
@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsReportService reportes;

    public AnalyticsController(AnalyticsReportService reportes) {
        this.reportes = reportes;
    }

    /**
     * @param desde primer dia del rango. Si no viene, los ultimos 30 dias.
     * @param hasta ultimo dia del rango, incluido.
     */
    @GetMapping
    public AnalyticsReport reporte(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        LocalDate fin = hasta != null ? hasta : LocalDate.now(AnalyticsService.CORDOBA);
        LocalDate inicio = desde != null ? desde : fin.minusDays(29);
        return reportes.build(inicio, fin);
    }
}
