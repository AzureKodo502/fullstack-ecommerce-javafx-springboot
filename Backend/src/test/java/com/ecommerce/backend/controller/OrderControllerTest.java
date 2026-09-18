package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.security.JwtService;
import com.ecommerce.backend.security.SecurityConfig;
import com.ecommerce.backend.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link OrderController} con MockMvc: la traduzione
 * dell'eccezione "carrello vuoto" in 400, e il controllo di ownership che
 * impedisce di fare checkout o leggere lo storico per conto di un altro utente.
 */
@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class) // senza questo la filter chain di Security non è mai attiva nello slice
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private JwtService jwtService;

    private Authentication autenticatoCome(Long userId) {
        return new UsernamePasswordAuthenticationToken(userId, null, List.of());
    }

    @Test
    void checkout_ritorna200ELOrdineCreato() throws Exception {
        Order order = new Order();
        order.setId(1L);
        order.setTotale(250.0);
        order.setStato("CONFERMATO");
        when(orderService.creaOrdine(1L)).thenReturn(order);

        mockMvc.perform(post("/api/orders/checkout/1").with(authentication(autenticatoCome(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totale").value(250.0))
                .andExpect(jsonPath("$.stato").value("CONFERMATO"));
    }

    @Test
    void checkout_ritorna400_quandoIlServiceLanciaEccezione() throws Exception {
        when(orderService.creaOrdine(1L)).thenThrow(new RuntimeException("Il carrello è vuoto!"));

        mockMvc.perform(post("/api/orders/checkout/1").with(authentication(autenticatoCome(1L))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void checkout_ritorna403_quandoLoUserIdNonEQuelloAutenticato() throws Exception {
        mockMvc.perform(post("/api/orders/checkout/1").with(authentication(autenticatoCome(99L))))
                .andExpect(status().isForbidden());
    }

    @Test
    void checkout_ritorna401_senzaAutenticazione() throws Exception {
        mockMvc.perform(post("/api/orders/checkout/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void storico_ritornaGliOrdiniDellUtente() throws Exception {
        Order order = new Order();
        order.setId(1L);
        order.setTotale(99.99);
        when(orderService.getOrdiniUtente(7L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/user/7").with(authentication(autenticatoCome(7L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totale").value(99.99));
    }

    @Test
    void storico_ritorna403_quandoLoUserIdNonEQuelloAutenticato() throws Exception {
        mockMvc.perform(get("/api/orders/user/7").with(authentication(autenticatoCome(1L))))
                .andExpect(status().isForbidden());
    }
}
