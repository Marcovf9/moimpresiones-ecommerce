package com.moimpresiones.api.common;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Acota cuantas veces seguidas una misma direccion puede usar los endpoints
 * publicos que escriben algo.
 *
 * <p>Pedir un presupuesto y subir un archivo no exigen cuenta ni captcha: es a
 * proposito, porque cada paso de mas hace que alguien abandone la consulta. La
 * contrapartida es que un script puede llenar el panel de basura y el disco de
 * archivos, y el dueno tiene que revisar cada entrada a mano. Un tope por hora
 * deja pasar a cualquier persona real —nadie pide diez presupuestos seguidos—
 * y corta el envio automatizado.
 *
 * <p>El estado vive en memoria, como el de los intentos de login: alcanza para
 * el trafico de una imprenta y evita sumar Redis. Reiniciar el servidor limpia
 * los contadores.
 */
@Service
public class LimiteDeEnvios {

    private static final Logger log = LoggerFactory.getLogger(LimiteDeEnvios.class);

    private static final Duration VENTANA = Duration.ofHours(1);

    /** Cuantas direcciones distintas se recuerdan antes de hacer limpieza. */
    private static final int MAXIMO_DIRECCIONES = 10_000;

    private final Map<String, Deque<Instant>> envios = new ConcurrentHashMap<>();

    /**
     * Registra un envio y avisa si la direccion se paso del tope.
     *
     * @param clave identificador del que envia; hoy, su direccion IP
     * @param tope envios permitidos por hora
     * @throws DemasiadosEnviosException cuando ya uso todos los de esta hora
     */
    public void registrar(String clave, int tope) {
        Instant ahora = Instant.now();
        Instant desde = ahora.minus(VENTANA);

        if (envios.size() > MAXIMO_DIRECCIONES) limpiar(desde);

        Deque<Instant> recientes = envios.computeIfAbsent(clave, k -> new ArrayDeque<>());
        synchronized (recientes) {
            while (!recientes.isEmpty() && recientes.peekFirst().isBefore(desde)) {
                recientes.pollFirst();
            }
            if (recientes.size() >= tope) {
                log.warn("Se corto un envio: {} supero los {} por hora", clave, tope);
                throw new DemasiadosEnviosException(
                        "Recibimos varios envios desde tu conexion. Probá de nuevo en un rato, "
                                + "o escribinos por WhatsApp.");
            }
            recientes.addLast(ahora);
        }
    }

    /** Saca las direcciones que no aparecen hace mas de una ventana. */
    private void limpiar(Instant desde) {
        envios.entrySet().removeIf(entrada -> {
            Deque<Instant> marcas = entrada.getValue();
            synchronized (marcas) {
                return marcas.isEmpty() || marcas.peekLast().isBefore(desde);
            }
        });
    }
}
