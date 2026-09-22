package com.moimpresiones.api.finishing;

import com.moimpresiones.api.common.ConflictException;
import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.finishing.dto.FinishingDto;
import com.moimpresiones.api.finishing.dto.SaveFinishingRequest;
import com.moimpresiones.api.media.MediaStorage;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Gestion de las terminaciones desde el panel. Requiere token de administrador. */
@RestController
@RequestMapping("/api/admin/finishings")
@Transactional
public class AdminFinishingController {

    private final FinishingRepository finishings;
    private final MediaStorage media;

    public AdminFinishingController(FinishingRepository finishings, MediaStorage media) {
        this.finishings = finishings;
        this.media = media;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<FinishingDto> list() {
        return finishings.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(FinishingService::toDto)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinishingDto create(@Valid @RequestBody SaveFinishingRequest request) {
        if (finishings.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe una terminacion con el slug '" + request.slug() + "'");
        }
        Finishing finishing = new Finishing();
        applyTo(finishing, request);
        return FinishingService.toDto(finishings.save(finishing));
    }

    @PutMapping("/{slug}")
    public FinishingDto update(@PathVariable String slug, @Valid @RequestBody SaveFinishingRequest request) {
        Finishing finishing = finishings.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("la terminacion", slug));
        if (!finishing.getSlug().equals(request.slug()) && finishings.existsBySlug(request.slug())) {
            throw new ConflictException("Ya existe una terminacion con el slug '" + request.slug() + "'");
        }
        // Si cambiaron la foto, la anterior deja de usarse y se borra del disco.
        String previousImage = finishing.getImageUrl();
        applyTo(finishing, request);
        if (previousImage != null && !previousImage.equals(finishing.getImageUrl())) {
            media.delete(previousImage);
        }
        return FinishingService.toDto(finishing);
    }

    @DeleteMapping("/{slug}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String slug) {
        Finishing finishing = finishings.findBySlug(slug)
                .orElseThrow(() -> NotFoundException.of("la terminacion", slug));
        media.delete(finishing.getImageUrl());
        finishings.delete(finishing);
    }

    private void applyTo(Finishing finishing, SaveFinishingRequest request) {
        finishing.setSlug(request.slug());
        finishing.setName(request.name());
        finishing.setDescription(request.description());
        finishing.setImageUrl(request.imageUrl());
        finishing.setDisplayOrder(request.displayOrder());
    }
}
