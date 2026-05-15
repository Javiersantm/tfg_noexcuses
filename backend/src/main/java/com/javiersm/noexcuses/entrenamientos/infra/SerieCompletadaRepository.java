package com.javiersm.noexcuses.entrenamientos.infra;

import com.javiersm.noexcuses.entrenamientos.dominio.SerieCompletada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SerieCompletadaRepository extends JpaRepository<SerieCompletada, Long> {
}