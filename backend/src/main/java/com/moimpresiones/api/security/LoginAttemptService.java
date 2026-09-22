package com.moimpresiones.api.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Frena los intentos de adivinar la contrasena del panel.
 *
 * <p>Sin esto, el login admite intentos sin limite y una contrasena debil cae
 * en minutos. Se cuenta por usuario y por IP a la vez: solo por usuario,
 * cualquiera podria dejar al dueno afuera probando mal a proposito; solo por
 * IP, un atacante con varias direcciones lo esquiva.
 *
 * <p>El estado vive en memoria. Alcanza para un panel de un solo usuario, y
 * reiniciar el servidor limpia los bloqueos: es el compromiso aceptado a
 * cambio de no sumar una tabla ni un Redis.
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);

    private static final int INTENTOS_PERMITIDOS = 5;
    private static final Duration BLOQUEO = Duration.ofMinutes(15);
    /** Los fallos sueltos se olvidan: no queremos bloquear por errores de hace horas. */
    private static final Duration VENTANA = Duration.ofMinutes(15);

    private final Map<String, Registro> registros = new ConcurrentHashMap<>();

    private static final class Registro {
        final AtomicInteger fallos = new AtomicInteger();
        volatile Instant ultimoFallo = Instant.now();
        volatile Instant bloqueadoHasta;
    }

    /** @return los minutos que faltan para poder reintentar, o 0 si no esta bloqueado. */
    public long minutosDeBloqueo(String clave) {
        Registro r = registros.get(clave);
        if (r == null || r.bloqueadoHasta == null) {
            return 0;
        }
        Duration restante = Duration.between(Instant.now(), r.bloqueadoHasta);
        if (restante.isNegative() || restante.isZero()) {
            registros.remove(clave);
            return 0;
        }
        return Math.max(1, restante.toMinutes());
    }

    public boolean estaBloqueado(String clave) {
        return minutosDeBloqueo(clave) > 0;
    }

    public void registrarFallo(String clave) {
        Registro r = registros.computeIfAbsent(clave, k -> new Registro());

        // Si el ultimo fallo quedo lejos, se empieza a contar de nuevo.
        if (Duration.between(r.ultimoFallo, Instant.now()).compareTo(VENTANA) > 0) {
            r.fallos.set(0);
        }
        r.ultimoFallo = Instant.now();

        if (r.fallos.incrementAndGet() >= INTENTOS_PERMITIDOS) {
            r.bloqueadoHasta = Instant.now().plus(BLOQUEO);
            log.warn("Login bloqueado por {} intentos fallidos: {}", INTENTOS_PERMITIDOS, clave);
        }
    }

    public void registrarExito(String clave) {
        registros.remove(clave);
    }

    /** Limpia los registros vencidos para que el mapa no crezca sin limite. */
    public void limpiarVencidos() {
        Instant corte = Instant.now().minus(VENTANA);
        registros.entrySet().removeIf(e -> {
            Registro r = e.getValue();
            boolean bloqueoVigente = r.bloqueadoHasta != null && r.bloqueadoHasta.isAfter(Instant.now());
            return !bloqueoVigente && r.ultimoFallo.isBefore(corte);
        });
    }
}
