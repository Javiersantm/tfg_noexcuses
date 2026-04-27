package com.javiersm.noexcuses.entrenamientos.infra;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface EntrenamientoRepository extends JpaRepository<Entrenamiento, Long> {

    // 🔥 ¡Magia de JPA! Buscar entrenamientos de un usuario entre dos fechas (para pintar el mes del Dashboard)
    List<Entrenamiento> findByUsuarioAndFechaBetweenOrderByFechaAsc(Usuario usuario, LocalDate inicio, LocalDate fin);

    // Para el historial de entrenos del perfil
    List<Entrenamiento> findByUsuarioOrderByFechaDesc(Usuario usuario);
}