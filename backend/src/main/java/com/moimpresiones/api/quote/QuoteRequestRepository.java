package com.moimpresiones.api.quote;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {

    Page<QuoteRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<QuoteRequest> findByStatusOrderByCreatedAtDesc(QuoteStatus status, Pageable pageable);

    long countByStatus(QuoteStatus status);

    long countByCreatedAtAfter(Instant moment);

    long countByCreatedAtBetween(Instant desde, Instant hasta);

    /**
     * Cantidad de pedidos por semana, para el grafico de demanda del panel.
     * Nativa porque date_trunc no existe en JPQL.
     */
    @Query(value = """
            SELECT (date_trunc('week', created_at AT TIME ZONE 'America/Argentina/Cordoba'))::date AS semana,
                   COUNT(*) AS cantidad
            FROM quote_requests
            WHERE created_at >= :desde
            GROUP BY semana
            ORDER BY semana
            """, nativeQuery = true)
    List<WeeklyCount> countByWeekSince(@Param("desde") Instant desde);

    /**
     * Que productos piden mas, para saber donde conviene poner el foco.
     * Cuenta items y no cotizaciones: un pedido puede traer varios productos.
     */
    @Query("""
            SELECT p.name AS nombre, p.slug AS slug, COUNT(i) AS cantidad
            FROM QuoteItem i
            JOIN i.product p
            GROUP BY p.name, p.slug
            ORDER BY COUNT(i) DESC
            """)
    List<ProductDemand> findMostRequestedProducts(Pageable pageable);

    /**
     * Proyeccion de la consulta nativa por semana.
     *
     * <p>La semana se trunca en hora de Cordoba y ya viene como fecha: si se
     * truncara en UTC y se reconvirtiera despues, los lunes quedarian corridos
     * y ningun conteo coincidiria con las semanas del grafico.
     */
    interface WeeklyCount {
        LocalDate getSemana();

        long getCantidad();
    }

    interface ProductDemand {
        String getNombre();

        String getSlug();

        long getCantidad();
    }
}
