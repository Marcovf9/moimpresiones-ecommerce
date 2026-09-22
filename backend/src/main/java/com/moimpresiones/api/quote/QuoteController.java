package com.moimpresiones.api.quote;

import com.moimpresiones.api.quote.dto.ContactInfo;
import com.moimpresiones.api.quote.dto.CreateQuoteRequest;
import com.moimpresiones.api.quote.dto.QuoteCreatedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Endpoints publicos del cotizador y de los datos de contacto. */
@RestController
@RequestMapping("/api")
public class QuoteController {

    private final QuoteService quotes;

    public QuoteController(QuoteService quotes) {
        this.quotes = quotes;
    }

    @PostMapping("/quotes")
    @ResponseStatus(HttpStatus.CREATED)
    public QuoteCreatedResponse create(@Valid @RequestBody CreateQuoteRequest request) {
        return quotes.create(request);
    }

    /** Datos que despliega el menu al tocar "Contacto". */
    @GetMapping("/contact")
    public ContactInfo contact() {
        return quotes.contactInfo();
    }
}
