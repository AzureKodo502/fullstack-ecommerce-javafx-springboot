package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Scarpa;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test di integrazione di {@link ScarpaRepository}: verifica che le query
 * derivate dai nomi dei metodi ({@code findByNomeContainingIgnoreCase},
 * {@code findByMarchio}) si comportino come atteso su un DB reale.
 */
@DataJpaTest
class ScarpaRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private ScarpaRepository scarpaRepository;

    @BeforeEach
    void popolaCatalogo() {
        em.persist(Scarpa.builder().nome("Nike Air Max 1").marchio("Nike").prezzo(129.99).build());
        em.persist(Scarpa.builder().nome("Nike Dunk Low").marchio("Nike").prezzo(109.99).build());
        em.persist(Scarpa.builder().nome("Adidas Samba OG").marchio("Adidas").prezzo(119.99).build());
        em.flush();
    }

    @Test
    void findByNomeContainingIgnoreCase_ignoraIlMaiuscoloETrovaLeSottostringhe() {
        assertThat(scarpaRepository.findByNomeContainingIgnoreCase("nike")).hasSize(2);
        assertThat(scarpaRepository.findByNomeContainingIgnoreCase("SAMBA"))
                .extracting(Scarpa::getMarchio)
                .containsExactly("Adidas");
    }

    @Test
    void findByNomeContainingIgnoreCase_ritornaListaVuota_senzaMatch() {
        assertThat(scarpaRepository.findByNomeContainingIgnoreCase("Puma")).isEmpty();
    }

    @Test
    void findByMarchio_filtraPerBrandEd_eCaseSensitive() {
        assertThat(scarpaRepository.findByMarchio("Nike")).hasSize(2);
        assertThat(scarpaRepository.findByMarchio("Adidas")).hasSize(1);
        // Nota: findByMarchio NON ha IgnoreCase -> "nike" non combacia con "Nike".
        assertThat(scarpaRepository.findByMarchio("nike")).isEmpty();
    }

    @Test
    void findAll_ritornaTuttoIlCatalogoInserito() {
        List<Scarpa> tutte = scarpaRepository.findAll();
        assertThat(tutte).hasSize(3);
    }
}
