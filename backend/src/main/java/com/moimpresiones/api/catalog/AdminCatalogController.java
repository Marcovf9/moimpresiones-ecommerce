package com.moimpresiones.api.catalog;

import com.moimpresiones.api.catalog.dto.CategoryDto;
import com.moimpresiones.api.catalog.dto.ProductDetailDto;
import com.moimpresiones.api.catalog.dto.ProductSummaryDto;
import com.moimpresiones.api.catalog.dto.SaveCategoryRequest;
import com.moimpresiones.api.catalog.dto.SaveProductRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Gestion del catalogo desde el panel. Requiere token de administrador. */
@RestController
@RequestMapping("/api/admin/catalog")
public class AdminCatalogController {

    private final AdminCatalogService catalog;

    public AdminCatalogController(AdminCatalogService catalog) {
        this.catalog = catalog;
    }

    // Rubros

    @GetMapping("/categories")
    public List<CategoryDto> listCategories() {
        return catalog.listCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryDto createCategory(@Valid @RequestBody SaveCategoryRequest request) {
        return catalog.createCategory(request);
    }

    @PutMapping("/categories/{slug}")
    public CategoryDto updateCategory(@PathVariable String slug,
            @Valid @RequestBody SaveCategoryRequest request) {
        return catalog.updateCategory(slug, request);
    }

    @DeleteMapping("/categories/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable String slug) {
        catalog.deleteCategory(slug);
    }

    // Productos

    @GetMapping("/products")
    public List<ProductSummaryDto> listProducts() {
        return catalog.listAllProducts();
    }

    @GetMapping("/products/{slug}")
    public ProductDetailDto getProduct(@PathVariable String slug) {
        return catalog.getProduct(slug);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDetailDto createProduct(@Valid @RequestBody SaveProductRequest request) {
        return catalog.createProduct(request);
    }

    @PutMapping("/products/{slug}")
    public ProductDetailDto updateProduct(@PathVariable String slug,
            @Valid @RequestBody SaveProductRequest request) {
        return catalog.updateProduct(slug, request);
    }

    @DeleteMapping("/products/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String slug) {
        catalog.deleteProduct(slug);
    }
}
