package com.moimpresiones.api.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LoginAttemptServiceTest {

    private LoginAttemptService servicio;

    @BeforeEach
    void setUp() {
        servicio = new LoginAttemptService();
    }

    @Test
    void permiteReintentarMientrasNoSeAgotenLosIntentos() {
        for (int i = 0; i < 4; i++) {
            servicio.registrarFallo("usuario:admin");
            assertThat(servicio.estaBloqueado("usuario:admin")).isFalse();
        }
    }

    @Test
    void bloqueaAlQuintoFallo() {
        for (int i = 0; i < 5; i++) {
            servicio.registrarFallo("usuario:admin");
        }

        assertThat(servicio.estaBloqueado("usuario:admin")).isTrue();
        assertThat(servicio.minutosDeBloqueo("usuario:admin")).isBetween(1L, 15L);
    }

    @Test
    void unLoginCorrectoBorraLosFallosAcumulados() {
        for (int i = 0; i < 4; i++) {
            servicio.registrarFallo("usuario:admin");
        }
        servicio.registrarExito("usuario:admin");

        // Tras acertar, vuelve a tener los cinco intentos completos.
        for (int i = 0; i < 4; i++) {
            servicio.registrarFallo("usuario:admin");
            assertThat(servicio.estaBloqueado("usuario:admin")).isFalse();
        }
    }

    @Test
    void losContadoresSonIndependientesEntreClaves() {
        for (int i = 0; i < 5; i++) {
            servicio.registrarFallo("ip:1.2.3.4");
        }

        assertThat(servicio.estaBloqueado("ip:1.2.3.4")).isTrue();
        // Bloquear una IP no puede dejar afuera al dueño desde su propia conexión.
        assertThat(servicio.estaBloqueado("usuario:admin")).isFalse();
        assertThat(servicio.estaBloqueado("ip:5.6.7.8")).isFalse();
    }

    @Test
    void laLimpiezaNoBorraBloqueosVigentes() {
        for (int i = 0; i < 5; i++) {
            servicio.registrarFallo("ip:1.2.3.4");
        }
        servicio.limpiarVencidos();

        assertThat(servicio.estaBloqueado("ip:1.2.3.4")).isTrue();
    }
}
