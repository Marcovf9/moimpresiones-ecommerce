package com.moimpresiones.api.quote;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class PlanillaDeCotizacionesTest {

    private static QuoteRequest cotizacion(String nombre, String mensaje) {
        QuoteRequest cotizacion = new QuoteRequest();
        cotizacion.setFullName(nombre);
        cotizacion.setPhone("3516211435");
        cotizacion.setMessage(mensaje);
        cotizacion.setCreatedAt(Instant.parse("2026-09-23T14:30:00Z"));
        return cotizacion;
    }

    @Test
    void ponePrimeroLosNombresDeColumna() {
        String csv = PlanillaDeCotizaciones.armar(List.of());

        assertThat(csv).startsWith("﻿Fecha;Estado;Nombre");
    }

    @Test
    void escribeLaFechaEnHoraDeCordoba() {
        String csv = PlanillaDeCotizaciones.armar(List.of(cotizacion("Ana", null)));

        // 14:30 UTC son las 11:30 en Cordoba.
        assertThat(csv).contains("\"23/09/2026 11:30\"");
    }

    @Test
    void elPuntoYComaDentroDeUnTextoNoCorreLasColumnas() {
        String csv = PlanillaDeCotizaciones.armar(
                List.of(cotizacion("Ana", "Urgente; para el lunes")));

        assertThat(csv).contains("\"Urgente; para el lunes\"");
    }

    @Test
    void lasComillasDeUnTextoSeDuplican() {
        String csv = PlanillaDeCotizaciones.armar(
                List.of(cotizacion("Ana", "Dice \"oferta\" en la tapa")));

        assertThat(csv).contains("\"Dice \"\"oferta\"\" en la tapa\"");
    }

    /**
     * Si el texto empieza con =, +, - o @, Excel lo toma por una formula y la
     * ejecuta al abrir el archivo. Alcanza con que alguien escriba "-500
     * unidades" en el comentario, o con que lo haga a proposito.
     */
    @Test
    void loQueParezcaFormulaSeNeutraliza() {
        String csv = PlanillaDeCotizaciones.armar(
                List.of(cotizacion("Ana", "=HYPERLINK(\"http://malo\",\"click\")")));

        assertThat(csv).contains("\"'=HYPERLINK(");
    }

    @Test
    void elPedidoEntraCompletoEnUnaCelda() {
        QuoteRequest cotizacion = cotizacion("Ana", null);
        QuoteItem tarjetas = new QuoteItem();
        tarjetas.setProductName("Tarjetas");
        tarjetas.setQuantity("1000");
        tarjetas.setFinishings("OPP mate");
        QuoteItem carpetas = new QuoteItem();
        carpetas.setProductName("Carpetas");
        cotizacion.getItems().addAll(List.of(tarjetas, carpetas));

        String csv = PlanillaDeCotizaciones.armar(List.of(cotizacion));

        assertThat(csv).contains("Tarjetas | cantidad: 1000 | terminaciones: OPP mate");
        assertThat(csv).contains("Carpetas");
    }

    @Test
    void loQueFalta_quedaVacioYNoComoNull() {
        String csv = PlanillaDeCotizaciones.armar(List.of(cotizacion("Ana", null)));

        assertThat(csv).doesNotContain("null");
    }
}
