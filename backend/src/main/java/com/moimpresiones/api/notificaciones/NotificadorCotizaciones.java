package com.moimpresiones.api.notificaciones;

import com.moimpresiones.api.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Avisa por correo a la imprenta cuando entra una cotizacion.
 *
 * <p>Sin el aviso, un pedido de alguien que completa el formulario pero no
 * termina de mandar el WhatsApp queda guardado en el panel y nadie se entera
 * hasta que entra a mirar.
 *
 * <p>Corre despues de confirmada la transaccion, asi no se avisa de un pedido
 * que al final no se guardo, y en otro hilo: si el servidor de correo tarda o
 * falla, el visitante no lo nota y el pedido queda igual.
 */
@Component
public class NotificadorCotizaciones {

    private static final Logger log = LoggerFactory.getLogger(NotificadorCotizaciones.class);

    /** Solo existe si hay MAIL_HOST configurado. */
    private final ObjectProvider<JavaMailSender> correo;
    private final AppProperties properties;

    public NotificadorCotizaciones(ObjectProvider<JavaMailSender> correo, AppProperties properties) {
        this.correo = correo;
        this.properties = properties;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alRecibir(CotizacionRecibida evento) {
        JavaMailSender cliente = correo.getIfAvailable();
        String destino = properties.getNotificaciones().getEmailDestino();

        if (cliente == null || destino == null || destino.isBlank()) {
            log.info("Cotizacion {} guardada; avisos por correo apagados (falta MAIL_HOST)",
                    evento.cotizacionId());
            return;
        }

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        String remitente = properties.getNotificaciones().getEmailRemitente();
        if (remitente != null && !remitente.isBlank()) {
            mensaje.setFrom(remitente);
        }
        mensaje.setSubject(evento.asunto());
        mensaje.setText(evento.cuerpo());

        try {
            cliente.send(mensaje);
            log.info("Aviso de la cotizacion {} enviado a {}", evento.cotizacionId(), destino);
        } catch (MailException ex) {
            // El pedido ya esta guardado y se ve en el panel: un fallo de correo
            // se registra, pero no se propaga.
            log.error("No se pudo avisar la cotizacion {}: {}", evento.cotizacionId(), ex.getMessage());
        }
    }
}
