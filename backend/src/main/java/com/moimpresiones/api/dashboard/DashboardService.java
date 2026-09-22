package com.moimpresiones.api.dashboard;

import com.moimpresiones.api.catalog.Product;
import com.moimpresiones.api.catalog.ProductRepository;
import com.moimpresiones.api.finishing.Finishing;
import com.moimpresiones.api.finishing.FinishingRepository;
import com.moimpresiones.api.quote.QuoteRequest;
import com.moimpresiones.api.quote.QuoteRequestRepository;
import com.moimpresiones.api.quote.QuoteStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Arma el panorama que ve el dueno al entrar al panel: como viene la demanda y,
 * sobre todo, que le falta al sitio para estar completo.
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");
    private static final int SEMANAS_DEL_GRAFICO = 8;
    private static final int TOP_PRODUCTOS = 5;
    private static final int ULTIMAS_COTIZACIONES = 8;
    /** Cuantos nombres concretos adjuntamos a cada pendiente para poder ir directo. */
    private static final int MAX_REFERENCIAS = 6;

    private final ProductRepository products;
    private final FinishingRepository finishings;
    private final QuoteRequestRepository quotes;

    public DashboardService(ProductRepository products, FinishingRepository finishings,
            QuoteRequestRepository quotes) {
        this.products = products;
        this.finishings = finishings;
        this.quotes = quotes;
    }

    public DashboardDto build() {
        return new DashboardDto(
                buildKpis(),
                buildPendingTasks(),
                buildWeeklySeries(),
                buildDemand(),
                buildRecentQuotes());
    }

    private DashboardDto.Kpis buildKpis() {
        Instant inicioDeMes = LocalDate.now(CORDOBA).withDayOfMonth(1)
                .atStartOfDay(CORDOBA).toInstant();

        return new DashboardDto.Kpis(
                quotes.countByCreatedAtAfter(inicioDeMes),
                quotes.countByStatus(QuoteStatus.PENDIENTE),
                quotes.count(),
                products.countByActiveTrue(),
                products.countByActiveFalse(),
                finishings.count());
    }

    /**
     * Los pendientes salen de mirar el catalogo con los ojos de un visitante:
     * un producto sin fotos o sin ficha tecnica se ve incompleto en el sitio.
     */
    private List<DashboardDto.PendingTask> buildPendingTasks() {
        List<DashboardDto.PendingTask> tareas = new ArrayList<>();

        List<Product> sinFotos = products.findActiveWithoutImages();
        if (!sinFotos.isEmpty()) {
            tareas.add(new DashboardDto.PendingTask(
                    "productos-sin-fotos",
                    "Productos publicados sin fotos",
                    "Se ven con un cartel de \"estamos preparando las fotos\". Subir imágenes es lo que más ayuda a que pidan presupuesto.",
                    sinFotos.size(),
                    "alta",
                    "/admin/productos",
                    referenciasDeProductos(sinFotos)));
        }

        List<Product> sinFicha = products.findActiveWithoutSpecs();
        if (!sinFicha.isEmpty()) {
            tareas.add(new DashboardDto.PendingTask(
                    "productos-sin-ficha",
                    "Productos sin ficha técnica",
                    "Sin materiales ni formatos, el visitante tiene que preguntar todo por WhatsApp.",
                    sinFicha.size(),
                    "alta",
                    "/admin/productos",
                    referenciasDeProductos(sinFicha)));
        }

        List<Finishing> terminacionesSinFoto = finishings.findByImageUrlIsNullOrderByNameAsc();
        if (!terminacionesSinFoto.isEmpty()) {
            tareas.add(new DashboardDto.PendingTask(
                    "terminaciones-sin-foto",
                    "Terminaciones sin imagen",
                    "La página de Terminaciones es visual: sin foto se muestra un recuadro vacío.",
                    terminacionesSinFoto.size(),
                    "media",
                    "/admin/terminaciones",
                    terminacionesSinFoto.stream()
                            .limit(MAX_REFERENCIAS)
                            .map(f -> new DashboardDto.PendingTask.Referencia(f.getName(), f.getSlug()))
                            .toList()));
        }

        List<Product> despublicados = products.findByActiveFalseOrderByNameAsc();
        if (!despublicados.isEmpty()) {
            tareas.add(new DashboardDto.PendingTask(
                    "productos-despublicados",
                    "Productos despublicados",
                    "No aparecen en el sitio. Revisá si corresponde volver a publicarlos.",
                    despublicados.size(),
                    "baja",
                    "/admin/productos",
                    referenciasDeProductos(despublicados)));
        }

        long pendientes = quotes.countByStatus(QuoteStatus.PENDIENTE);
        if (pendientes > 0) {
            tareas.add(new DashboardDto.PendingTask(
                    "cotizaciones-pendientes",
                    "Cotizaciones sin responder",
                    "Son clientes esperando un presupuesto. Cuanto antes se responda, más chances de cerrar el trabajo.",
                    (int) pendientes,
                    "alta",
                    "/admin/cotizaciones",
                    List.of()));
        }

        return tareas;
    }

    private static List<DashboardDto.PendingTask.Referencia> referenciasDeProductos(List<Product> lista) {
        return lista.stream()
                .limit(MAX_REFERENCIAS)
                .map(p -> new DashboardDto.PendingTask.Referencia(p.getName(), p.getSlug()))
                .toList();
    }

    /**
     * Devuelve siempre las 8 semanas, incluidas las que no tuvieron pedidos, para
     * que el grafico no mienta salteando periodos vacios.
     */
    private List<DashboardDto.WeekPoint> buildWeeklySeries() {
        LocalDate lunesDeEstaSemana = LocalDate.now(CORDOBA)
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate desde = lunesDeEstaSemana.minusWeeks(SEMANAS_DEL_GRAFICO - 1L);

        var conteos = quotes.countByWeekSince(desde.atStartOfDay(CORDOBA).toInstant()).stream()
                .collect(java.util.stream.Collectors.toMap(
                        QuoteRequestRepository.WeeklyCount::getSemana,
                        QuoteRequestRepository.WeeklyCount::getCantidad,
                        Long::sum));

        List<DashboardDto.WeekPoint> serie = new ArrayList<>();
        for (int i = 0; i < SEMANAS_DEL_GRAFICO; i++) {
            LocalDate semana = desde.plusWeeks(i);
            serie.add(new DashboardDto.WeekPoint(semana, conteos.getOrDefault(semana, 0L)));
        }
        return serie;
    }

    private List<DashboardDto.DemandItem> buildDemand() {
        return quotes.findMostRequestedProducts(PageRequest.of(0, TOP_PRODUCTOS)).stream()
                .map(row -> new DashboardDto.DemandItem(row.getNombre(), row.getSlug(), row.getCantidad()))
                .toList();
    }

    private List<DashboardDto.RecentQuote> buildRecentQuotes() {
        return quotes.findAllByOrderByCreatedAtDesc(PageRequest.of(0, ULTIMAS_COTIZACIONES))
                .map(DashboardService::toRecent)
                .getContent();
    }

    private static DashboardDto.RecentQuote toRecent(QuoteRequest quote) {
        return new DashboardDto.RecentQuote(
                quote.getId(),
                quote.getFullName(),
                quote.getCompany(),
                quote.getPhone(),
                quote.describirProductos(),
                quote.getStatus().name(),
                quote.getCreatedAt());
    }

}
