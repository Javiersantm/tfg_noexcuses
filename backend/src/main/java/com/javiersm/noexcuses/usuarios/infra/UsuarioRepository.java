package com.javiersm.noexcuses.usuarios.infra;

import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByCorreo(String correo);

    // Método útil para el login y registro (estilo foro_tematico)
    Optional<Usuario> findByUsernameOrCorreo(String username, String correo);
}