package com.moimpresiones.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuracion propia de la aplicacion, mapeada desde el prefijo "app" de application.yml.
 */
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /** Origenes permitidos por CORS, separados por coma. */
    private String corsAllowedOrigins = "http://localhost:5173";

    /** Donde se guardan las imagenes del panel: "local" o "cloudinary". */
    private String mediaProvider = "local";

    /** Carpeta del disco donde se guardan las imagenes, solo en modo local. */
    private String mediaStoragePath = "./uploads";

    /** Donde van los adjuntos de las cotizaciones: "local" o "cloudinary". */
    private String attachmentProvider = "local";

    /** Prefijo de URL bajo el que se publican esas imagenes. */
    private String mediaPublicPath = "/media";

    /** URL publica del sitio, sin barra final. Necesaria para el sitemap. */
    private String publicUrl = "";

    private Jwt jwt = new Jwt();

    private Contact contact = new Contact();

    private Notificaciones notificaciones = new Notificaciones();

    /** Avisos por correo al equipo de la imprenta. */
    public static class Notificaciones {

        private String emailDestino = "";

        /** Si queda vacio se usa la cuenta con la que se autentica el SMTP. */
        private String emailRemitente = "";

        public String getEmailDestino() {
            return emailDestino;
        }

        public void setEmailDestino(String emailDestino) {
            this.emailDestino = emailDestino;
        }

        public String getEmailRemitente() {
            return emailRemitente;
        }

        public void setEmailRemitente(String emailRemitente) {
            this.emailRemitente = emailRemitente;
        }
    }

    public static class Jwt {
        private String secret = "";
        private long expirationMinutes = 480;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMinutes() {
            return expirationMinutes;
        }

        public void setExpirationMinutes(long expirationMinutes) {
            this.expirationMinutes = expirationMinutes;
        }
    }

    /** Datos de contacto de la imprenta, usados por el menu y por el cotizador. */
    public static class Contact {

        /** Numero de WhatsApp en formato internacional sin signos: 549351XXXXXXX. */
        private String whatsappNumber = "";

        private String instagramUrl = "";

        private String email = "";

        public String getWhatsappNumber() {
            return whatsappNumber;
        }

        public void setWhatsappNumber(String whatsappNumber) {
            this.whatsappNumber = whatsappNumber;
        }

        public String getInstagramUrl() {
            return instagramUrl;
        }

        public void setInstagramUrl(String instagramUrl) {
            this.instagramUrl = instagramUrl;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public String[] getCorsOriginsArray() {
        return corsAllowedOrigins.split("\\s*,\\s*");
    }

    public String getCorsAllowedOrigins() {
        return corsAllowedOrigins;
    }

    public void setCorsAllowedOrigins(String corsAllowedOrigins) {
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    public String getMediaProvider() {
        return mediaProvider;
    }

    public void setMediaProvider(String mediaProvider) {
        this.mediaProvider = mediaProvider;
    }

    public String getAttachmentProvider() {
        return attachmentProvider;
    }

    public void setAttachmentProvider(String attachmentProvider) {
        this.attachmentProvider = attachmentProvider;
    }

    public String getMediaStoragePath() {
        return mediaStoragePath;
    }

    public void setMediaStoragePath(String mediaStoragePath) {
        this.mediaStoragePath = mediaStoragePath;
    }

    public String getMediaPublicPath() {
        return mediaPublicPath;
    }

    public void setMediaPublicPath(String mediaPublicPath) {
        this.mediaPublicPath = mediaPublicPath;
    }

    public String getPublicUrl() {
        return publicUrl;
    }

    public void setPublicUrl(String publicUrl) {
        this.publicUrl = publicUrl;
    }

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Notificaciones getNotificaciones() {
        return notificaciones;
    }

    public void setNotificaciones(Notificaciones notificaciones) {
        this.notificaciones = notificaciones;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }
}
