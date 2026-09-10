package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Test di integrazione dello strato di persistenza ({@code @DataJpaTest}).
 *
 * A differenza degli unit test dei service, qui gira un database H2 in memoria
 * vero: Spring Data genera le query reali e Hibernate crea lo schema dalle
 * entity. Ogni test è avvolto in una transazione che viene fatta rollback al
 * termine, quindi i test restano isolati fra loro.
 */
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private UserRepository userRepository;

    private User nuovoUtente(String email) {
        User u = new User();
        u.setNome("Mario");
        u.setCognome("Rossi");
        u.setEmail(email);
        u.setPassword("secret");
        return u;
    }

    @Test
    void findByEmail_trovaLUtente_quandoEmailEsiste() {
        em.persistAndFlush(nuovoUtente("mario@example.com"));

        Optional<User> trovato = userRepository.findByEmail("mario@example.com");

        assertThat(trovato).isPresent();
        assertThat(trovato.get().getNome()).isEqualTo("Mario");
    }

    @Test
    void findByEmail_ritornaOptionalVuoto_quandoEmailNonEsiste() {
        assertThat(userRepository.findByEmail("ghost@example.com")).isEmpty();
    }

    @Test
    void existsByEmail_riflette_laPresenzaNelDatabase() {
        em.persistAndFlush(nuovoUtente("mario@example.com"));

        assertThat(userRepository.existsByEmail("mario@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("altro@example.com")).isFalse();
    }

    @Test
    void save_violaIlVincoloUnique_suEmailDuplicata() {
        em.persistAndFlush(nuovoUtente("dup@example.com"));

        // Il vincolo @Column(unique = true) su User.email è applicato a livello di
        // schema: anche se il service non controllasse, il DB rifiuta il duplicato.
        assertThatThrownBy(() -> userRepository.saveAndFlush(nuovoUtente("dup@example.com")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
