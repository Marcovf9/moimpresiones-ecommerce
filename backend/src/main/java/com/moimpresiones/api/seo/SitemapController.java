package com.moimpresiones.api.seo;

import com.moimpresiones.api.catalog.Product;
import com.moimpresiones.api.catalog.ProductRepository;
import com.moimpresiones.api.config.AppProperties;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

/**
 * Sitemap y robots.txt generados a partir del catalogo, para que las fichas de
 * producto nuevas aparezcan en Google sin que nadie tenga que editar un archivo.
 */
@RestController
public class SitemapController {

    private static final ZoneId CORDOBA = ZoneId.of("America/Argentina/Cordoba");

    /** Paginas fijas del sitio, con su prioridad relativa. */
    private static final List<String[]> PAGINAS_FIJAS = List.of(
            new String[] {"/", "1.0"},
            new String[] {"/productos", "0.9"},
            new String[] {"/terminaciones", "0.8"},
            new String[] {"/cotiza", "0.8"},
            new String[] {"/preguntas-frecuentes", "0.6"},
            new String[] {"/terminos", "0.2"},
            new String[] {"/privacidad", "0.2"});

    private final ProductRepository products;
    private final AppProperties properties;

    public SitemapController(ProductRepository products, AppProperties properties) {
        this.products = products;
        this.properties = properties;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<String> sitemap() {
        String base = baseUrl();
        if (base.isEmpty()) {
            // Sin dominio configurado, un sitemap con URLs relativas seria invalido.
            return ResponseEntity.notFound().build();
        }

        String hoy = LocalDate.now(CORDOBA).toString();
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        for (String[] pagina : PAGINAS_FIJAS) {
            appendUrl(xml, base + pagina[0], hoy, pagina[1]);
        }

        for (Product product : products.findByActiveTrueOrderByDisplayOrderAscNameAsc()) {
            String fecha = product.getUpdatedAt().atZone(CORDOBA).toLocalDate().toString();
            appendUrl(xml, base + "/productos/" + product.getSlug(), fecha, "0.7");
        }

        xml.append("</urlset>\n");
        return ResponseEntity.ok(xml.toString());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots() {
        String base = baseUrl();
        StringBuilder txt = new StringBuilder("User-agent: *\n");
        // El panel no tiene nada que hacer en un buscador.
        txt.append("Disallow: /admin\n");
        txt.append("Disallow: /api/\n");
        txt.append("Allow: /\n");
        if (!base.isEmpty()) {
            txt.append("\nSitemap: ").append(base).append("/sitemap.xml\n");
        }
        return txt.toString();
    }

    private static void appendUrl(StringBuilder xml, String loc, String lastmod, String priority) {
        xml.append("  <url>\n")
                .append("    <loc>").append(HtmlUtils.htmlEscape(loc)).append("</loc>\n")
                .append("    <lastmod>").append(lastmod).append("</lastmod>\n")
                .append("    <priority>").append(priority).append("</priority>\n")
                .append("  </url>\n");
    }

    /** Normaliza la URL configurada quitando la barra final. */
    private String baseUrl() {
        String url = properties.getPublicUrl();
        if (url == null || url.isBlank()) {
            return "";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url.trim();
    }
}
