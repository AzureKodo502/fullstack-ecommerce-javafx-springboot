package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AddToCartRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.service.CartService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link CartController} con MockMvc.
 */
@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartService cartService;

    @Test
    void getCarrello_ritornaGliArticoliDellUtente() throws Exception {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setQuantita(2);
        item.setTaglia(42);
        when(cartService.getCarrelloByUserId(1L)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/cart/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantita").value(2))
                .andExpect(jsonPath("$[0].taglia").value(42));
    }

    @Test
    void aggiungi_ritorna200EIlCartItemSalvato() throws Exception {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setQuantita(1);
        when(cartService.aggiungiAlCarrello(any(AddToCartRequest.class))).thenReturn(item);

        mockMvc.perform(post("/api/cart/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"scarpaId":10,"quantita":1,"taglia":42}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantita").value(1));
    }

    @Test
    void rimuovi_delegaAlServiceIParametriDelBodyERitornaMessaggio() throws Exception {
        mockMvc.perform(post("/api/cart/remove")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId":1,"scarpaId":10,"quantita":1,"taglia":42}
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("Rimosso"));

        verify(cartService).rimuoviDalCarrello(1L, 10L, 42);
    }
}
