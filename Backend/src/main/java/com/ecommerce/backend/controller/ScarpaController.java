package com.ecommerce.backend.controller;

import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.service.ScarpaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller responsabile della gestione del catalogo prodotti (Scarpe).
 * Espone endpoint per il recupero dell'intero inventario, l'aggiunta di nuovi articoli
 * e l'applicazione di filtri di ricerca per marchio o stringa testuale.
 */
@RestController
@RequestMapping("/api/products")
public class ScarpaController {

    /**
     * Servizio dedicato alla logica di business e alla persistenza del catalogo scarpe.
     */
    @Autowired
    private ScarpaService scarpaService;

    /**
     * Recupera l'elenco completo delle scarpe disponibili nel database.
     * * @return Una lista di oggetti {@link Scarpa}.
     */
    @GetMapping
    public List<Scarpa> getListaScarpe() {
        return scarpaService.getAllScarpe();
    }

    /**
     * Recupera una singola scarpa tramite il suo identificativo.
     * * @param id Identificativo del prodotto.
     * @return La {@link Scarpa} richiesta (HTTP 200), o HTTP 404 se non esiste.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Scarpa> getScarpa(@PathVariable Long id) {
        return scarpaService.getScarpaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Registra una nuova Scarpa nel catalogo.
     * * @param scarpa L'entità {@link Scarpa} da persistere, ricevuta come JSON nel corpo della richiesta.
     * @return L'entità salvata, inclusa di ID generato dal database.
     */
    @PostMapping
    public Scarpa aggiungiScarpa(@RequestBody Scarpa scarpa) {
        return scarpaService.salvaScarpa(scarpa);
    }

    /**
     * Esegue una ricerca testuale all'interno del catalogo.
     * * @param q La stringa di ricerca (query parameter) utilizzata per filtrare i prodotti (es. nome, modello).
     * @return Una lista di calzature che soddisfano i criteri di ricerca.
     */
    @GetMapping("/search")
    public List<Scarpa> ricerca(@RequestParam String q) {
        return scarpaService.cercaScarpe(q);
    }

    /**
     * Filtra le Scarpe in base al marchio specifico.
     * * @param marchio Il nome del brand utilizzato come variabile di percorso (Path Variable).
     * @return Una lista di oggetti {@link Scarpa} appartenenti al marchio indicato.
     */
    @GetMapping("/brand/{marchio}")
    public List<Scarpa> filtraPerMarchio(@PathVariable String marchio) {
        return scarpaService.getScarpeByMarchio(marchio);
    }
}