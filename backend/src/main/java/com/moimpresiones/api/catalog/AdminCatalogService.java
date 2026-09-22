package com.moimpresiones.api.catalog;

import com.moimpresiones.api.catalog.dto.CategoryDto;
import com.moimpresiones.api.catalog.dto.ProductDetailDto;
import com.moimpresiones.api.catalog.dto.ProductSummaryDto;
import com.moimpresiones.api.catalog.dto.SaveCategoryRequest;
import com.moimpresiones.api.catalog.dto.SaveProductRequest;
import com.moimpresiones.api.common.ConflictException;
import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.media.MediaStorage;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Altas, bajas y modificaciones del catalogo desde el panel de administracion. */
@Service
@Transactional
public class AdminCatalogService {

    private final CategoryRepository categories;
    private final ProductRepository products;
    private final MediaStorage media;

    public AdminCatalogService(CategoryRepository categories, ProductRepository products,
            MediaStorage media) {
        this.categories = categories;
        this.products = products;
        this.media = media;
    }

    // ---------------------------------------------------------------- rubros

    @Transactional(readOnly = true)
    public List<CategoryDto> listCategories() {
        return categories.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(CatalogMapper::toDto)
                .toList();
    }

    public CategoryDto createCategory(SaveCategoryRequest request) {
        if (categories.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe un rubro con el slug '" + request.slug() + "'");
        }
        Category category = new Category();
        applyTo(category, request);
        return CatalogMapper.toDto(categories.save(category));
    }

    public CategoryDto updateCategory(String slug, SaveCategoryRequest request) {
        Category category = categories.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("el rubro", slug));
        if (!category.getSlug().equals(request.slug()) && categories.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe un rubro con el slug '" + request.slug() + "'");
        }
        applyTo(category, request);
        return CatalogMapper.toDto(category);
    }

    public void deleteCategory(String slug) {
        Category category = categories.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("el rubro", slug));
        if (!category.getProducts().isEmpty()) {
            throw new ConflictException(
                    "El rubro tiene productos cargados. Mové o eliminá esos productos antes de borrarlo.");
        }
        categories.delete(category);
    }

    // -------------------------------------------------------------- productos

    /** A diferencia del listado publico, incluye los productos despublicados. */
    @Transactional(readOnly = true)
    public List<ProductSummaryDto> listAllProducts() {
        return products.findAll().stream()
                .sorted((a, b) -> {
                    int byOrder = Integer.compare(a.getDisplayOrder(), b.getDisplayOrder());
                    return byOrder != 0 ? byOrder : a.getName().compareToIgnoreCase(b.getName());
                })
                .map(CatalogMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getProduct(String slug) {
        return products.findBySlug(slug)
                .map(CatalogMapper::toDetail)
                .orElseThrow(() -> NotFoundException.of("el producto", slug));
    }

    public ProductDetailDto createProduct(SaveProductRequest request) {
        if (products.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe un producto con el slug '" + request.slug() + "'");
        }
        Product product = new Product();
        applyTo(product, request);
        return CatalogMapper.toDetail(products.save(product));
    }

    public ProductDetailDto updateProduct(String slug, SaveProductRequest request) {
        Product product = products.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("el producto", slug));
        if (!product.getSlug().equals(request.slug()) && products.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe un producto con el slug '" + request.slug() + "'");
        }
        applyTo(product, request);
        return CatalogMapper.toDetail(product);
    }

    public void deleteProduct(String slug) {
        Product product = products.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("el producto", slug));
        // Las fotos viven en disco: se borran junto con el producto.
        product.getImages().forEach(image -> media.delete(image.getUrl()));
        products.delete(product);
    }

    // ---------------------------------------------------------------- helpers

    private void applyTo(Category category, SaveCategoryRequest request) {
        category.setSlug(request.slug());
        category.setName(request.name());
        category.setDescription(request.description());
        category.setDisplayOrder(request.displayOrder());
    }

    private void applyTo(Product product, SaveProductRequest request) {
        Category category = categories.findBySlug(request.categorySlug())
                .orElseThrow(() -> NotFoundException.of("el rubro", request.categorySlug()));

        product.setCategory(category);
        product.setSlug(request.slug());
        product.setName(request.name());
        product.setSummary(request.summary());
        product.setDescription(request.description());
        product.setDisplayOrder(request.displayOrder());
        product.setActive(request.active());

        replaceSpecs(product, request.specs());
        replaceImages(product, request.images());
    }

    private void replaceSpecs(Product product, List<SaveProductRequest.SpecInput> incoming) {
        product.getSpecs().clear();
        if (incoming == null) {
            return;
        }
        int order = 1;
        for (SaveProductRequest.SpecInput input : incoming) {
            ProductSpec spec = new ProductSpec();
            spec.setLabel(input.label());
            spec.setValue(input.value());
            spec.setDisplayOrder(order++);
            product.addSpec(spec);
        }
    }

    /**
     * Reemplaza las fotos y borra del disco las que dejaron de estar referenciadas,
     * para que la carpeta de uploads no acumule archivos huerfanos.
     */
    private void replaceImages(Product product, List<SaveProductRequest.ImageInput> incoming) {
        List<String> keptUrls = incoming == null
                ? List.of()
                : incoming.stream().map(SaveProductRequest.ImageInput::url).toList();

        product.getImages().stream()
                .map(ProductImage::getUrl)
                .filter(url -> !keptUrls.contains(url))
                .forEach(media::delete);

        product.getImages().clear();
        if (incoming == null) {
            return;
        }
        int order = 1;
        for (SaveProductRequest.ImageInput input : incoming) {
            ProductImage image = new ProductImage();
            image.setUrl(input.url());
            image.setAltText(input.altText());
            image.setDisplayOrder(order++);
            product.addImage(image);
        }
    }
}
