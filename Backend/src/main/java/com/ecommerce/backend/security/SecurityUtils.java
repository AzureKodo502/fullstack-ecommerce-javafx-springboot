package com.ecommerce.backend.security;

import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility per leggere, dal contesto di sicurezza della richiesta corrente,
 * l'id dell'utente autenticato — il principal impostato da
 * {@link JwtAuthenticationFilter} dopo aver validato il token.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * @return l'id dell'utente autenticato nella richiesta corrente.
     * @throws NullPointerException se chiamato fuori da una richiesta autenticata
     *         (non dovrebbe succedere sugli endpoint protetti da SecurityConfig).
     */
    public static Long currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (Long) principal;
    }
}
