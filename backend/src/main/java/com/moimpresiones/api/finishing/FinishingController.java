package com.moimpresiones.api.finishing;

import com.moimpresiones.api.finishing.dto.FinishingDto;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Endpoints publicos de la pagina Terminaciones. */
@RestController
@RequestMapping("/api/finishings")
public class FinishingController {

    private final FinishingService finishings;

    public FinishingController(FinishingService finishings) {
        this.finishings = finishings;
    }

    @GetMapping
    public List<FinishingDto> list() {
        return finishings.listAll();
    }

    @GetMapping("/{slug}")
    public FinishingDto detail(@PathVariable String slug) {
        return finishings.getBySlug(slug);
    }
}
