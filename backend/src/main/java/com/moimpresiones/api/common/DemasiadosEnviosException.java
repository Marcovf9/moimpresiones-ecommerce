package com.moimpresiones.api.common;

/** Se lanza cuando una direccion supera el tope de envios por hora. */
public class DemasiadosEnviosException extends RuntimeException {

    public DemasiadosEnviosException(String message) {
        super(message);
    }
}
