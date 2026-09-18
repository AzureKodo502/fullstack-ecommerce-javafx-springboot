package com.example.progetto_ecommerce_v3.Database;

import com.example.progetto_ecommerce_v3.Model.Utente;

public class SessionManager {

    private static SessionManager instance;
    private Utente utenteLoggato;

    // Token JWT restituito dal backend al login/registrazione. Serve a ApiClient
    // per autenticare ogni richiesta successiva (header Authorization: Bearer ...).
    private String token;

    private SessionManager() {}

    public static synchronized SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    public void Login(Utente utente, String token) {
        this.utenteLoggato = utente;
        this.token = token;
        System.out.println("Utente loggato: " + utente.Email()); // Log utile per debug
    }

    /**
     * @deprecated usare {@link #Login(Utente, String)}: senza token, le chiamate
     * successive a endpoint protetti (carrello, ordini) verranno rifiutate con 401.
     */
    @Deprecated
    public void Login(Utente utente) {
        Login(utente, null);
    }

    public void logout() {
        this.utenteLoggato = null;
        this.token = null;
    }

    public boolean isLogged() {
        return utenteLoggato != null;
    }

    public Utente getUtente() {
        return utenteLoggato;
    }

    public String getToken() {
        return token;
    }
}
