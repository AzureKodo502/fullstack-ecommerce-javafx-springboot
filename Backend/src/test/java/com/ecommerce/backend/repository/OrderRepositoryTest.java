package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test di integrazione di {@link OrderRepository}: la query {@code findByUser}
 * naviga la relazione {@code @ManyToOne} verso l'utente.
 */
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private OrderRepository orderRepository;

    private User persistUtente(String email) {
        User u = new User();
        u.setNome("Mario");
        u.setCognome("Rossi");
        u.setEmail(email);
        u.setPassword("secret");
        return em.persist(u);
    }

    private void persistOrdine(User user, double totale) {
        Order o = new Order();
        o.setUser(user);
        o.setTotale(totale);
        o.setStato("CONFERMATO");
        o.setDataCreazione(LocalDateTime.now());
        em.persist(o);
    }

    @Test
    void findByUser_ritornaLoStoricoDelSoloUtenteRichiesto() {
        User mario = persistUtente("mario@example.com");
        User luigi = persistUtente("luigi@example.com");
        persistOrdine(mario, 100.0);
        persistOrdine(mario, 250.0);
        persistOrdine(luigi, 50.0);
        em.flush();

        assertThat(orderRepository.findByUser(mario))
                .hasSize(2)
                .extracting(Order::getTotale)
                .containsExactlyInAnyOrder(100.0, 250.0);
    }

    @Test
    void findByUser_ritornaListaVuota_seLUtenteNonHaOrdini() {
        User nuovo = persistUtente("nuovo@example.com");
        em.flush();

        assertThat(orderRepository.findByUser(nuovo)).isEmpty();
    }
}
