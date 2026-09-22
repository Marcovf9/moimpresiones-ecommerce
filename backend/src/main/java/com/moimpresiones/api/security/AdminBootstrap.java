package com.moimpresiones.api.security;

import com.moimpresiones.api.user.AdminUser;
import com.moimpresiones.api.user.AdminUserRepository;
import java.security.SecureRandom;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Crea el primer usuario del panel cuando la tabla esta vacia.
 *
 * <p>La contrasena nunca se versiona: se toma de ADMIN_PASSWORD y, si esa variable
 * no esta definida, se genera una al azar y se imprime una unica vez en el log
 * para que quede constancia en el arranque de desarrollo.
 */
@Configuration
public class AdminBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    @Bean
    ApplicationRunner createInitialAdmin(AdminUserRepository users, PasswordEncoder encoder,
            @Value("${ADMIN_USERNAME:admin}") String username,
            @Value("${ADMIN_PASSWORD:}") String configuredPassword) {

        return args -> {
            if (users.count() > 0) {
                return;
            }

            boolean generated = configuredPassword == null || configuredPassword.isBlank();
            String password = generated ? randomPassword() : configuredPassword;

            AdminUser admin = new AdminUser();
            admin.setUsername(username);
            admin.setPasswordHash(encoder.encode(password));
            admin.setFullName("Administrador");
            admin.setRole("ROLE_ADMIN");
            users.save(admin);

            if (generated) {
                log.warn("""

                        ===========================================================
                         Usuario inicial del panel creado
                           usuario:    {}
                           contrasena: {}
                         Guardala ahora: no vuelve a mostrarse.
                         En produccion defini ADMIN_USERNAME y ADMIN_PASSWORD.
                        ===========================================================
                        """, username, password);
            } else {
                log.info("Usuario inicial del panel creado a partir de ADMIN_USERNAME/ADMIN_PASSWORD: {}", username);
            }
        };
    }

    private static String randomPassword() {
        byte[] bytes = new byte[12];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
