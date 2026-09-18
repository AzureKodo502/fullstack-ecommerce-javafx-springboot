package com.ecommerce.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

/**
 * Componente responsabile della generazione e della validazione dei JSON Web
 * Token usati per autenticare le richieste dopo il login.
 *
 * Il token porta come subject l'id dell'utente: è tutto ciò che serve al
 * {@link JwtAuthenticationFilter} per stabilire "chi sta chiamando" a ogni
 * richiesta, senza dover consultare il database (autenticazione stateless).
 */
@Component
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                       @Value("${jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.expirationMs = expirationMs;
    }

    /**
     * Genera un token firmato (HS256) per l'utente indicato.
     * @param userId identificativo dell'utente, diventa il subject del token.
     * @return il JWT compattato, pronto per l'header {@code Authorization: Bearer <token>}.
     */
    public String generateToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Estrae l'id utente dal token, verificandone firma e scadenza.
     * @param token il JWT ricevuto nell'header Authorization (senza il prefisso "Bearer ").
     * @return l'id dell'utente autenticato.
     * @throws JwtException se il token è scaduto, manomesso o malformato.
     */
    public Long extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }
}
