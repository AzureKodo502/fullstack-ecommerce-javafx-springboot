package com.ecommerce.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Test unitari puri di {@link JwtService} — nessun contesto Spring: il
 * costruttore prende i parametri direttamente, quindi si istanzia come una
 * classe qualsiasi. Copre il ciclo di vita del token: generazione, lettura,
 * e i tre modi in cui una validazione può fallire (manomissione, scadenza,
 * input non JWT).
 */
class JwtServiceTest {

    private static final String SECRET = "3/JqrvB6Xi+M1L9Q8WUNFjqkbgAHglf2i8Zt9OtGtbDsdJUnvskKLFSILfGu4V5/";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60_000); // scadenza tra 1 minuto
    }

    @Test
    void generateTokenEPoiExtractUserId_ritornaLoStessoId() {
        String token = jwtService.generateToken(42L);

        assertThat(jwtService.extractUserId(token)).isEqualTo(42L);
    }

    @Test
    void extractUserId_lanciaEccezione_conTokenManomesso() {
        String token = jwtService.generateToken(1L);
        String manomesso = token.substring(0, token.length() - 2) + "xx";

        assertThatThrownBy(() -> jwtService.extractUserId(manomesso))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void extractUserId_lanciaEccezione_conTokenScaduto() {
        JwtService serviceConScadenzaImmediata = new JwtService(SECRET, -1);
        String token = serviceConScadenzaImmediata.generateToken(1L);

        assertThatThrownBy(() -> serviceConScadenzaImmediata.extractUserId(token))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void extractUserId_lanciaEccezione_conStringaCheNonEUnJwt() {
        assertThatThrownBy(() -> jwtService.extractUserId("questa-non-e-un-token"))
                .isInstanceOf(JwtException.class);
    }
}
