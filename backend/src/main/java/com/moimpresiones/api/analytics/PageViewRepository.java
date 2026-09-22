package com.moimpresiones.api.analytics;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PageViewRepository extends JpaRepository<PageView, Long> {

    long countByOccurredAtBetween(Instant desde, Instant hasta);

    @Query("SELECT COUNT(DISTINCT v.visitorHash) FROM PageView v WHERE v.occurredAt BETWEEN :desde AND :hasta")
    long contarVisitantes(@Param("desde") Instant desde, @Param("hasta") Instant hasta);

    /**
     * Serie diaria de visitas y visitantes. Nativa porque date_trunc no existe
     * en JPQL, y truncada en hora de Cordoba: hacerlo en UTC correria los dias.
     */
    @Query(value = """
            SELECT (date_trunc('day', occurred_at AT TIME ZONE 'America/Argentina/Cordoba'))::date AS dia,
                   COUNT(*) AS visitas,
                   COUNT(DISTINCT visitor_hash) AS visitantes
            FROM page_views
            WHERE occurred_at BETWEEN :desde AND :hasta
            GROUP BY dia
            ORDER BY dia
            """, nativeQuery = true)
    List<ConteoDiario> contarPorDia(@Param("desde") Instant desde, @Param("hasta") Instant hasta);

    @Query("""
            SELECT v.path AS clave, COUNT(v) AS visitas, COUNT(DISTINCT v.visitorHash) AS visitantes
            FROM PageView v
            WHERE v.occurredAt BETWEEN :desde AND :hasta
            GROUP BY v.path
            ORDER BY COUNT(v) DESC
            """)
    List<ConteoPorClave> contarPorPagina(@Param("desde") Instant desde, @Param("hasta") Instant hasta,
            Pageable pageable);

    /** Qué productos miran más: el reporte de interés real del catálogo. */
    @Query("""
            SELECT v.productSlug AS clave, COUNT(v) AS visitas, COUNT(DISTINCT v.visitorHash) AS visitantes
            FROM PageView v
            WHERE v.productSlug IS NOT NULL AND v.occurredAt BETWEEN :desde AND :hasta
            GROUP BY v.productSlug
            ORDER BY COUNT(v) DESC
            """)
    List<ConteoPorClave> contarPorProducto(@Param("desde") Instant desde, @Param("hasta") Instant hasta,
            Pageable pageable);

    @Query("""
            SELECT v.referrerHost AS clave, COUNT(v) AS visitas, COUNT(DISTINCT v.visitorHash) AS visitantes
            FROM PageView v
            WHERE v.referrerHost IS NOT NULL AND v.occurredAt BETWEEN :desde AND :hasta
            GROUP BY v.referrerHost
            ORDER BY COUNT(v) DESC
            """)
    List<ConteoPorClave> contarPorOrigen(@Param("desde") Instant desde, @Param("hasta") Instant hasta,
            Pageable pageable);

    interface ConteoDiario {
        LocalDate getDia();

        long getVisitas();

        long getVisitantes();
    }

    interface ConteoPorClave {
        String getClave();

        long getVisitas();

        long getVisitantes();
    }
}
