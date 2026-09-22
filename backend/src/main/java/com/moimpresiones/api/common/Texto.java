package com.moimpresiones.api.common;

import java.text.Normalizer;
import java.util.Locale;

/** Normaliza texto para comparar sin que estorben las tildes ni las mayusculas. */
public final class Texto {

    private Texto() {
    }

    /**
     * Pasa a minusculas y quita los diacriticos, igual que hace la base al
     * armar search_text. Si las dos normalizaciones no coinciden, la busqueda
     * deja de encontrar cosas sin dar ninguna senal.
     */
    public static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }
        String descompuesto = Normalizer.normalize(valor, Normalizer.Form.NFD);
        return descompuesto.replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim();
    }
}
