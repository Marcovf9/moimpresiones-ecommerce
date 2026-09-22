package com.moimpresiones.api.analytics;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint publico donde el sitio avisa que alguien vio una pantalla.
 *
 * <p>Responde 204 siempre, incluso si descarta el evento: un error aca no
 * tiene por que ensuciar la consola del visitante ni retrasar la navegacion.
 */
@RestController
@RequestMapping("/api/track")
public class TrackingController {

    private final AnalyticsService analytics;

    public TrackingController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrar(@RequestBody VistaRequest request, HttpServletRequest http) {
        analytics.registrar(request.path(), request.productSlug(), request.referrer(), http);
    }

    public record VistaRequest(
            @Size(max = 300) String path,
            @Size(max = 140) String productSlug,
            @Size(max = 500) String referrer) {
    }
}
