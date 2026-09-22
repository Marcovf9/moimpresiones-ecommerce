package com.moimpresiones.api.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * La normalizacion de Java tiene que dar lo mismo que unaccent() en la base.
 * Si divergen, el buscador deja de encontrar cosas sin dar ninguna senal.
 */
class TextoTest {

    @Test
    void quitaTildesYPasaAMinusculas() {
        assertThat(Texto.normalizar("Cómics")).isEqualTo("comics");
        assertThat(Texto.normalizar("IMPRESIÓN")).isEqualTo("impresion");
        assertThat(Texto.normalizar("Góndola")).isEqualTo("gondola");
    }

    @Test
    void tambienConLaEnie() {
        // La ñ se descompone en n + virgulilla, igual que en unaccent().
        assertThat(Texto.normalizar("Cuño en seco")).isEqualTo("cuno en seco");
        assertThat(Texto.normalizar("tamaño")).isEqualTo("tamano");
    }

    @Test
    void recortaLosExtremos() {
        assertThat(Texto.normalizar("  Estuches  ")).isEqualTo("estuches");
    }

    @Test
    void toleraLaAusenciaDeValor() {
        assertThat(Texto.normalizar(null)).isEmpty();
        assertThat(Texto.normalizar("   ")).isEmpty();
    }
}
