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
import java.util.Collections;
import java.util.List;
import java.util.Map;

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

    @Transactional
    public void generarRutinaAutomatica(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Rutina rutinaGenerada = Rutina.builder()
                .nombre("Rutina " + usuario.getObjetivo().name().replace("_", " "))
                .esGeneradaAutomaticamente(true)
                .fechaCreacion(LocalDate.now())
                .usuario(usuario)
                .dias(new ArrayList<>())
                .build();

        int dias = usuario.getDiasEntreno() != null ? usuario.getDiasEntreno() : 3;
        Objetivo objetivo = usuario.getObjetivo() != null ? usuario.getObjetivo() : Objetivo.MANTENIMIENTO;

        String reps = determinarRepeticiones(objetivo);
        int series = determinarSeries(objetivo);
        int descanso = determinarDescanso(objetivo);

        // LÓGICA DE SPLITS PROFESIONALES (Volumen ajustado y realista: 4-6 ejercicios por día)
        if (dias <= 2) {
            // FULL BODY (2 Días) - 5 y 6 ejercicios
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 1: Full Body A", rutinaGenerada,
                    Map.of("chest", 1, "back", 2, "upper legs", 2, "shoulders", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 2: Full Body B", rutinaGenerada,
                    Map.of("back", 1, "upper legs", 2, "chest", 1, "upper arms", 1), series, reps, descanso));
        }
        else if (dias == 3) {
            // PUSH / PULL / LEGS (3 Días) - 5 ejercicios por día
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 1: Empuje (Pecho, Hombro, Tríceps)", rutinaGenerada,
                    Map.of("chest", 2, "shoulders", 2, "upper arms", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 2: Tirón (Espalda, Bíceps)", rutinaGenerada,
                    Map.of("back", 3, "upper arms", 2), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 3: Piernas y Core", rutinaGenerada,
                    Map.of("upper legs", 3, "lower legs", 1, "waist", 1), series, reps, descanso));
        }
        else if (dias == 4) {
            // TORSO / PIERNA (4 Días) - 5 y 6 ejercicios
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 1: Torso Fuerza", rutinaGenerada,
                    Map.of("chest", 2, "back", 2, "shoulders", 1, "upper arms", 1), series, "6-8", 120));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 2: Piernas Fuerza", rutinaGenerada,
                    Map.of("upper legs", 3, "lower legs", 1, "waist", 1), series, "6-8", 120));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 3: Torso Hipertrofia", rutinaGenerada,
                    Map.of("chest", 2, "back", 2, "shoulders", 1, "upper arms", 1), series, "10-12", 90));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 4: Piernas e Hipertrofia", rutinaGenerada,
                    Map.of("upper legs", 3, "lower legs", 1, "waist", 2), series, "12-15", 90));
        }
        else {
            // WEIDER / BRO SPLIT (5+ Días) - 4 y 5 ejercicios (Más analítico)
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 1: Pecho y Core", rutinaGenerada,
                    Map.of("chest", 3, "waist", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 2: Espalda", rutinaGenerada,
                    Map.of("back", 3, "waist", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 3: Piernas", rutinaGenerada,
                    Map.of("upper legs", 3, "lower legs", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 4: Hombros", rutinaGenerada,
                    Map.of("shoulders", 3, "waist", 1), series, reps, descanso));
            rutinaGenerada.getDias().add(crearDiaRutinaInteligente("Día 5: Brazos", rutinaGenerada,
                    Map.of("upper arms", 4, "waist", 1), series, reps, descanso));
        }

        rutinaRepository.save(rutinaGenerada);
    }

    private DiaRutina crearDiaRutinaInteligente(String nombreDia, Rutina rutina, Map<String, Integer> distribucionMusculos, int series, String reps, int descanso) {
        DiaRutina dia = DiaRutina.builder()
                .nombreDia(nombreDia)
                .rutina(rutina)
                .ejerciciosDelDia(new ArrayList<>())
                .build();

        // 🧠 MEMORIA: Guardamos los IDs de los ejercicios que ya hemos puesto hoy
        List<Long> ejerciciosUsadosHoy = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : distribucionMusculos.entrySet()) {
            String grupo = entry.getKey();
            int cantidadDeseada = entry.getValue();

            List<Ejercicio> disponibles = ejercicioRepository.findByGrupoMuscular(grupo);

            if (disponibles.isEmpty()) {
                disponibles = ejercicioRepository.findAll();
            }

            // 🚫 Eliminamos de la lista los que ya hemos usado
            disponibles.removeIf(ej -> ejerciciosUsadosHoy.contains(ej.getId()));

            if (!disponibles.isEmpty()) {
                Collections.shuffle(disponibles);
                int limite = Math.min(disponibles.size(), cantidadDeseada);
                for (int i = 0; i < limite; i++) {
                    Ejercicio ejSeleccionado = disponibles.get(i);

                    EjercicioDia ejDia = EjercicioDia.builder()
                            .diaRutina(dia)
                            .ejercicio(ejSeleccionado)
                            .series(series)
                            .repeticiones(reps)
                            .descansoSegundos(descanso)
                            .build();
                    dia.getEjerciciosDelDia().add(ejDia);

                    // Lo añadimos a la memoria
                    ejerciciosUsadosHoy.add(ejSeleccionado.getId());
                }
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
        return (objetivo == Objetivo.CONSEGUIR_MUSCULO) ? 90 : 60;
    }

    @Transactional(readOnly = true)
    public Rutina obtenerRutinaActiva(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Rutina> rutinas = rutinaRepository.findByUsuarioOrderByFechaCreacionDesc(usuario);
        if (rutinas.isEmpty()) return null;

        Rutina rutinaActiva = rutinas.get(0);
        rutinaActiva.getDias().size();
        rutinaActiva.getDias().forEach(dia -> {
            dia.getEjerciciosDelDia().size();
            dia.getEjerciciosDelDia().forEach(ejDia -> ejDia.getEjercicio().getNombre());
        });

        return rutinaActiva;
    }
}