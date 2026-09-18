package com.example.progetto_ecommerce_v3.service;

import com.example.progetto_ecommerce_v3.Model.Utente;

/**
 * Esito di login/registrazione lato backend: l'utente autenticato più il
 * token JWT da usare per le richieste successive (salvato in
 * {@link com.example.progetto_ecommerce_v3.Database.SessionManager}).
 */
public record AuthResult(Utente utente, String token) {
}
