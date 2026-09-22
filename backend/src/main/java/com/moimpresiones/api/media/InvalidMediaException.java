package com.moimpresiones.api.media;

/** El archivo subido no es valido (vacio, formato no admitido o ruta rara). */
public class InvalidMediaException extends RuntimeException {

    public InvalidMediaException(String message) {
        super(message);
    }
}
