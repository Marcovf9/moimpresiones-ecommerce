package com.moimpresiones.api.quote;

import com.moimpresiones.api.common.DireccionIp;
import com.moimpresiones.api.common.LimiteDeEnvios;
import com.moimpresiones.api.quote.dto.ContactInfo;
import com.moimpresiones.api.quote.dto.CreateQuoteRequest;
import com.moimpresiones.api.quote.dto.QuoteCreatedResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Endpoints publicos del cotizador y de los datos de contacto. */
@RestController
@RequestMapping("/api")
public class QuoteController {

    /**
     * Presupuestos por hora y por conexion. Nadie pide diez seguidos de verdad;
     * un script si, y cada uno le llega al dueno como un mail y una entrada mas
     * para revisar a mano.
     */
    private static final int PRESUPUESTOS_POR_HORA = 10;

    private final QuoteService quotes;
    private final LimiteDeEnvios limite;

    public QuoteController(QuoteService quotes, LimiteDeEnvios limite) {
        this.quotes = quotes;
        this.limite = limite;
    }

    @PostMapping("/quotes")
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteCreatedResponse create(@Valid @RequestBody CreateQuoteRequest request,
            HttpServletRequest http) {
        limite.registrar(DireccionIp.de(http), PRESUPUESTOS_POR_HORA);
        return quotes.create(request);
    }

    /** Datos que despliega el menu al tocar "Contacto". */
    @GetMapping("/contact")
    public ContactInfo contact() {
        return quotes.contactInfo();
    }
}
