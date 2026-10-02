package com.ecommerce.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entità JPA che rappresenta l'utente all'interno del sistema.
 * Gestisce le informazioni, le credenziali di accesso e i privilegi (ruoli).
 * Questa classe funge da fulcro per le relazioni con gli ordini e gli articoli nel carrello.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /**
     * Identificativo univoco dell'utente (Primary Key).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome dell'utente, obbligatorio a livello di persistenza.
     */
    @Column(nullable = false)
    private String nome;

    /**
     * Cognome dell'utente, obbligatorio a livello di persistenza.
     */
    @Column(nullable = false)
    private String cognome;

    /**
     * Indirizzo e-mail utilizzato come login.
     * Il vincolo 'unique = true' garantisce l'integrità dei dati a livello di database,
     * impedendo registrazioni duplicate per lo stesso account.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hash della password dell'utente.
     * Non deve mai essere memorizzata in chiaro per ragioni di sicurezza, e
     * non deve mai uscire in una risposta JSON: User viaggia annidato dentro
     * CartItem e Order, quindi l'esclusione sta qui e non solo in UserResponse.
     */
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    /**
     * Definisce il livello di autorizzazione dell'utente (es. USER, ADMIN).
     * Il valore predefinito è impostato su "USER".
     * Implementazione Futura del admin.
     */
    private String role = "USER";
}