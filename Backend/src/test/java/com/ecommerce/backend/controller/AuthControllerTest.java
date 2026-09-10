package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test dello strato web di {@link AuthController} con MockMvc: il service è
 * sostituito da un mock, si verificano status HTTP, mapping JSON e la
 * traduzione delle eccezioni di business in 400 / 401.
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void register_ritorna200EUtenteCreato() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setNome("Mario");
        user.setEmail("mario@example.com");
        when(authService.register(any(RegisterRequest.class))).thenReturn(user);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Mario","cognome":"Rossi","email":"mario@example.com","password":"secret"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Mario"))
                .andExpect(jsonPath("$.email").value("mario@example.com"));
    }

    @Test
    void register_ritorna400ConIlMessaggio_quandoIlServiceLanciaEccezione() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Email già in uso!"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"dup@example.com","password":"x"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email già in uso!"));
    }

    @Test
    void login_ritorna200EUtente_quandoCredenzialiValide() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("mario@example.com");
        when(authService.login(any(LoginRequest.class))).thenReturn(user);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"mario@example.com","password":"secret"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("mario@example.com"));
    }

    @Test
    void login_ritorna401_quandoCredenzialiErrate() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Password errata"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"mario@example.com","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Credenziali non valide"));
    }
}
