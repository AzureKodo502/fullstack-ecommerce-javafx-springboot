package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AddToCartRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.security.SecurityUtils;
import com.ecommerce.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller dedicato alla gestione del carrello acquisti.
 * Fornisce gli endpoint per la visualizzazione, l'inserimento e la rimozione
 * degli articoli (CartItem) associati a uno specifico utente.
 *
 * Tutti gli endpoint richiedono un JWT valido (vedi SecurityConfig) e in più
 * verificano che lo userId indicato coincida con quello autenticato: senza
 * questo secondo controllo, un token valido qualsiasi basterebbe a leggere o
 * modificare il carrello di un altro utente.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    /**
     * Servizio incaricato della persistenza e della logica di calcolo del carrello.
     */
    @Autowired
    private CartService cartService;

    /**
     * Recupera l'elenco degli articoli presenti nel carrello di un utente specifico.
     * * @param userId Identificativo univoco dell'utente proprietario del carrello.
     * @return ResponseEntity contenente la lista di {@link CartItem} (HTTP 200),
     * o HTTP 403 se lo userId non coincide con l'utente autenticato.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCarrello(@PathVariable Long userId) {
        if (!isOwner(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(cartService.getCarrelloByUserId(userId));
    }

    /**
     * Aggiunge un nuovo articolo al carrello o ne incrementa la quantità se già presente.
     * * @param request DTO contenente i riferimenti all'utente, al prodotto e alle specifiche (es. taglia).
     * @return ResponseEntity con l'oggetto {@link CartItem} salvato o aggiornato (HTTP 200),
     * o HTTP 403 se l'userId nel body non coincide con l'utente autenticato.
     */
    @PostMapping("/add")
    public ResponseEntity<?> aggiungi(@RequestBody AddToCartRequest request) {
        if (!isOwner(request.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        // Log di debug per il monitoraggio dei payload in ingresso durante la fase di sviluppo
        System.out.println("Backend ha ricevuto: " + request.getUserId() + " - " + request.getTaglia());
        return ResponseEntity.ok(cartService.aggiungiAlCarrello(request));
    }

    /**
     * Rimuove un articolo specifico dal carrello dell'utente.
     * * @param request DTO contenente i criteri univoci per identificare l'item da rimuovere.
     * @return ResponseEntity con messaggio di conferma dell'operazione (HTTP 200),
     * o HTTP 403 se l'userId nel body non coincide con l'utente autenticato.
     */
    @PostMapping("/remove")
    public ResponseEntity<?> rimuovi(@RequestBody AddToCartRequest request) {
        if (!isOwner(request.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        cartService.rimuoviDalCarrello(
                request.getUserId(),
                request.getScarpaId(),
                request.getTaglia()
        );
        return ResponseEntity.ok("Rimosso");
    }

    /**
     * Verifica che l'id passato coincida con l'utente autenticato dal token JWT.
     */
    private boolean isOwner(Long userId) {
        return userId != null && userId.equals(SecurityUtils.currentUserId());
    }
}