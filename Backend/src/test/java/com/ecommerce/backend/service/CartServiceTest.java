package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.AddToCartRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.ScarpaRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test unitari di {@link CartService}. I punti interessanti sono il merge della
 * quantità su un articolo già presente e la logica di rimozione con fallback
 * quando la taglia non combacia.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private ScarpaRepository scarpaRepository;

    @InjectMocks private CartService cartService;

    private User user;
    private Scarpa scarpa;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        scarpa = new Scarpa();
        scarpa.setId(10L);
        scarpa.setPrezzo(100.0);
    }

    private AddToCartRequest addRequest(int quantita, int taglia) {
        AddToCartRequest r = new AddToCartRequest();
        r.setUserId(1L);
        r.setScarpaId(10L);
        r.setQuantita(quantita);
        r.setTaglia(taglia);
        return r;
    }

    @Test
    void getCarrelloByUserId_ritornaGliArticoliDellUtente() {
        CartItem item = new CartItem();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(List.of(item));

        assertThat(cartService.getCarrelloByUserId(1L)).containsExactly(item);
    }

    @Test
    void getCarrelloByUserId_lanciaEccezione_quandoUtenteNonTrovato() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.getCarrelloByUserId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Utente non trovato");
    }

    @Test
    void aggiungiAlCarrello_creaNuovoItem_quandoNonEsiste() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(scarpaRepository.findById(10L)).thenReturn(Optional.of(scarpa));
        when(cartItemRepository.findByUserAndScarpaAndTaglia(user, scarpa, 42)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItem result = cartService.aggiungiAlCarrello(addRequest(2, 42));

        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getScarpa()).isEqualTo(scarpa);
        assertThat(result.getQuantita()).isEqualTo(2);
        assertThat(result.getTaglia()).isEqualTo(42);
    }

    @Test
    void aggiungiAlCarrello_incrementaLaQuantita_quandoItemGiaPresente() {
        CartItem esistente = new CartItem();
        esistente.setUser(user);
        esistente.setScarpa(scarpa);
        esistente.setQuantita(1);
        esistente.setTaglia(42);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(scarpaRepository.findById(10L)).thenReturn(Optional.of(scarpa));
        when(cartItemRepository.findByUserAndScarpaAndTaglia(user, scarpa, 42)).thenReturn(Optional.of(esistente));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

        CartItem result = cartService.aggiungiAlCarrello(addRequest(3, 42));

        assertThat(result.getQuantita()).isEqualTo(4);
        verify(cartItemRepository).save(esistente);
    }

    @Test
    void aggiungiAlCarrello_lanciaEccezione_quandoUtenteNonTrovato() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.aggiungiAlCarrello(addRequest(1, 42)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Utente non trovato");
    }

    @Test
    void aggiungiAlCarrello_lanciaEccezione_quandoScarpaNonTrovata() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(scarpaRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.aggiungiAlCarrello(addRequest(1, 42)))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Scarpa non trovata");
    }

    @Test
    void rimuoviDalCarrello_rimuoveLItem_conCorrispondenzaEsattaIdETaglia() {
        CartItem item = new CartItem();
        item.setId(5L);
        item.setScarpa(scarpa);
        item.setTaglia(42);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(new ArrayList<>(List.of(item)));

        cartService.rimuoviDalCarrello(1L, 10L, 42);

        verify(cartItemRepository).delete(item);
    }

    @Test
    void rimuoviDalCarrello_usaIlFallbackPerSoloId_quandoLaTagliaNonCombacia() {
        CartItem item = new CartItem();
        item.setId(5L);
        item.setScarpa(scarpa);
        item.setTaglia(38); // taglia diversa da quella richiesta
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(new ArrayList<>(List.of(item)));

        cartService.rimuoviDalCarrello(1L, 10L, 42);

        verify(cartItemRepository).delete(item);
    }

    @Test
    void rimuoviDalCarrello_nonRimuoveNulla_quandoLaScarpaNonEInCarrello() {
        Scarpa altra = new Scarpa();
        altra.setId(999L);
        CartItem item = new CartItem();
        item.setId(5L);
        item.setScarpa(altra);
        item.setTaglia(42);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(new ArrayList<>(List.of(item)));

        cartService.rimuoviDalCarrello(1L, 10L, 42);

        verify(cartItemRepository, never()).delete(any());
    }
}
