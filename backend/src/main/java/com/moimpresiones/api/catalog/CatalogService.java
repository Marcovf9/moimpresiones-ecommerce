package com.moimpresiones.api.catalog;

import com.moimpresiones.api.catalog.dto.CategoryDto;
import com.moimpresiones.api.catalog.dto.ProductDetailDto;
import com.moimpresiones.api.catalog.dto.FiltrosDisponibles;
import com.moimpresiones.api.catalog.dto.ProductSummaryDto;
import com.moimpresiones.api.finishing.FinishingRepository;
import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.common.Texto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Consultas de solo lectura del catalogo publico. */
@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categories;
    private final ProductRepository products;
    private final FinishingRepository finishings;

    public CatalogService(CategoryRepository categories, ProductRepository products,
            FinishingRepository finishings) {
        this.categories = categories;
        this.products = products;
        this.finishings = finishings;
    }

    /** Rubros con sus productos: alimenta la pagina de Productos y el submenu. */
    public List<CategoryDto> listCategoriesWithProducts() {
        return categories.findAllWithActiveProducts().stream()
                .map(CatalogMapper::toDto)
                .toList();
    }

    /**
     * Listado del catalogo. Los tres filtros son opcionales y se combinan entre
     * si; sin ninguno devuelve todo.
     */
    public List<ProductSummaryDto> listProducts(String categorySlug, String finishingSlug,
            String materialKey) {
        var material = materialKey == null || materialKey.isBlank()
                ? null
                : MaterialesDelCatalogo.porClave(materialKey);

        return products.findFiltrados(
                        vacioANull(categorySlug),
                        vacioANull(finishingSlug),
                        material == null ? null : material.busqueda())
                .stream()
                .map(CatalogMapper::toSummary)
                .toList();
    }

    /**
     * Opciones de filtrado con su cantidad de productos. Se calcula sobre el
     * catalogo real, asi que nunca se ofrece un filtro que devolveria vacio.
     */
    public FiltrosDisponibles filtrosDisponibles(String categorySlug) {
        String rubro = vacioANull(categorySlug);

        List<FiltrosDisponibles.Opcion> porTerminacion = finishings
                .findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(f -> new FiltrosDisponibles.Opcion(f.getSlug(), f.getName(),
                        products.findFiltrados(rubro, f.getSlug(), null).size()))
                .filter(o -> o.cantidad() > 0)
                .toList();

        List<FiltrosDisponibles.Opcion> porMaterial = MaterialesDelCatalogo.TODOS.stream()
                .map(m -> new FiltrosDisponibles.Opcion(m.clave(), m.etiqueta(),
                        products.findFiltrados(rubro, null, m.busqueda()).size()))
                .filter(o -> o.cantidad() > 0)
                .toList();

        return new FiltrosDisponibles(porTerminacion, porMaterial);
    }

    private static String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    public ProductDetailDto getProduct(String slug) {
        return products.findBySlug(slug)
                .filter(Product::isActive)
                .map(CatalogMapper::toDetail)
                .orElseThrow(() -> NotFoundException.of("el producto", slug));
    }

    /**
     * Buscador del menu hamburguesa. Devuelve vacio si el termino es muy corto:
     * con una sola letra, cualquier resultado seria ruido.
     *
     * <p>Primero busca la coincidencia exacta sobre el texto normalizado. Solo
     * si no hay nada recurre al parecido, que sirve para errores de tipeo pero
     * trae resultados menos precisos.
     */
    public List<ProductSummaryDto> search(String term) {
        String normalizado = Texto.normalizar(term);
        if (normalizado.length() < 2) {
            return List.of();
        }

        List<Product> encontrados = products.search(normalizado);
        if (encontrados.isEmpty()) {
            encontrados = products.searchAproximado(normalizado);
        }
        return encontrados.stream().map(CatalogMapper::toSummary).toList();
    }
}
