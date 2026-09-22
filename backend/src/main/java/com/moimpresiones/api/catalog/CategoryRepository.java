package com.moimpresiones.api.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByDisplayOrderAscNameAsc();

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Carga los rubros junto con sus productos activos en una sola consulta.
     * Alimenta el menu desplegable de Productos, que muestra rubro + derivados.
     */
    @Query("""
            SELECT DISTINCT c FROM Category c
            LEFT JOIN FETCH c.products p
            WHERE p IS NULL OR p.active = TRUE
            ORDER BY c.displayOrder ASC
            """)
    List<Category> findAllWithActiveProducts();
}
