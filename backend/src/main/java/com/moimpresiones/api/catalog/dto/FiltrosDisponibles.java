package com.moimpresiones.api.catalog.dto;

import java.util.List;

/** Opciones de filtrado del catalogo, con cuantos productos tiene cada una. */
public record FiltrosDisponibles(List<Opcion> terminaciones, List<Opcion> materiales) {

    /**
     * @param cantidad cuantos productos quedan al elegir esta opcion. Se manda
     *                 para no ofrecer filtros que no devuelven nada.
     */
    public record Opcion(String clave, String etiqueta, long cantidad) {
    }
}
