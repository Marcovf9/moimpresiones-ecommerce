package com.moimpresiones.api.analytics;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

/**
 * Convierte al visitante en un identificador anonimo, para poder contar
 * personas distintas sin guardar nada que las identifique.
 *
 * <p>El hash mezcla IP, user agent, la fecha y una sal del servidor. Incluir
 * la fecha hace que cambie cada dia, asi que no sirve para seguir a nadie a lo
 * largo del tiempo. La sal se genera al arrancar y no se persiste: sin ella,
 * alguien con la base podria probar todas las IP posibles hasta dar con el
 * hash, porque el espacio de direcciones es chico.
 *
 * <p>La contrapartida es que reiniciar el servidor corta la continuidad de los
 * visitantes unicos dentro del dia. Es el precio de no poder desandar el hash.
 */
@Component
public class VisitorHasher {

    private final String sal;

    public VisitorHasher() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        this.sal = Base64.getEncoder().encodeToString(bytes);
    }

    public String hash(String ip, String userAgent, LocalDate dia) {
        String material = sal + "|" + dia + "|" + (ip == null ? "" : ip) + "|"
                + (userAgent == null ? "" : userAgent);
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(sha.digest(material.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 es parte de la plataforma; si falta, algo esta muy roto.
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }
}
