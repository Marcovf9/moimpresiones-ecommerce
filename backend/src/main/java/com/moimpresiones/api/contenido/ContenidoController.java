package com.moimpresiones.api.contenido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Textos del sitio que edita el dueno.
 *
 * <p>El sitio los pide todos juntos en una sola consulta: son cuatro y los
 * necesita al arrancar, asi que pedirlos de a uno seria sumar viajes sin
 * ganar nada.
 *
 * <p>Las claves las define el codigo, no el panel: cada una tiene su lugar en
 * una pantalla. Guardar una clave desconocida se rechaza, porque seria un
 * texto que despues nadie muestra.
 */
@RestController
public class ContenidoController {

    /** Lo que se puede editar, con su nombre en el panel. */
    public enum Clave {
        quienes_somos("Quiénes somos", "Los párrafos de la portada. Se separan dejando un renglón vacío."),
        horario_atencion("Horario de atención", "Aparece en el pie, en «Dónde estamos» y en la ficha del negocio en Google."),
        portada_bajada("Bajada de la portada", "La línea debajo del nombre, en la primera pantalla."),
        frase_destacada("Frase destacada", "La frase resaltada al final de «Quiénes somos».");

        private final String titulo;
        private final String ayuda;

        Clave(String titulo, String ayuda) {
            this.titulo = titulo;
            this.ayuda = ayuda;
        }
    }

    private final ContenidoRepository contenidos;

    public ContenidoController(ContenidoRepository contenidos) {
        this.contenidos = contenidos;
    }

    /** Todos los textos, para el sitio publico. */
    @GetMapping("/api/contenidos")
    @Transactional(readOnly = true)
    public Map<String, String> publicos() {
        Map<String, String> mapa = new LinkedHashMap<>();
        contenidos.findAll().forEach(c -> mapa.put(c.getClave(), c.getValor()));
        return mapa;
    }

    /** Los mismos textos, con el nombre y la ayuda que muestra el panel. */
    @GetMapping("/api/admin/contenidos")
    @Transactional(readOnly = true)
    public List<TextoEditable> paraElPanel() {
        Map<String, String> valores = publicos();
        return List.of(Clave.values()).stream()
                .map(clave -> new TextoEditable(
                        clave.name(), clave.titulo, clave.ayuda, valores.getOrDefault(clave.name(), "")))
                .toList();
    }

    @PutMapping("/api/admin/contenidos/{clave}")
    @Transactional
    public TextoEditable guardar(@PathVariable Clave clave, @Valid @RequestBody CambioDeTexto cambio) {
        Contenido contenido = contenidos.findById(clave.name()).orElseGet(() -> {
            Contenido nuevo = new Contenido();
            nuevo.setClave(clave.name());
            return nuevo;
        });
        contenido.setValor(cambio.valor().trim());
        contenido.setActualizadoEn(Instant.now());
        contenidos.save(contenido);

        return new TextoEditable(clave.name(), clave.titulo, clave.ayuda, contenido.getValor());
    }

    public record CambioDeTexto(
            @NotBlank(message = "El texto no puede quedar vacío")
            @Size(max = 4000, message = "El texto es demasiado largo")
            String valor) {
    }

    public record TextoEditable(String clave, String titulo, String ayuda, String valor) {
    }
}
