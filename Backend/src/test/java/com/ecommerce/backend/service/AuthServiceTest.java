package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test unitari di {@link AuthService}: il repository è mockato, quindi qui si
 * verifica solo la logica di business (unicità email, hashing e confronto
 * delle credenziali).
 *
 * Nota: il {@code PasswordEncoder} interno di AuthService non è un mock —
 * {@code @InjectMocks} non tocca quel campo — quindi nei test gira il BCrypt
 * reale. Per preparare le fixture uso lo stesso encoder.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private RegisterRequest registerRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setNome("Mario");
        r.setCognome("Rossi");
        r.setEmail("mario.rossi@example.com");
        r.setPassword("secret");
        return r;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    @Test
    void register_salvaNuovoUtenteMappandoICampi_quandoEmailLibera() {
        when(userRepository.existsByEmail("mario.rossi@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = authService.register(registerRequest());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User passato = captor.getValue();
        assertThat(passato.getNome()).isEqualTo("Mario");
        assertThat(passato.getCognome()).isEqualTo("Rossi");
        assertThat(passato.getEmail()).isEqualTo("mario.rossi@example.com");
        assertThat(saved).isSameAs(passato);
    }

    @Test
    void register_salvaLaPasswordComeHashBCrypt_maiInChiaro() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = authService.register(registerRequest());

        assertThat(saved.getPassword())
                .isNotEqualTo("secret")
                .startsWith("$2");                          // prefisso degli hash BCrypt
        assertThat(encoder.matches("secret", saved.getPassword())).isTrue();
    }

    @Test
    void register_lanciaEccezione_quandoEmailGiaInUso() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email già in uso!");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ritornaUtente_quandoLaPasswordCombaciaConLHash() {
        User user = new User();
        user.setEmail("mario.rossi@example.com");
        user.setPassword(encoder.encode("secret"));
        when(userRepository.findByEmail("mario.rossi@example.com")).thenReturn(Optional.of(user));

        User result = authService.login(loginRequest("mario.rossi@example.com", "secret"));

        assertThat(result).isSameAs(user);
    }

    @Test
    void login_lanciaEccezione_quandoUtenteNonEsiste() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest("ghost@example.com", "x")))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Utente non trovato");
    }

    @Test
    void login_lanciaEccezione_quandoLaPasswordNonCombacia() {
        User user = new User();
        user.setEmail("mario.rossi@example.com");
        user.setPassword(encoder.encode("secret"));
        when(userRepository.findByEmail("mario.rossi@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(loginRequest("mario.rossi@example.com", "wrong")))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Password errata");
    }
}
