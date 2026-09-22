package com.moimpresiones.api.finishing;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinishingRepository extends JpaRepository<Finishing, Long> {

    List<Finishing> findAllByOrderByDisplayOrderAscNameAsc();

    Optional<Finishing> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /** Terminaciones sin foto: la pagina las muestra con un placeholder. */
    List<Finishing> findByImageUrlIsNullOrderByNameAsc();
}
