package com.moimpresiones.api.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PasswordPolicyTest {

    @Test
    void aceptaUnaFraseLargaConNumeros() {
        assertThat(PasswordPolicy.motivoDeRechazo("imprenta cordoba 1994")).isNull();
    }

    @Test
    void rechazaLasCortas() {
        assertThat(PasswordPolicy.motivoDeRechazo("corta1")).contains("12 caracteres");
        assertThat(PasswordPolicy.motivoDeRechazo(null)).contains("12 caracteres");
    }

    @Test
    void rechazaLasQueContienenPalabrasObvias() {
        // Largas y variadas, pero de las primeras que prueba un atacante.
        // El mensaje nombra la primera coincidencia de la lista: en "MoImpresiones"
        // encuentra "impresiones" antes que "moimpresiones", y da igual cuál cite
        // mientras la rechace.
        assertThat(PasswordPolicy.motivoDeRechazo("MoImpresiones2026")).contains("impresiones");
        assertThat(PasswordPolicy.motivoDeRechazo("MiPassword12345")).contains("password");
    }

    @Test
    void exigeMezclarLetrasConAlgoMas() {
        assertThat(PasswordPolicy.motivoDeRechazo("solamenteletras")).contains("números o símbolos");
        // Sin "123456", que la lista rechazaría antes de llegar a esta regla.
        assertThat(PasswordPolicy.motivoDeRechazo("908070605040302")).contains("números o símbolos");
    }
}
