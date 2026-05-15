package com.javiersm.noexcuses.entrenamientos.infra;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntrenamientoRepository extends JpaRepository<Entrenamiento, Long> {

    List<Entrenamiento> findByUsuarioOrderByFechaDesc(Usuario usuario);

    boolean existsByUsuarioAndFecha(Usuario usuario, LocalDate fecha);

    @Query("SELECT EXTRACT(DAY FROM e.fecha) FROM Entrenamiento e WHERE e.usuario = :usuario AND EXTRACT(YEAR FROM e.fecha) = :year AND EXTRACT(MONTH FROM e.fecha) = :month")
    List<Integer> findDiasEntrenadosPorMes(Usuario usuario, int year, int month);

    List<Entrenamiento> findByUsuarioAndFechaAfter(Usuario usuario, LocalDate fecha);
}