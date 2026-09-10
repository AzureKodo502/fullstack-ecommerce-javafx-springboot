package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test di integrazione di {@link CartItemRepository}, il repository con la
 * logica di query più ricca del progetto (filtri per utente/scarpa/taglia e una
 * DELETE custom con {@code @Modifying}).
 */
@DataJpaTest
class CartItemRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private CartItemRepository cartItemRepository;

    private User user;
    private Scarpa scarpa;

    @BeforeEach
    void seed() {
        user = new User();
        user.setNome("Mario");
        user.setCognome("Rossi");
        user.setEmail("mario@example.com");
        user.setPassword("secret");
        em.persist(user);

        scarpa = Scarpa.builder().nome("Nike Air Max 1").marchio("Nike").prezzo(129.99).build();
        em.persist(scarpa);
        em.flush();
    }

    private CartItem cartItem(int taglia, int quantita) {
        CartItem ci = new CartItem();
        ci.setUser(user);
        ci.setScarpa(scarpa);
        ci.setTaglia(taglia);
        ci.setQuantita(quantita);
        return ci;
    }

    @Test
    void findByUser_ritornaSoloGliArticoliDiQuellUtente() {
        User luigi = new User();
        luigi.setNome("Luigi");
        luigi.setCognome("Verdi");
        luigi.setEmail("luigi@example.com");
        luigi.setPassword("x");
        em.persist(luigi);

        em.persist(cartItem(42, 1));
        em.persist(cartItem(43, 2));

        CartItem itemDiLuigi = new CartItem();
        itemDiLuigi.setUser(luigi);
        itemDiLuigi.setScarpa(scarpa);
        itemDiLuigi.setTaglia(44);
        itemDiLuigi.setQuantita(1);
        em.persist(itemDiLuigi);
        em.flush();

        assertThat(cartItemRepository.findByUser(user)).hasSize(2);
        assertThat(cartItemRepository.findByUser(luigi)).hasSize(1);
    }

    @Test
    void findByUserAndScarpaAndTaglia_trovaLaRigaConLaTagliaEsatta() {
        em.persist(cartItem(42, 1));
        em.persist(cartItem(43, 5));
        em.flush();

        Optional<CartItem> trovato = cartItemRepository.findByUserAndScarpaAndTaglia(user, scarpa, 43);

        assertThat(trovato).isPresent();
        assertThat(trovato.get().getQuantita()).isEqualTo(5);
    }

    @Test
    void findByUserAndScarpaAndTaglia_ritornaEmpty_seLaTagliaNonEInCarrello() {
        em.persist(cartItem(42, 1));
        em.flush();

        assertThat(cartItemRepository.findByUserAndScarpaAndTaglia(user, scarpa, 99)).isEmpty();
    }

    @Test
    void deleteByIds_eliminaSoloLaRigaConLaTagliaIndicata() {
        em.persist(cartItem(42, 1));
        em.persist(cartItem(43, 1));
        em.flush();

        cartItemRepository.deleteByIds(user.getId(), scarpa.getId(), 42);
        // La query @Modifying agisce direttamente sul DB: svuoto la cache di
        // primo livello per rileggere lo stato reale.
        em.clear();

        List<CartItem> rimasti = cartItemRepository.findByUser(user);
        assertThat(rimasti)
                .extracting(CartItem::getTaglia)
                .containsExactly(43);
    }
}
