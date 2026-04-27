package com.javiersm.noexcuses.usuarios.aplicacion;

import com.javiersm.noexcuses.usuarios.dominio.Rol;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistroService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registrarUsuario(Usuario usuario) {
        // 1. Comprobar si existe
        if (usuarioRepository.findByUsernameOrCorreo(usuario.getUsername(), usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El nombre de usuario o el correo ya están en uso.");
        }

        // 2. Encriptar contraseña
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));

        // 3. Establecer valores por defecto
        usuario.setActivo(true);
        usuario.setRol(Rol.USUARIO);

        // 4. Guardar
        usuarioRepository.save(usuario);
    }
}