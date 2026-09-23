package com.moimpresiones.api.notificaciones;

import com.moimpresiones.api.config.AppProperties;
import com.moimpresiones.api.quote.QuoteRequest;
import com.moimpresiones.api.quote.QuoteRequestRepository;
import com.moimpresiones.api.quote.QuoteStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Recuerda los pedidos que quedaron sin responder.
 *
 * <p>El aviso de cuando entra una cotizacion llega una sola vez. Si ese dia el
 * dueno esta en la maquina y no lo ve, el pedido queda en el panel y el
 * cliente termina llamando a otra imprenta. Esto vuelve a avisar pasadas unas
 * horas, una sola vez por pedido.
 *
 * <p>Se apaga solo si no hay correo configurado, igual que el resto de los
 * avisos: el sitio funciona sin esto.
 */
@Component
public class RecordatorioDeCotizaciones {

    private static final Logger log = LoggerFactory.getLogger(RecordatorioDeCotizaciones.class);


    private final QuoteRequestRepository quotes;
    private final ObjectProvider<JavaMailSender> correo;
    private final AppProperties properties;

    public RecordatorioDeCotizaciones(QuoteRequestRepository quotes,
            ObjectProvider<JavaMailSender> correo, AppProperties properties) {
        this.quotes = quotes;
        this.correo = correo;
        this.properties = properties;
    }

    /**
     * Se revisa cada hora: mas seguido no serviria, porque el corte se mide en
     * horas. Los dos valores son configurables para poder probar el aviso sin
     * esperar una hora.
     */
    @Scheduled(
            fixedDelayString = "${app.notificaciones.revision-ms:3600000}",
            initialDelayString = "${app.notificaciones.revision-inicial-ms:300000}")
    @Transactional
    public void revisar() {
        AppProperties.Notificaciones config = properties.getNotificaciones();
        int horas = config.getRecordatorioHoras();
        if (horas <= 0) return;

        JavaMailSender cliente = correo.getIfAvailable();
        String destino = config.getEmailDestino();
        if (cliente == null || destino == null || destino.isBlank()) return;

        Instant ahora = Instant.now();
        List<QuoteRequest> pendientes = quotes
                .findByStatusAndRecordatorioEnviadoEnIsNullAndCreatedAtBeforeOrderByCreatedAtAsc(
                        QuoteStatus.PENDIENTE, ahora.minus(Duration.ofHours(horas)));
        if (pendientes.isEmpty()) return;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destino);
        String remitente = config.getEmailRemitente();
        if (remitente != null && !remitente.isBlank()) {
            mensaje.setFrom(remitente);
        }
        mensaje.setSubject(MailRecordatorio.asunto(pendientes));
        mensaje.setText(MailRecordatorio.cuerpo(pendientes, properties.getPublicUrl(), ahora));

        try {
            cliente.send(mensaje);
        } catch (MailException ex) {
            // Sin marcarlas, el proximo pase vuelve a intentarlo: es preferible
            // insistir a que un fallo de correo se lleve el aviso para siempre.
            log.error("No se pudo mandar el recordatorio de {} cotizaciones: {}",
                    pendientes.size(), ex.getMessage());
            return;
        }

        pendientes.forEach(pedido -> pedido.setRecordatorioEnviadoEn(ahora));
        log.info("Recordatorio enviado por {} cotizaciones sin responder", pendientes.size());
    }
}
