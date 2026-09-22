package com.moimpresiones.api.security;

import java.util.List;

/** Requisitos minimos de la contrasena del panel. */
public final class PasswordPolicy {

    public static final int LARGO_MINIMO = 12;

    /** Las que aparecen primero en cualquier ataque de diccionario. */
    private static final List<String> PROHIBIDAS = List.of(
            "password", "contrasena", "contraseña", "123456", "admin", "qwerty",
            "impresiones", "moimpresiones");

    private PasswordPolicy() {
    }

    /** @return el motivo del rechazo, o null si la contrasena sirve. */
    public static String motivoDeRechazo(String password) {
        if (password == null || password.length() < LARGO_MINIMO) {
            return "La contraseña tiene que tener al menos " + LARGO_MINIMO + " caracteres.";
        }
        String minus = password.toLowerCase();
        for (String prohibida : PROHIBIDAS) {
            if (minus.contains(prohibida)) {
                return "La contraseña no puede contener «" + prohibida + "»: es de las primeras que se prueban.";
            }
        }
        // Pedimos variedad, no simbolos obligatorios: una frase larga es mas
        // segura y mas facil de recordar que "P@ssw0rd!".
        boolean tieneLetra = password.chars().anyMatch(Character::isLetter);
        boolean tieneOtro = password.chars().anyMatch(c -> !Character.isLetter(c));
        if (!tieneLetra || !tieneOtro) {
            return "Combiná letras con números o símbolos.";
        }
        return null;
    }
}
