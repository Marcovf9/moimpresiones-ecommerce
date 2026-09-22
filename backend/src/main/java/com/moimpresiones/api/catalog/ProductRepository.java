package com.moimpresiones.api.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Solo trae el rubro en el fetch: sumar specs e images haria que Hibernate
     * intentara traer dos colecciones a la vez (MultipleBagFetchException).
     * Ambas se cargan al mapear, dentro de la misma transaccion de lectura.
     */
    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findByActiveTrueOrderByDisplayOrderAscNameAsc();

    List<Product> findByCategorySlugAndActiveTrueOrderByDisplayOrderAscNameAsc(String categorySlug);

    /**
     * Listado con filtros opcionales. Cada parametro en null se ignora, de modo
     * que la misma consulta sirve para el catalogo completo y para cualquier
     * combinacion de rubro, terminacion y material.
     *
     * <p>El material se compara contra el texto normalizado, asi que el termino
     * tiene que llegar pasado por Texto.normalizar.
     */
    @Query(value = """
            SELECT DISTINCT p.* FROM products p
            JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_finishings pf ON pf.product_id = p.id
            LEFT JOIN finishings f ON f.id = pf.finishing_id
            WHERE p.active = TRUE
              AND (:categorySlug IS NULL OR c.slug = :categorySlug)
              AND (:finishingSlug IS NULL OR f.slug = :finishingSlug)
              AND (:material IS NULL OR p.material_text LIKE '%' || :material || '%')
            ORDER BY p.display_order ASC, p.name ASC
            """, nativeQuery = true)
    List<Product> findFiltrados(@Param("categorySlug") String categorySlug,
            @Param("finishingSlug") String finishingSlug,
            @Param("material") String material);

    /** Materiales distintos que hay en el catalogo, para armar el filtro. */
    @Query(value = """
            SELECT DISTINCT lower(unaccent(s.value)) FROM product_specs s
            JOIN products p ON p.id = s.product_id
            WHERE s.label = 'Material' AND p.active = TRUE
            """, nativeQuery = true)
    List<String> materialesEnUso();

    long countByActiveTrue();

    long countByActiveFalse();

    /**
     * Productos publicados a los que todavia les falta algo. Alimentan la
     * seccion "Que mejorar" del panel, para que el dueno sepa donde trabajar.
     */
    @Query("SELECT p FROM Product p WHERE p.active = TRUE AND p.images IS EMPTY ORDER BY p.name")
    List<Product> findActiveWithoutImages();

    @Query("SELECT p FROM Product p WHERE p.active = TRUE AND p.specs IS EMPTY ORDER BY p.name")
    List<Product> findActiveWithoutSpecs();

    List<Product> findByActiveFalseOrderByNameAsc();

    /**
     * Buscador del menu. Mira el texto derivado, que ya viene sin tildes e
     * incluye la ficha tecnica, de modo que "troquelado" encuentra los
     * productos que lo ofrecen aunque no lo digan en el nombre.
     *
     * <p>El termino tiene que llegar ya normalizado con {@code Texto.normalizar}.
     * Ordena por parecido para que lo mas cercano quede arriba.
     */
    @Query(value = """
            SELECT * FROM products p
            WHERE p.active = TRUE
              AND p.search_text LIKE '%' || :term || '%'
            ORDER BY similarity(p.search_text, :term) DESC, p.display_order ASC, p.name ASC
            """, nativeQuery = true)
    List<Product> search(@Param("term") String term);

    /**
     * Respaldo por parecido, para cuando el visitante escribe con errores y la
     * busqueda exacta no devuelve nada.
     *
     * <p>Usa word_similarity y no similarity: la segunda compara el termino
     * contra el texto entero, y contra un documento largo el parecido siempre
     * da infimo. word_similarity lo compara contra la mejor porcion del texto,
     * que es lo que hace falta para un termino corto.
     *
     * <p>El umbral es alto a proposito: con uno bajo, cualquier termino trae
     * medio catalogo y confunde mas de lo que ayuda.
     */
    @Query(value = """
            SELECT * FROM products p
            WHERE p.active = TRUE
              AND word_similarity(:term, p.search_text) > 0.6
            ORDER BY word_similarity(:term, p.search_text) DESC
            LIMIT 8
            """, nativeQuery = true)
    List<Product> searchAproximado(@Param("term") String term);
}
