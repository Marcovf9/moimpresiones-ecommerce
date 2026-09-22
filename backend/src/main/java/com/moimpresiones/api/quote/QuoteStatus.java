package com.moimpresiones.api.quote;

/** Estado de seguimiento de un pedido de cotizacion en la bandeja del panel. */
public enum QuoteStatus {

    /** Recien llegado, nadie lo atendio todavia. */
    PENDIENTE,

    /** Se le respondio al cliente y se espera su definicion. */
    RESPONDIDA,

    /** Se cerro: el trabajo se hizo, o el cliente no siguio adelante. */
    CERRADA
}
