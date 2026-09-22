package com.moimpresiones.api.common;

/** Se lanza cuando la operacion choca con una restriccion de negocio (por ejemplo, slug repetido). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
