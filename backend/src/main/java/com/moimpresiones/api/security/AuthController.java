package com.moimpresiones.api.security;

import com.moimpresiones.api.security.dto.LoginRequest;
import com.moimpresiones.api.security.dto.LoginResponse;
import com.moimpresiones.api.user.AdminUser;
import com.moimpresiones.api.user.AdminUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Login del panel de administracion. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AdminUserRepository users;
    private final LoginAttemptService intentos;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
            AdminUserRepository users, LoginAttemptService intentos) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.users = users;
        this.intentos = intentos;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        String porUsuario = "usuario:" + request.username().toLowerCase();
        String porIp = "ip:" + direccionDe(http);

        // Se comprueban los dos contadores: uno protege la cuenta, el otro al
        // atacante que prueba muchos usuarios desde el mismo lugar.
        for (String clave : new String[] {porUsuario, porIp}) {
            long minutos = intentos.minutosDeBloqueo(clave);
            if (minutos > 0) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Demasiados intentos fallidos. Probá de nuevo en " + minutos
                                + (minutos == 1 ? " minuto." : " minutos."));
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (AuthenticationException ex) {
            intentos.registrarFallo(porUsuario);
            intentos.registrarFallo(porIp);
            log.warn("Login fallido para '{}' desde {}", request.username(), direccionDe(http));
            // Mismo mensaje para usuario inexistente y contrasena incorrecta: decir
            // cual de los dos falla le confirma al atacante que el usuario existe.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        }

        AdminUser user = users.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Usuario o contraseña incorrectos"));

        intentos.registrarExito(porUsuario);
        intentos.registrarExito(porIp);
        log.info("Ingreso al panel: '{}' desde {}", user.getUsername(), direccionDe(http));

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, jwtService.getExpirationMinutes(), user.getUsername(), user.getFullName());
    }

    /**
     * En produccion la aplicacion queda detras de un proxy, asi que la IP real
     * llega en X-Forwarded-For y no en la conexion.
     */
    private static String direccionDe(HttpServletRequest http) {
        String reenviada = http.getHeader("X-Forwarded-For");
        if (reenviada != null && !reenviada.isBlank()) {
            // El encabezado puede traer varias: la primera es la del cliente.
            return reenviada.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}
