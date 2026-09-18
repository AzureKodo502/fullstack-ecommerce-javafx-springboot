package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.dto.UserResponse;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.security.JwtService;
import com.ecommerce.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller deputato alla gestione dei processi di autenticazione e autorizzazione.
 * Espone gli endpoint necessari per la registrazione di nuovi utenti e il login al sistema,
 * fungendo da entry-point per il modulo di sicurezza dell'applicazione.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * Servizio di business logic per l'autenticazione, iniettato tramite Dependency Injection.
     */
    @Autowired
    private AuthService authService;

    /**
     * Genera il token JWT restituito dopo login e registrazione.
     */
    @Autowired
    private JwtService jwtService;

    /**
     * Gestisce la registrazione di un nuovo utente nel sistema.
     * * @param request DTO contenente i dati di registrazione inviati dal client.
     * @return ResponseEntity contenente token JWT e dati utente (HTTP 200),
     * o un messaggio d'errore in caso di fallimento della validazione/logica (HTTP 400).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User createdUser = authService.register(request);
            return ResponseEntity.ok(buildAuthResponse(createdUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Gestisce la procedura di login verificando le credenziali fornite.
     * * @param request DTO contenente l'identificativo e la password dell'utente.
     * @return ResponseEntity con token JWT e dati utente (HTTP 200),
     * o uno status di errore Unauthorized in caso di credenziali errate (HTTP 401).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            return ResponseEntity.ok(buildAuthResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Credenziali non valide");
        }
    }

    /**
     * Genera il token JWT per l'utente e lo abbina alla sua proiezione sicura
     * (senza l'hash della password), pronta per finire nel corpo della risposta.
     */
    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }
}