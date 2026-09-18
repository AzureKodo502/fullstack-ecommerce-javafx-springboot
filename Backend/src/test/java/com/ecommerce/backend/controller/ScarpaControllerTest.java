package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.security.JwtService;
import com.ecommerce.backend.service.ScarpaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link ScarpaController} con MockMvc.
 */
@WebMvcTest(ScarpaController.class)
class ScarpaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ScarpaService scarpaService;

    // Il contesto di sicurezza carica comunque JwtAuthenticationFilter (che dipende
    // da JwtService); qui non serve stub perché gli endpoint /api/products/** sono
    // pubblici, ma il bean deve esistere perché il contesto Spring parta.
    @MockitoBean
    private JwtService jwtService;

    @Test
    void getListaScarpe_ritornaUnArrayJson() throws Exception {
        Scarpa s = Scarpa.builder().id(1L).nome("Air Max").marchio("Nike").prezzo(129.99).build();
        when(scarpaService.getAllScarpe()).thenReturn(List.of(s));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Air Max"))
                .andExpect(jsonPath("$[0].marchio").value("Nike"));
    }

    @Test
    void ricerca_passaLaQueryStringAlService() throws Exception {
        when(scarpaService.cercaScarpe("air")).thenReturn(List.of());

        mockMvc.perform(get("/api/products/search").param("q", "air"))
                .andExpect(status().isOk());

        verify(scarpaService).cercaScarpe("air");
    }

    @Test
    void filtraPerMarchio_usaLaPathVariable() throws Exception {
        when(scarpaService.getScarpeByMarchio("Nike")).thenReturn(List.of());

        mockMvc.perform(get("/api/products/brand/Nike"))
                .andExpect(status().isOk());

        verify(scarpaService).getScarpeByMarchio("Nike");
    }

    @Test
    void aggiungiScarpa_deserializzaIlBodyERitornaLEntitaSalvata() throws Exception {
        Scarpa saved = Scarpa.builder().id(99L).nome("Nuova").marchio("Nike").build();
        when(scarpaService.salvaScarpa(any(Scarpa.class))).thenReturn(saved);

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Nuova","marchio":"Nike","prezzo":100.0}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(99))
                .andExpect(jsonPath("$.nome").value("Nuova"));
    }
}
