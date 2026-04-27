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
        // 1. LLAMAMOS A NUESTRA API DE EJERCICIOS 👇
        exerciseSyncService.sincronizarEjerciciosDesdeAPI();

        // 2. CREAMOS EL USUARIO DE PRUEBA DE SIEMPRE
        if (usuarioRepository.count() == 0) {
            Usuario testUser = Usuario.builder()
                    .nombre("Javier")
                    .apellidos("San")
                    .username("javip")
                    .correo("javi@test.com")
                    .contrasena(passwordEncoder.encode("1234"))
                    .fechaNacimiento(LocalDate.of(2004, 5, 15))
                    .peso(75.0)
                    .altura(1.80)
                    .objetivo(Objetivo.CONSEGUIR_MUSCULO)
                    .nivel(Nivel.INTERMEDIO)
                    .diasEntreno(4)
                    .tieneRutina(false)
                    .activo(true)
                    .rol(Rol.ADMIN)
                    .build();

            usuarioRepository.save(testUser);
            System.out.println("✅ Usuario de prueba creado: javip / 1234");
        }
    }
}