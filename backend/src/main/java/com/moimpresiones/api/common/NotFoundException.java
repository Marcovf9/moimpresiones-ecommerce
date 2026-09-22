package com.moimpresiones.api.common;

/** Se lanza cuando un recurso pedido por slug o id no existe. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public static NotFoundException of(String resource, Object identifier) {
        return new NotFoundException("No se encontro " + resource + " '" + identifier + "'");
    }
}
