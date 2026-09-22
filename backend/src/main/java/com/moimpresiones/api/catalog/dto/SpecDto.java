package com.moimpresiones.api.catalog.dto;

/** Una fila de la ficha tecnica. */
public record SpecDto(Long id, String label, String value, int displayOrder) {
}
