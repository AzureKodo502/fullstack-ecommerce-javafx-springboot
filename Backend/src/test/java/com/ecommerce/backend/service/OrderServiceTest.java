package com.ecommerce.backend.service;

import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test unitari di {@link OrderService}: checkout (calcolo totale, creazione
 * testata + righe, svuotamento carrello) e casi di errore.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private OrderService orderService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
    }

    private CartItem cartItem(double prezzo, int quantita) {
        Scarpa s = new Scarpa();
        s.setPrezzo(prezzo);
        CartItem ci = new CartItem();
        ci.setScarpa(s);
        ci.setQuantita(quantita);
        return ci;
    }

    @Test
    void creaOrdine_calcolaIlTotaleGeneraLeRigheESvuotaIlCarrello() {
        List<CartItem> carrello = List.of(cartItem(100.0, 2), cartItem(50.0, 1)); // 200 + 50
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(carrello);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order result = orderService.creaOrdine(1L);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order testata = orderCaptor.getValue();
        assertThat(testata.getTotale()).isEqualTo(250.0);
        assertThat(testata.getStato()).isEqualTo("CONFERMATO");
        assertThat(testata.getUser()).isEqualTo(user);
        assertThat(testata.getDataCreazione()).isNotNull();

        verify(orderItemRepository, times(2)).save(any(OrderItem.class));
        verify(cartItemRepository).deleteAll(carrello);
        assertThat(result.getTotale()).isEqualTo(250.0);
    }

    @Test
    void creaOrdine_congelaIlPrezzoDiVenditaSulleRighe() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(List.of(cartItem(129.99, 3)));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        orderService.creaOrdine(1L);

        ArgumentCaptor<OrderItem> rigaCaptor = ArgumentCaptor.forClass(OrderItem.class);
        verify(orderItemRepository).save(rigaCaptor.capture());
        OrderItem riga = rigaCaptor.getValue();
        assertThat(riga.getQuantita()).isEqualTo(3);
        assertThat(riga.getPrezzoAlMomentoDellAcquisto()).isEqualTo(129.99);
    }

    @Test
    void creaOrdine_lanciaEccezione_quandoCarrelloVuoto() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.creaOrdine(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Il carrello è vuoto!");

        verify(orderRepository, never()).save(any());
        verify(cartItemRepository, never()).deleteAll(any());
    }

    @Test
    void creaOrdine_lanciaEccezione_quandoUtenteNonTrovato() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.creaOrdine(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Utente non trovato");
    }

    @Test
    void getOrdiniUtente_ritornaLoStoricoDellUtente() {
        Order o1 = new Order();
        Order o2 = new Order();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(List.of(o1, o2));

        assertThat(orderService.getOrdiniUtente(1L)).containsExactly(o1, o2);
    }
}
