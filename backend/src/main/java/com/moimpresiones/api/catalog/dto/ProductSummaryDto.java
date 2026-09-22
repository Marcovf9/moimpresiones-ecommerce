package com.moimpresiones.api.catalog.dto;

/** Version liviana del producto: listados, submenus y buscador. */
public record ProductSummaryDto(
        Long id,
        String slug,
        String name,
        String summary,
        String categorySlug,
        String categoryName,
        String coverImageUrl) {
}
