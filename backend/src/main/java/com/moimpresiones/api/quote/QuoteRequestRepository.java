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

    /**
     * Condiciones de la bandeja del panel: estado, rango de fechas y texto,
     * todos opcionales y combinables.
     *
     * <p>Va en SQL y no en JPQL por unaccent: el dueno busca "panaderia" y la
     * empresa se llama "Panaderia del Centro" con tilde. Sin eso, la busqueda
     * no encuentra nada y parece rota.
     *
     * <p>El texto busca tambien en el nombre del producto pedido, que es como
     * uno se acuerda de una cotizacion ("la de las carpetas de la semana
     * pasada"). DISTINCT porque un pedido de tres productos apareceria tres
     * veces.
     */
    String CONDICIONES = """
            FROM quote_requests q
            LEFT JOIN quote_items i ON i.quote_id = q.id
            WHERE (CAST(:status AS text) IS NULL OR q.status = :status)
              AND (CAST(:desde AS timestamptz) IS NULL OR q.created_at >= :desde)
              AND (CAST(:hasta AS timestamptz) IS NULL OR q.created_at < :hasta)
              AND (CAST(:texto AS text) IS NULL
                   OR lower(unaccent(q.full_name)) LIKE :texto
                   OR q.phone LIKE :texto
                   OR lower(unaccent(coalesce(q.email, ''))) LIKE :texto
                   OR lower(unaccent(coalesce(q.company, ''))) LIKE :texto
                   OR lower(unaccent(coalesce(i.product_name, ''))) LIKE :texto)
            """;

    String BUSQUEDA = "SELECT DISTINCT q.* " + CONDICIONES + " ORDER BY q.created_at DESC";

    String CONTEO = "SELECT COUNT(DISTINCT q.id) " + CONDICIONES;

    Page<QuoteRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<QuoteRequest> findByStatusOrderByCreatedAtDesc(QuoteStatus status, Pageable pageable);

    /** La bandeja del panel, paginada. */
    @Query(value = BUSQUEDA, countQuery = CONTEO, nativeQuery = true)
    Page<QuoteRequest> buscar(
            @Param("status") String status,
            @Param("desde") Instant desde,
            @Param("hasta") Instant hasta,
            @Param("texto") String texto,
            Pageable pageable);

    /** La misma busqueda sin paginar: es lo que se baja como planilla. */
    @Query(value = BUSQUEDA, nativeQuery = true)
    List<QuoteRequest> buscarTodas(
            @Param("status") String status,
            @Param("desde") Instant desde,
            @Param("hasta") Instant hasta,
            @Param("texto") String texto);

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
