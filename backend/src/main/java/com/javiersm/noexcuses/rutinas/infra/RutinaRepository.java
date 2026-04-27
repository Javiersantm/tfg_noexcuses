package com.javiersm.noexcuses.rutinas.infra;

import com.javiersm.noexcuses.rutinas.dominio.Rutina;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RutinaRepository extends JpaRepository<Rutina, Long> {
    // Para cargar el historial de rutinas de un usuario
    List<Rutina> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}