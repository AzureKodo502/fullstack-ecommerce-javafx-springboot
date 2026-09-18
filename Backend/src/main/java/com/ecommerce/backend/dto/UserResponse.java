package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.User;

/**
 * Proiezione sicura di {@link User} da restituire ai client: esclude
 * deliberatamente l'hash della password, che nell'entity originale finiva
 * invece nella risposta JSON di login e registrazione.
 */
public record UserResponse(Long id, String nome, String cognome, String email, String role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getNome(), user.getCognome(), user.getEmail(), user.getRole());
    }
}
