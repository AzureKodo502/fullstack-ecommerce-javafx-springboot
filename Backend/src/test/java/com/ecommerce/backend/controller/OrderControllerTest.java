package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link OrderController} con MockMvc: in particolare la
 * traduzione dell'eccezione "carrello vuoto" in un 400 Bad Request.
 */
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void checkout_ritorna200ELOrdineCreato() throws Exception {
        Order order = new Order();
        order.setId(1L);
        order.setTotale(250.0);
        order.setStato("CONFERMATO");
        when(orderService.creaOrdine(1L)).thenReturn(order);

        mockMvc.perform(post("/api/orders/checkout/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totale").value(250.0))
                .andExpect(jsonPath("$.stato").value("CONFERMATO"));
    }

    @Test
    void checkout_ritorna400_quandoIlServiceLanciaEccezione() throws Exception {
        when(orderService.creaOrdine(1L)).thenThrow(new RuntimeException("Il carrello è vuoto!"));

        mockMvc.perform(post("/api/orders/checkout/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void storico_ritornaGliOrdiniDellUtente() throws Exception {
        Order order = new Order();
        order.setId(1L);
        order.setTotale(99.99);
        when(orderService.getOrdiniUtente(7L)).thenReturn(List.of(order));

        mockMvc.perform(get("/api/orders/user/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totale").value(99.99));
    }
}
