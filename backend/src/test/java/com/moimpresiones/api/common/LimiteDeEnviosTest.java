package com.moimpresiones.api.common;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class LimiteDeEnviosTest {

    @Test
    void dejaPasarHastaElTope() {
        LimiteDeEnvios limite = new LimiteDeEnvios();

        assertThatCode(() -> {
            for (int i = 0; i < 3; i++) {
                limite.registrar("1.2.3.4", 3);
            }
        }).doesNotThrowAnyException();
    }

    @Test
    void cortaElSiguiente() {
        LimiteDeEnvios limite = new LimiteDeEnvios();
        for (int i = 0; i < 3; i++) {
            limite.registrar("1.2.3.4", 3);
        }

        assertThatThrownBy(() -> limite.registrar("1.2.3.4", 3))
                .isInstanceOf(DemasiadosEnviosException.class)
                .hasMessageContaining("WhatsApp");
    }

    @Test
    void cuentaCadaDireccionPorSeparado() {
        LimiteDeEnvios limite = new LimiteDeEnvios();
        for (int i = 0; i < 3; i++) {
            limite.registrar("1.2.3.4", 3);
        }

        // Que un visitante agote su tope no puede dejar afuera a los demas.
        assertThatCode(() -> limite.registrar("5.6.7.8", 3)).doesNotThrowAnyException();
    }

    /**
     * El endpoint es publico: nada impide que lleguen varios pedidos a la vez
     * desde la misma direccion, que es justo lo que haria un script.
     */
    @Test
    void conVariosPedidosALaVezNoDejaPasarDeMas() throws Exception {
        LimiteDeEnvios limite = new LimiteDeEnvios();
        int tope = 10;
        AtomicInteger aceptados = new AtomicInteger();

        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            List<Callable<Void>> intentos = IntStream.range(0, 50)
                    .<Callable<Void>>mapToObj(i -> () -> {
                        try {
                            limite.registrar("1.2.3.4", tope);
                            aceptados.incrementAndGet();
                        } catch (DemasiadosEnviosException esperado) {
                            // El tope hizo lo suyo.
                        }
                        return null;
                    })
                    .toList();

            for (Future<Void> resultado : pool.invokeAll(intentos)) {
                resultado.get();
            }
        }

        assertThat(aceptados).hasValue(tope);
    }
}
