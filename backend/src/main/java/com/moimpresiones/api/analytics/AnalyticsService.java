package com.moimpresiones.api.analytics;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registra las visitas del sitio publico. */
@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");

    /** Tope por visitante y por hora: el endpoint es publico y hay que acotarlo. */
    private static final int EVENTOS_POR_HORA = 200;

    private final PageViewRepository vistas;
    private final VisitorHasher hasher;

    /** Contador por visitante, reiniciado cada hora. */
    private final Map<String, AtomicInteger> eventosPorVisitante = new ConcurrentHashMap<>();
    private volatile int horaActual = -1;

    public AnalyticsService(PageViewRepository vistas, VisitorHasher hasher) {
        this.vistas = vistas;
        this.hasher = hasher;
    }

    @Transactional
    public void registrar(String path, String productSlug, String referrer, HttpServletRequest http) {
        if (path == null || path.isBlank() || path.length() > 300) {
            return;
        }

        String visitante = hasher.hash(direccionDe(http), http.getHeader("User-Agent"),
                LocalDate.now(CORDOBA));

        if (superaElTope(visitante)) {
            return;
        }

        PageView vista = new PageView();
        vista.setPath(path.trim());
        vista.setProductSlug(productSlug == null || productSlug.isBlank() ? null : productSlug.trim());
        vista.setVisitorHash(visitante);
        vista.setReferrerHost(dominioDe(referrer));
        vistas.save(vista);
    }

    private boolean superaElTope(String visitante) {
        int hora = java.time.LocalDateTime.now(CORDOBA).getHour();
        if (hora != horaActual) {
            eventosPorVisitante.clear();
            horaActual = hora;
        }
        int n = eventosPorVisitante.computeIfAbsent(visitante, k -> new AtomicInteger())
                .incrementAndGet();
        if (n == EVENTOS_POR_HORA + 1) {
            log.warn("Visitante por encima del tope horario de eventos; se descartan los siguientes");
        }
        return n > EVENTOS_POR_HORA;
    }

    /**
     * Guarda solo el dominio del origen, nunca la URL entera: una URL de
     * busqueda o de red social puede arrastrar datos de quien la abrio.
     * Los enlaces internos se descartan, porque no dicen de donde llego nadie.
     */
    private String dominioDe(String referrer) {
        if (referrer == null || referrer.isBlank()) {
            return null;
        }
        try {
            String host = URI.create(referrer.trim()).getHost();
            if (host == null || host.isBlank()) {
                return null;
            }
            host = host.toLowerCase(Locale.ROOT).replaceFirst("^www\\.", "");
            return host.length() > 200 ? host.substring(0, 200) : host;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    /** En produccion la IP real llega en X-Forwarded-For, no en la conexion. */
    private static String direccionDe(HttpServletRequest http) {
        String reenviada = http.getHeader("X-Forwarded-For");
        if (reenviada != null && !reenviada.isBlank()) {
            return reenviada.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
