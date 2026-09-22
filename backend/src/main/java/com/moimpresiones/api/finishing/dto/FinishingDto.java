package com.moimpresiones.api.finishing.dto;

public record FinishingDto(
        Long id,
        String slug,
        String name,
        String description,
        String imageUrl,
        int displayOrder) {
}
