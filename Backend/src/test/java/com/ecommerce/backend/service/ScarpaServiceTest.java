package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Scarpa;
import com.ecommerce.backend.repository.ScarpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test unitari di {@link ScarpaService}. Il service è un layer sottile: qui si
 * verifica che deleghi al repository i parametri corretti.
 */
@ExtendWith(MockitoExtension.class)
class ScarpaServiceTest {

    @Mock private ScarpaRepository scarpaRepository;
    @InjectMocks private ScarpaService scarpaService;

    @Test
    void getAllScarpe_ritornaIlCatalogoCompleto() {
        when(scarpaRepository.findAll()).thenReturn(List.of(new Scarpa(), new Scarpa()));

        assertThat(scarpaService.getAllScarpe()).hasSize(2);
    }

    @Test
    void cercaScarpe_delegaLaQueryAlRepository() {
        when(scarpaRepository.findByNomeContainingIgnoreCase("air")).thenReturn(List.of(new Scarpa()));

        assertThat(scarpaService.cercaScarpe("air")).hasSize(1);
        verify(scarpaRepository).findByNomeContainingIgnoreCase("air");
    }

    @Test
    void getScarpeByMarchio_filtraPerBrand() {
        when(scarpaRepository.findByMarchio("Nike")).thenReturn(List.of(new Scarpa(), new Scarpa()));

        assertThat(scarpaService.getScarpeByMarchio("Nike")).hasSize(2);
        verify(scarpaRepository).findByMarchio("Nike");
    }

    @Test
    void getScarpaById_ritornaLOptionalDelRepository() {
        Scarpa s = new Scarpa();
        s.setId(7L);
        when(scarpaRepository.findById(7L)).thenReturn(Optional.of(s));

        assertThat(scarpaService.getScarpaById(7L)).contains(s);
    }
}
