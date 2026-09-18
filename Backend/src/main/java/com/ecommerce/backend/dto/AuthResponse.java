package com.ecommerce.backend.dto;

/**
 * Corpo della risposta di {@code POST /api/auth/login} e
 * {@code POST /api/auth/register}: il token JWT da usare nelle richieste
 * successive (header {@code Authorization: Bearer <token>}) più i dati non
 * sensibili dell'utente autenticato.
 */
public record AuthResponse(String token, UserResponse user) {
}
