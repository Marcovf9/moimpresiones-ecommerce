package com.moimpresiones.api.dashboard;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Todo lo que muestra la pantalla de inicio del panel, en una sola respuesta. */
public record DashboardDto(
        Kpis kpis,
        List<PendingTask> tareasPendientes,
        List<WeekPoint> cotizacionesPorSemana,
        List<DemandItem> productosMasPedidos,
        List<RecentQuote> ultimasCotizaciones) {

    public record Kpis(
            long cotizacionesEsteMes,
            long cotizacionesPendientes,
            long cotizacionesTotales,
            long productosPublicados,
            long productosDespublicados,
            long terminaciones) {
    }

    /**
     * Un pendiente concreto y accionable: que falta, cuantos son y adonde ir
     * a resolverlo. La severidad ordena la lista en pantalla.
     */
    public record PendingTask(
            String codigo,
            String titulo,
            String detalle,
            int cantidad,
            String severidad,
            String enlace,
            List<Referencia> elementos) {

        public record Referencia(String nombre, String slug) {
        }
    }

    public record WeekPoint(LocalDate semana, long cantidad) {
    }

    public record DemandItem(String nombre, String slug, long cantidad) {
    }

    public record RecentQuote(
            Long id,
            String nombre,
            String empresa,
            String telefono,
            String producto,
            String estado,
            Instant fecha) {
    }
}
