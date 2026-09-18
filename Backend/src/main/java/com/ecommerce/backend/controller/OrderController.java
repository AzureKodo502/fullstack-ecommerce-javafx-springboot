package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.security.SecurityUtils;
import com.ecommerce.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller per la finalizzazione del processo d'acquisto.
 * Gestisce la conversione del carrello in ordini permanenti e il recupero
 * della cronologia transazionale dell'utente.
 *
 * Tutti gli endpoint richiedono un JWT valido (vedi SecurityConfig) e in più
 * verificano che lo userId nel path coincida con quello autenticato, per
 * impedire che un utente acquisti o consulti lo storico per conto di un altro.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    /**
     * Business logic dedicata alla gestione del ciclo di vita degli ordini.
     */
    @Autowired
    private OrderService orderService;

    /**
     * Esegue il processo di checkout trasformando gli articoli nel carrello in un ordine confermato.
     * L'operazione è atomica a livello di service per garantire l'integrità dei dati.
     * * @param userId Identificativo dell'utente che intende completare l'acquisto.
     * @return ResponseEntity contenente l'oggetto {@link Order} generato (HTTP 200),
     * un HTTP 400 Bad Request in caso di carrello vuoto o problemi di stock,
     * o HTTP 403 se lo userId non coincide con l'utente autenticato.
     */
    @PostMapping("/checkout/{userId}")
    public ResponseEntity<?> checkout(@PathVariable Long userId) {
        if (!isOwner(userId)) {
            return ResponseEntity.status(403).build();
        }
        try {
            // Delega al service la creazione dell'ordine e lo svuotamento del carrello
            return ResponseEntity.ok(orderService.creaOrdine(userId));
        } catch (RuntimeException e) {
            // Gestione di eccezioni di business (es. carrello vuoto)
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Recupera lo storico completo degli ordini effettuati da un determinato utente.
     * * @param userId Identificativo dell'utente per il filtraggio degli ordini.
     * @return ResponseEntity contenente la lista degli {@link Order} (HTTP 200),
     * o HTTP 403 se lo userId non coincide con l'utente autenticato.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> storico(@PathVariable Long userId) {
        if (!isOwner(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(orderService.getOrdiniUtente(userId));
    }

    /**
     * Verifica che l'id passato coincida con l'utente autenticato dal token JWT.
     */
    private boolean isOwner(Long userId) {
        return userId != null && userId.equals(SecurityUtils.currentUserId());
    }
}