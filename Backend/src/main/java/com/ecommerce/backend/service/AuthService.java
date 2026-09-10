package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servizio incaricato della gestione del ciclo di vita degli utenti e della sicurezza.
 * Implementa la logica di business per la registrazione di nuovi profili e
 * la validazione delle credenziali durante il processo di login.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Encoder per l'hashing delle password con algoritmo BCrypt (salt incluso).
     * Istanziato direttamente: {@link BCryptPasswordEncoder} è thread-safe e non
     * necessita di configurazione, quindi non serve esporlo come bean.
     */
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Registra un nuovo utente nel sistema.
     * * @param request DTO contenente i dati anagrafici e le credenziali.
     * @return L'entità {@link User} salvata nel database.
     * @throws RuntimeException se l'indirizzo email fornito è già associato a un account esistente.
     */
    public User register(RegisterRequest request) {
        // Verifica preventiva tramite il repository per garantire il vincolo di business
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email già in uso!");
        }

        // Mapping manuale dei dati dal DTO all'Entity
        User newUser = new User();
        newUser.setNome(request.getNome());
        newUser.setCognome(request.getCognome());
        newUser.setEmail(request.getEmail());
        // La password non viene mai salvata in chiaro: si memorizza solo l'hash BCrypt.
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(newUser);
    }

    /**
     * Autentica un utente verificando la corrispondenza tra email e password.
     * * @param request DTO contenente email e password fornite dall'utente.
     * @return L'oggetto {@link User} autenticato correttamente.
     * @throws RuntimeException se l'utente non esiste o se la password non corrisponde.
     */
    public User login(LoginRequest request) {
        // Recupero dell'utente tramite Optional per una gestione sicura dei valori null
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Utente non trovato");
        }

        User user = userOpt.get();

        // Confronto sicuro: BCrypt ri-deriva l'hash dalla password fornita usando
        // il salt memorizzato e lo confronta in modo resistente ai timing attack.
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Password errata");
        }

        return user;
    }
}