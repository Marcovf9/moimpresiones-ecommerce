package com.moimpresiones.api.catalog;

import java.util.List;

/**
 * Los papeles con los que trabaja la imprenta.
 *
 * <p>En la ficha el material viene como texto libre y largo ("papel obra,
 * ilustracion, cartulina u otros materiales segun el uso"), asi que los valores
 * distintos no sirven como opciones de filtro. Esta lista corta es la que
 * entiende un visitante, y cada entrada se busca dentro de ese texto.
 */
final class MaterialesDelCatalogo {

    record Material(String clave, String etiqueta, String busqueda) {
    }

    static final List<Material> TODOS = List.of(
            new Material("papel-obra", "Papel obra", "papel obra"),
            new Material("papel-ilustracion", "Papel ilustración", "ilustracion"),
            new Material("cartulina", "Cartulina", "cartulina"),
            new Material("autoadhesivo", "Papel autoadhesivo", "autoadhesivo"),
            new Material("microcorrugado", "Cartón microcorrugado", "microcorrugado"));

    private MaterialesDelCatalogo() {
    }

    static Material porClave(String clave) {
        return TODOS.stream().filter(m -> m.clave().equals(clave)).findFirst().orElse(null);
    }
}
