package com.example.progetto_ecommerce_v3.service;

import com.example.progetto_ecommerce_v3.Database.SessionManager;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

public class ApiClient {

    private static ApiClient instance;
    private final HttpClient client;
    // Indirizzo del backend locale
    private static final String BASE_URL = "http://localhost:8080/api";

    private ApiClient() {
        this.client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(10)) // Timeout se il server è spento
                .build();
    }

    public static ApiClient getInstance() {
        if (instance == null) {
            instance = new ApiClient();
        }
        return instance;
    }

    // Metodo generico per fare richieste GET (Restituisce il JSON grezzo)
    public CompletableFuture<String> get(String endpoint) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .GET()
                .header("Content-Type", "application/json");
        aggiungiTokenSePresente(builder);

        return client.sendAsync(builder.build(), HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() != 200) {
                        throw new RuntimeException("Errore HTTP: " + response.statusCode());
                    }
                    return response.body(); // Ritorna il JSON come stringa
                });
    }

    // Metodo generico per fare richieste POST (Login, Registrazione, Ordini)
    public CompletableFuture<String> post(String endpoint, String jsonBody) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .header("Content-Type", "application/json");
        aggiungiTokenSePresente(builder);

        return client.sendAsync(builder.build(), HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    // 200 (OK) o 201 (CREATO)
                    if (response.statusCode() >= 200 && response.statusCode() < 300) {
                        return response.body();
                    } else {
                        // Errore se il server risponde 401 o 400
                        throw new RuntimeException("Errore HTTP: " + response.statusCode());
                    }
                });
    }

    // Il backend ora richiede un JWT su carrello e ordini: se l'utente è loggato
    // (e quindi SessionManager ha un token), lo allega a ogni richiesta.
    // Login e registrazione restano pubblici, quindi funzionano anche senza.
    private void aggiungiTokenSePresente(HttpRequest.Builder builder) {
        String token = SessionManager.getInstance().getToken();
        if (token != null && !token.isEmpty()) {
            builder.header("Authorization", "Bearer " + token);
        }
    }
}
