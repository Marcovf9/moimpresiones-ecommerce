package com.moimpresiones.api.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Publica las imagenes subidas desde el panel admin como archivos estaticos. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties properties;

    public WebConfig(AppProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path storage = Paths.get(properties.getMediaStoragePath()).toAbsolutePath().normalize();
        registry.addResourceHandler(properties.getMediaPublicPath() + "/**")
                .addResourceLocations(storage.toUri().toString())
                .setCachePeriod(3600);
    }
}
