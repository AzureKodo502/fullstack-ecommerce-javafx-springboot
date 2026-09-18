package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AddToCartRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.security.JwtService;
import com.ecommerce.backend.security.SecurityConfig;
import com.ecommerce.backend.service.CartService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link CartController} con MockMvc.
 *
 * A differenza degli altri controller, questi endpoint richiedono un utente
 * autenticato: il token JWT vero e proprio non serve (JwtService è mockato),
 * ma un'identità sì — la si inietta per richiesta con {@code authentication(...)},
 * così ogni test dichiara esplicitamente "chi sta chiamando".
 */
@WebMvcTest(CartController.class)
@Import(SecurityConfig.class) // senza questo la filter chain di Security non è mai attiva nello slice
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private JwtService jwtService;

    private Authentication autenticatoCome(Long userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, List.of());
    }

    @Test
    void getCarrello_ritornaGliArticoliDellUtente() throws Exception {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setQuantita(2);
        item.setTaglia(42);
        when(cartService.getCarrelloByUserId(1L)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/cart/1").with(authentication(autenticatoCome(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantita").value(2))
                .andExpect(jsonPath("$[0].taglia").value(42));
    }

    @Test
    void getCarrello_ritorna403_quandoLoUserIdNonEQuelloAutenticato() throws Exception {
        mockMvc.perform(get("/api/cart/1").with(authentication(autenticatoCome(2L))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCarrello_ritorna401_senzaAutenticazione() throws Exception {
        mockMvc.perform(get("/api/cart/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void aggiungi_ritorna200EIlCartItemSalvato() throws Exception {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setQuantita(1);
        when(cartService.aggiungiAlCarrello(any(AddToCartRequest.class))).thenReturn(item);

        mockMvc.perform(post("/api/cart/add")
                        .with(authentication(autenticatoCome(1L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"scarpaId":10,"quantita":1,"taglia":42}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantita").value(1));
    }

    @Test
    void aggiungi_ritorna403_quandoLuserIdNelBodyNonEQuelloAutenticato() throws Exception {
        mockMvc.perform(post("/api/cart/add")
                        .with(authentication(autenticatoCome(2L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"scarpaId":10,"quantita":1,"taglia":42}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void rimuovi_delegaAlServiceIParametriDelBodyERitornaMessaggio() throws Exception {
        mockMvc.perform(post("/api/cart/remove")
                        .with(authentication(autenticatoCome(1L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"scarpaId":10,"quantita":1,"taglia":42}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Rimosso"));

        verify(cartService).rimuoviDalCarrello(1L, 10L, 42);
    }
}
