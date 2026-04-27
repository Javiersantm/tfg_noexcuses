package com.javiersm.noexcuses.rutinas.aplicacion;

import com.javiersm.noexcuses.rutinas.dominio.DiaRutina;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.dominio.EjercicioDia;
import com.javiersm.noexcuses.rutinas.dominio.Rutina;
import com.javiersm.noexcuses.rutinas.infra.EjercicioRepository;
import com.javiersm.noexcuses.rutinas.infra.RutinaRepository;
import com.javiersm.noexcuses.usuarios.dominio.Objetivo;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public RutinaService(RutinaRepository rutinaRepository, EjercicioRepository ejercicioRepository, UsuarioRepository usuarioRepository) {
        this.rutinaRepository = rutinaRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Ejercicio> obtenerTodosLosEjercicios() {
        return ejercicioRepository.findAll();
    }

    @Transactional
    public void guardarRutina(Rutina rutina, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        rutina.setUsuario(usuario);
        rutina.setFechaCreacion(LocalDate.now());

        if (rutina.getDias() != null) {
            rutina.getDias().forEach(dia -> {
                dia.setRutina(rutina);
                if (dia.getEjerciciosDelDia() != null) {
                    dia.getEjerciciosDelDia().forEach(ejercicioDia -> ejercicioDia.setDiaRutina(dia));
                }
            });
        }
        rutinaRepository.save(rutina);
    }

    // ==========================================
    // 🚀 NUEVO: GENERADOR AUTOMÁTICO DE RUTINAS
    // ==========================================
    @Transactional
    public void generarRutinaAutomatica(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Rutina rutinaGenerada = Rutina.builder()
                .nombre("Rutina Automática No Excuses")
                .esGeneradaAutomaticamente(true)
                .fechaCreacion(LocalDate.now())
                .usuario(usuario)
                .dias(new ArrayList<>())
                .build();

        int dias = usuario.getDiasEntreno() != null ? usuario.getDiasEntreno() : 3;
        Objetivo objetivo = usuario.getObjetivo() != null ? usuario.getObjetivo() : Objetivo.MANTENIMIENTO;

        // Definimos las repeticiones según el objetivo del usuario
        String reps = determinarRepeticiones(objetivo);
        int series = determinarSeries(objetivo);
        int descanso = determinarDescanso(objetivo);

        // Lógica súper básica de división de días (¡puedes complicarla todo lo que quieras!)
        if (dias <= 3) {
            // Rutina FullBody o Dividida en 3
            rutinaGenerada.getDias().add(crearDiaRutina("Día 1: Pecho y Tríceps", rutinaGenerada, List.of("Pecho", "Tríceps"), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutina("Día 2: Espalda y Bíceps", rutinaGenerada, List.of("Espalda", "Bíceps"), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutina("Día 3: Piernas y Hombros", rutinaGenerada, List.of("Piernas", "Hombros"), series, reps, descanso));
        } else {
            // Rutina dividida en 4 o más (Torso/Pierna)
            rutinaGenerada.getDias().add(crearDiaRutina("Día 1: Torso Pesado", rutinaGenerada, List.of("Pecho", "Espalda"), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutina("Día 2: Piernas Pesado", rutinaGenerada, List.of("Piernas"), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutina("Día 3: Empujes", rutinaGenerada, List.of("Pecho", "Hombros", "Tríceps"), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutina("Día 4: Tirones", rutinaGenerada, List.of("Espalda", "Bíceps"), series, reps, descanso));
        }

        rutinaRepository.save(rutinaGenerada);
    }

    // Métodos auxiliares privados para el generador
    private DiaRutina crearDiaRutina(String nombreDia, Rutina rutina, List<String> gruposMusculares, int series, String reps, int descanso) {
        DiaRutina dia = DiaRutina.builder()
                .nombreDia(nombreDia)
                .rutina(rutina)
                .ejerciciosDelDia(new ArrayList<>())
                .build();

        for (String grupo : gruposMusculares) {
            // Buscamos ejercicios de ese grupo muscular
            List<Ejercicio> ejercicios = ejercicioRepository.findByGrupoMuscular(grupo);

            // Si hay ejercicios, cogemos hasta 2 de ese grupo muscular para este día
            int limite = Math.min(ejercicios.size(), 2);
            for (int i = 0; i < limite; i++) {
                EjercicioDia ejDia = EjercicioDia.builder()
                        .diaRutina(dia)
                        .ejercicio(ejercicios.get(i))
                        .series(series)
                        .repeticiones(reps)
                        .descansoSegundos(descanso)
                        .build();
                dia.getEjerciciosDelDia().add(ejDia);
            }
        }
        return dia;
    }

    private String determinarRepeticiones(Objetivo objetivo) {
        return switch (objetivo) {
            case CONSEGUIR_MUSCULO, GANAR_PESO -> "8-12";
            case DEFINIR -> "12-15";
            default -> "10";
        };
    }

    private int determinarSeries(Objetivo objetivo) {
        return (objetivo == Objetivo.DEFINIR) ? 3 : 4;
    }

    private int determinarDescanso(Objetivo objetivo) {
        return (objetivo == Objetivo.CONSEGUIR_MUSCULO) ? 90 : 60; // en segundos
    }
}