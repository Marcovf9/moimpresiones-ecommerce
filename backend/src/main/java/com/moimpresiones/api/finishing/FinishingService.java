package com.moimpresiones.api.finishing;

import com.moimpresiones.api.common.NotFoundException;
import com.moimpresiones.api.finishing.dto.FinishingDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FinishingService {

    private final FinishingRepository finishings;

    public FinishingService(FinishingRepository finishings) {
        this.finishings = finishings;
    }

    public List<FinishingDto> listAll() {
        return finishings.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(FinishingService::toDto)
                .toList();
    }

    public FinishingDto getBySlug(String slug) {
        return finishings.findBySlug(slug)
                .map(FinishingService::toDto)
                .orElseThrow(() -> NotFoundException.of("la terminacion", slug));
    }

    static FinishingDto toDto(Finishing finishing) {
        return new FinishingDto(
                finishing.getId(),
                finishing.getSlug(),
                finishing.getName(),
                finishing.getDescription(),
                finishing.getImageUrl(),
                finishing.getDisplayOrder());
    }
}
