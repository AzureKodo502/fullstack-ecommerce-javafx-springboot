package com.example.progetto_ecommerce_v3.service;

import com.example.progetto_ecommerce_v3.Model.Utente;
import java.util.concurrent.CompletableFuture;

public class UtenteService {

    // Ritorna utente + token JWT se login OK, altrimenti null
    public CompletableFuture<AuthResult> login(String email, String password) {
        // Creiamo il JSON per la richiesta
        String jsonBody = String.format("{\"email\":\"%s\", \"password\":\"%s\"}", email, password);

        return ApiClient.getInstance().post("/auth/login", jsonBody)
                .thenApply(UtenteService::parseAuthResult)
                .exceptionally(e -> {
                    e.printStackTrace();
                    return null;
                });
    }

    // Registrazione
    public CompletableFuture<AuthResult> registrazione(String nome, String cognome, String email, String password) {
        String jsonBody = String.format(
                "{\"nome\":\"%s\", \"cognome\":\"%s\", \"email\":\"%s\", \"password\":\"%s\"}",
                nome, cognome, email, password
        );

        return ApiClient.getInstance().post("/auth/register", jsonBody)
                .thenApply(UtenteService::parseAuthResult)
                .exceptionally(e -> null);
    }

    // Il backend risponde con {"token":"...","user":{...}}: se manca l'utente
    // la richiesta è fallita (credenziali errate, email già in uso, ecc.).
    private static AuthResult parseAuthResult(String responseJson) {
        Utente utente = JsonParser.parseUtente(responseJson);
        if (utente == null) return null;
        return new AuthResult(utente, JsonParser.parseToken(responseJson));
    }
}