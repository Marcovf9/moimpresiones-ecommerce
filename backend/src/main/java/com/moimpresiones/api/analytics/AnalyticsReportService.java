package com.moimpresiones.api.analytics;

import com.moimpresiones.api.catalog.ProductRepository;
import com.moimpresiones.api.quote.QuoteRequestRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Arma los reportes de visitas del panel. */
@Service
@Transactional(readOnly = true)
public class AnalyticsReportService {

    private static final int FILAS_DEL_RANKING = 10;
    /** Tope de dias por consulta: evita que un rango enorme cuelgue el panel. */
    private static final long DIAS_MAXIMOS = 731;

    private final PageViewRepository vistas;
    private final ProductRepository productos;
    private final QuoteRequestRepository cotizaciones;

    public AnalyticsReportService(PageViewRepository vistas, ProductRepository productos,
            QuoteRequestRepository cotizaciones) {
        this.vistas = vistas;
        this.productos = productos;
        this.cotizaciones = cotizaciones;
    }

    public AnalyticsReport build(LocalDate desde, LocalDate hasta) {
        if (desde.isAfter(hasta)) {
            LocalDate tmp = desde;
            desde = hasta;
            hasta = tmp;
        }
        if (desde.isBefore(hasta.minusDays(DIAS_MAXIMOS))) {
            desde = hasta.minusDays(DIAS_MAXIMOS);
        }

        Instant inicio = inicioDe(desde);
        Instant fin = finDe(hasta);

        // Mismo largo hacia atrás, para poder decir "subió" o "bajó".
        long dias = java.time.temporal.ChronoUnit.DAYS.between(desde, hasta) + 1;
        Instant inicioPrevio = inicioDe(desde.minusDays(dias));
        Instant finPrevio = inicioDe(desde);

        var resumen = new AnalyticsReport.Resumen(
                vistas.countByOccurredAtBetween(inicio, fin),
                vistas.contarVisitantes(inicio, fin),
                vistas.countByOccurredAtBetween(inicioPrevio, finPrevio),
                vistas.contarVisitantes(inicioPrevio, finPrevio),
                cotizaciones.countByCreatedAtBetween(inicio, fin));

        return new AnalyticsReport(desde, hasta, resumen,
                serieDiaria(desde, hasta, inicio, fin),
                ranking(vistas.contarPorPagina(inicio, fin, PageRequest.of(0, FILAS_DEL_RANKING)),
                        AnalyticsReportService::etiquetaDePagina),
                rankingDeProductos(inicio, fin),
                ranking(vistas.contarPorOrigen(inicio, fin, PageRequest.of(0, FILAS_DEL_RANKING)),
                        origen -> origen));
    }

    /** Devuelve todos los días del rango, incluidos los vacíos: un hueco en el gráfico mentiría. */
    private List<AnalyticsReport.PuntoDiario> serieDiaria(LocalDate desde, LocalDate hasta,
            Instant inicio, Instant fin) {
        Map<LocalDate, PageViewRepository.ConteoDiario> porDia = vistas.contarPorDia(inicio, fin)
                .stream().collect(Collectors.toMap(PageViewRepository.ConteoDiario::getDia, c -> c,
                        (a, b) -> a, HashMap::new));

        List<AnalyticsReport.PuntoDiario> serie = new ArrayList<>();
        for (LocalDate dia = desde; !dia.isAfter(hasta); dia = dia.plusDays(1)) {
            var conteo = porDia.get(dia);
            serie.add(new AnalyticsReport.PuntoDiario(dia,
                    conteo == null ? 0 : conteo.getVisitas(),
                    conteo == null ? 0 : conteo.getVisitantes()));
        }
        return serie;
    }

    /** Traduce el slug al nombre del producto, que es lo que el dueño reconoce. */
    private List<AnalyticsReport.Fila> rankingDeProductos(Instant inicio, Instant fin) {
        var filas = vistas.contarPorProducto(inicio, fin, PageRequest.of(0, FILAS_DEL_RANKING));
        Map<String, String> nombres = productos.findAll().stream()
                .collect(Collectors.toMap(p -> p.getSlug(), p -> p.getName(), (a, b) -> a));
        return filas.stream()
                .map(f -> new AnalyticsReport.Fila(f.getClave(),
                        nombres.getOrDefault(f.getClave(), f.getClave()),
                        f.getVisitas(), f.getVisitantes()))
                .toList();
    }

    private static List<AnalyticsReport.Fila> ranking(
            List<PageViewRepository.ConteoPorClave> filas, Function<String, String> etiqueta) {
        return filas.stream()
                .map(f -> new AnalyticsReport.Fila(f.getClave(), etiqueta.apply(f.getClave()),
                        f.getVisitas(), f.getVisitantes()))
                .toList();
    }

    private static String etiquetaDePagina(String path) {
        return switch (path) {
            case "/" -> "Inicio";
            case "/productos" -> "Productos";
            case "/terminaciones" -> "Terminaciones";
            case "/cotiza" -> "Cotizá tu proyecto";
            case "/terminos" -> "Términos y condiciones";
            case "/privacidad" -> "Política de privacidad";
            default -> path.startsWith("/productos/") ? "Ficha: " + path.substring(11) : path;
        };
    }

    private static Instant inicioDe(LocalDate dia) {
        return dia.atStartOfDay(AnalyticsService.CORDOBA).toInstant();
    }

    private static Instant finDe(LocalDate dia) {
        return dia.plusDays(1).atStartOfDay(AnalyticsService.CORDOBA).toInstant();
    }
}
