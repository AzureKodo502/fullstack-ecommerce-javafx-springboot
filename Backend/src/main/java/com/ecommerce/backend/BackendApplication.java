package com.ecommerce.backend;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// L'autenticazione è gestita per intero da JwtService/JwtAuthenticationFilter
// (vedi SecurityConfig): nessun UserDetailsService, nessun login form/basic.
// Senza questa esclusione, Spring Boot genera comunque un utente "user" con
// password casuale a ogni avvio (loggata in chiaro) perché non ne trova uno
// configurato — rumore inutile dato che qui non viene mai usato.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}