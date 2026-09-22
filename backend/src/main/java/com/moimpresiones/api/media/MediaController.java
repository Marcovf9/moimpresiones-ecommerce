package com.moimpresiones.api.media;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Subida de imagenes y videos desde el panel de administracion. */
@RestController
@RequestMapping("/api/admin/media")
public class MediaController {

    private final MediaStorage storage;

    public MediaController(MediaStorage storage) {
        this.storage = storage;
    }

    /** @return {"url": "/media/<archivo>"} para guardar en el producto o la terminacion. */
    @PostMapping
    public UploadedMedia upload(@RequestParam("file") MultipartFile file) {
        return new UploadedMedia(storage.store(file));
    }

    @DeleteMapping
    public void delete(@RequestParam("url") String url) {
        storage.delete(url);
    }

    public record UploadedMedia(String url) {
    }
}
