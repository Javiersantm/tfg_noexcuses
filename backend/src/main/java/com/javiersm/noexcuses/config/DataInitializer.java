package com.javiersm.noexcuses.config;

import com.javiersm.noexcuses.rutinas.aplicacion.ExerciseSyncService; // <--- AÑADIDO
import com.javiersm.noexcuses.usuarios.dominio.Nivel;
import com.javiersm.noexcuses.usuarios.dominio.Objetivo;
import com.javiersm.noexcuses.usuarios.dominio.Rol;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ExerciseSyncService exerciseSyncService; // <--- AÑADIDO
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(ExerciseSyncService exerciseSyncService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.exerciseSyncService = exerciseSyncService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        exerciseSyncService.sincronizarEjerciciosDesdeAPI();

        if (usuarioRepository.findByUsername("javi_admin").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador")
                    .apellidos("No Excuses")
                    .username("javi_admin")
                    .correo("admin@noexcuses.com")
                    .contrasena(passwordEncoder.encode("admin1234"))
                    .rol(Rol.ADMIN)
                    .activo(true)
                    .tieneRutina(false)
                    .build();
            usuarioRepository.save(admin);
            System.out.println("✅ Super Administrador creado: javi_admin / admin1234");
        }

        // Usuario de prueba normal
        if (usuarioRepository.findByUsername("javip").isEmpty()) {
            Usuario testUser = Usuario.builder()
                    .nombre("Javier")
                    .apellidos("San")
                    .username("javip")
                    .correo("javi@test.com")
                    .contrasena(passwordEncoder.encode("1234"))
                    .rol(Rol.USUARIO) // Pasamos este a usuario normal para testear
                    .activo(true)
                    .build();
            usuarioRepository.save(testUser);
            System.out.println("✅ Usuario estándar creado: javip / 1234");
        }
    }
}