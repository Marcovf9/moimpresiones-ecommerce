package com.moimpresiones.api.security;

import com.moimpresiones.api.user.AdminUser;
import com.moimpresiones.api.user.AdminUserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Cambio de contrasena del panel, para que el dueno no dependa de nadie. */
@RestController
@RequestMapping("/api/admin/password")
public class PasswordController {

    private static final Logger log = LoggerFactory.getLogger(PasswordController.class);

    private final AdminUserRepository users;
    private final PasswordEncoder encoder;

    public PasswordController(AdminUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @PostMapping
    @Transactional
    public void cambiar(@Valid @RequestBody CambioRequest request, Authentication auth) {
        AdminUser user = users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión inválida"));

        // Pedimos la actual aunque la sesion este iniciada: si alguien deja el
        // panel abierto, no deberia poder cambiarla sin conocerla.
        if (!encoder.matches(request.actual(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");
        }

        String rechazo = PasswordPolicy.motivoDeRechazo(request.nueva());
        if (rechazo != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, rechazo);
        }
        if (request.nueva().equals(request.actual())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña tiene que ser distinta");
        }

        user.setPasswordHash(encoder.encode(request.nueva()));
        log.info("Contraseña cambiada para '{}'", user.getUsername());
    }

    public record CambioRequest(
            @NotBlank(message = "Ingresá tu contraseña actual") String actual,
            @NotBlank(message = "Ingresá la nueva contraseña") String nueva) {
    }
}
