package com.javiersm.noexcuses.config;

import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.infra.EjercicioRepository;
import com.javiersm.noexcuses.usuarios.dominio.Nivel;
import com.javiersm.noexcuses.usuarios.dominio.Objetivo;
import com.javiersm.noexcuses.usuarios.dominio.Rol;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EjercicioRepository ejercicioRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.ejercicioRepository = ejercicioRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Solo insertamos si la base de datos está vacía
        if (ejercicioRepository.count() == 0) {
            System.out.println("🏋️‍♂️ Inicializando base de datos con ejercicios básicos...");

            List<Ejercicio> ejercicios = List.of(
                    crearEjercicio("Press de Banca", "Pecho", "Ejercicio básico para desarrollar el pectoral."),
                    crearEjercicio("Sentadilla con Barra", "Piernas", "Fundamental para el desarrollo del tren inferior."),
                    crearEjercicio("Dominadas", "Espalda", "Excelente para la amplitud de la espalda."),
                    crearEjercicio("Press Militar", "Hombros", "Desarrollo general de los deltoides."),
                    crearEjercicio("Peso Muerto", "Piernas/Espalda", "Trabaja toda la cadena posterior."),
                    crearEjercicio("Curl de Bíceps con Barra", "Bíceps", "Aislamiento para los bíceps."),
                    crearEjercicio("Extensión de Tríceps en Polea", "Tríceps", "Aislamiento para tríceps."),
                    crearEjercicio("Remo con Barra", "Espalda", "Ideal para el grosor de la espalda."),
                    crearEjercicio("Prensa de Piernas", "Piernas", "Alternativa guiada a la sentadilla."),
                    crearEjercicio("Elevaciones Laterales", "Hombros", "Aísla la cabeza lateral del hombro.")
            );

            ejercicioRepository.saveAll(ejercicios);
            System.out.println("✅ " + ejercicios.size() + " ejercicios cargados correctamente.");
        }

        // Ya que estamos, creamos un usuario de prueba para que no tengas que registrarte cada vez que pruebes algo
        if (usuarioRepository.count() == 0) {
            Usuario testUser = Usuario.builder()
                    .nombre("Javier")
                    .apellidos("San")
                    .username("javip")
                    .correo("javi@test.com")
                    .contrasena(passwordEncoder.encode("1234"))
                    .edad(20)
                    .peso(75.0)
                    .altura(1.80)
                    .objetivo(Objetivo.CONSEGUIR_MUSCULO)
                    .nivel(Nivel.INTERMEDIO)
                    .diasEntreno(4)
                    .tieneRutina(false)
                    .activo(true)
                    .rol(Rol.ADMIN) // Le damos rol ADMIN por si acaso
                    .build();

            usuarioRepository.save(testUser);
            System.out.println("✅ Usuario de prueba creado: javip / 1234");
        }
    }

    private Ejercicio crearEjercicio(String nombre, String grupoMuscular, String descripcion) {
        return Ejercicio.builder()
                .nombre(nombre)
                .grupoMuscular(grupoMuscular)
                .descripcion(descripcion)
                .build();
    }
}