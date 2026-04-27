package com.javiersm.noexcuses.rutinas.infra;

import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {
    // Si algún día quieres filtrar en el frontend por grupo muscular, esto te vendrá de perlas
    List<Ejercicio> findByGrupoMuscular(String grupoMuscular);
}