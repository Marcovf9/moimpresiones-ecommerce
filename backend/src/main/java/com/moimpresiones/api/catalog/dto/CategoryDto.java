package com.moimpresiones.api.catalog.dto;

import java.util.List;

/** Rubro con sus productos, tal como lo consume el menu desplegable. */
public record CategoryDto(
        Long id,
        String slug,
        String name,
        String description,
        int displayOrder,
        List<ProductSummaryDto> products) {
}
