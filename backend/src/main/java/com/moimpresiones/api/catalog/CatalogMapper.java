package com.moimpresiones.api.catalog;

import com.moimpresiones.api.catalog.dto.*;
import java.util.List;

/** Traduce entidades del catalogo a los DTO que consume el frontend. */
public final class CatalogMapper {

    private CatalogMapper() {
    }

    public static CategoryDto toDto(Category category) {
        List<ProductSummaryDto> products = category.getProducts().stream()
                .filter(Product::isActive)
                .map(CatalogMapper::toSummary)
                .toList();
        return new CategoryDto(
                category.getId(),
                category.getSlug(),
                category.getName(),
                category.getDescription(),
                category.getDisplayOrder(),
                products);
    }

    public static ProductSummaryDto toSummary(Product product) {
        return new ProductSummaryDto(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getSummary(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                coverImageUrl(product));
    }

    public static ProductDetailDto toDetail(Product product) {
        return new ProductDetailDto(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getSummary(),
                product.getDescription(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                product.isActive(),
                product.getImages().stream().map(CatalogMapper::toDto).toList(),
                product.getSpecs().stream().map(CatalogMapper::toDto).toList(),
                product.getFinishings().stream()
                        .map(f -> new ProductDetailDto.FinishingRefDto(f.getSlug(), f.getName()))
                        .toList());
    }

    public static ImageDto toDto(ProductImage image) {
        return new ImageDto(image.getId(), image.getUrl(), image.getAltText(), image.getDisplayOrder());
    }

    public static SpecDto toDto(ProductSpec spec) {
        return new SpecDto(spec.getId(), spec.getLabel(), spec.getValue(), spec.getDisplayOrder());
    }

    private static String coverImageUrl(Product product) {
        return product.getImages().isEmpty() ? null : product.getImages().getFirst().getUrl();
    }
}
