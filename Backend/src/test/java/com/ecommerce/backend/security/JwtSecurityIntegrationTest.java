package com.ecommerce.backend.security;

import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.service.CartService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test d'integrazione end-to-end della sicurezza JWT.
 *
 * A differenza dei {@code @WebMvcTest} sui controller (dove JwtService è
 * mockato per isolare la logica del controller), qui gira il contesto Spring
 * completo con il vero {@link JwtService} e il vero {@link JwtAuthenticationFilter}:
 * verifica che token e controllo di ownership funzionino insieme, non i due
 * pezzi separatamente.
 */
@SpringBootTest
@AutoConfigureMockMvc
class JwtSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private CartService cartService;

    @Test
    void richiestaSenzaToken_vieneRifiutataCon401() throws Exception {
        mockMvc.perform(get("/api/cart/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void richiestaConTokenValidoMaUserIdDiversoDalPath_ricevono403() throws Exception {
        String token = jwtService.generateToken(2L);

        mockMvc.perform(get("/api/cart/1").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void richiestaConTokenValidoEUserIdCorretto_vieneServita() throws Exception {
        String token = jwtService.generateToken(1L);
        when(cartService.getCarrelloByUserId(1L)).thenReturn(List.of(new CartItem()));

        mockMvc.perform(get("/api/cart/1").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void richiestaConTokenManomesso_vieneRifiutataCon401() throws Exception {
        String token = jwtService.generateToken(1L);
        String manomesso = token.substring(0, token.length() - 2) + "xx";

        mockMvc.perform(get("/api/cart/1").header("Authorization", "Bearer " + manomesso))
                .andExpect(status().isUnauthorized());
    }
}
