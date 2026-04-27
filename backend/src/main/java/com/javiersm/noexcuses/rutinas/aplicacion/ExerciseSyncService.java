package com.javiersm.noexcuses.rutinas.aplicacion;

import com.javiersm.noexcuses.rutinas.aplicacion.dto.ExerciseDbDto;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.infra.EjercicioRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExerciseSyncService {

    private final EjercicioRepository ejercicioRepository;

    public ExerciseSyncService(EjercicioRepository ejercicioRepository) {
        this.ejercicioRepository = ejercicioRepository;
    }

    @Transactional
    public void sincronizarEjerciciosDesdeAPI() {
        // Solo llamamos a la API si la tabla está vacía
        if (ejercicioRepository.count() > 0) {
            System.out.println("✅ La base de datos ya tiene ejercicios. Saltando sincronización externa.");
            return;
        }

        System.out.println("🚀 Descargando ejercicios reales desde ExerciseDB (RapidAPI)...");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();

        // 👇👇 ¡Pega aquí tu clave de RapidAPI entre las comillas! 👇👇
        headers.set("X-RapidAPI-Key", "e4728b2225msh97fd1af6ca92ed2p16d004jsna9f4e848aad3");
        headers.set("X-RapidAPI-Host", "exercisedb.p.rapidapi.com");

        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        try {
            // Descargamos 150 ejercicios reales de golpe
            ResponseEntity<ExerciseDbDto[]> response = restTemplate.exchange(
                    "https://exercisedb.p.rapidapi.com/exercises?limit=150",
                    HttpMethod.GET,
                    entity,
                    ExerciseDbDto[].class
            );

            ExerciseDbDto[] ejerciciosApi = response.getBody();

            if (ejerciciosApi != null) {
                List<Ejercicio> nuevosEjercicios = new ArrayList<>();

                for (ExerciseDbDto dto : ejerciciosApi) {
                    // Juntamos las instrucciones en un solo texto separado por puntos
                    String instrucciones = dto.getInstructions() != null ? String.join(". ", dto.getInstructions()) : "Sin instrucciones.";

                    Ejercicio ej = Ejercicio.builder()
                            .apiId(dto.getId())
                            .nombre(dto.getName())
                            .grupoMuscular(dto.getTarget())
                            .equipo(dto.getEquipment())
                            .gifUrl(dto.getGifUrl())
                            .descripcion(instrucciones)
                            .build();
                    nuevosEjercicios.add(ej);
                }

                ejercicioRepository.saveAll(nuevosEjercicios);
                System.out.println("🔥 ¡ÉXITO! Se han descargado e insertado " + nuevosEjercicios.size() + " ejercicios con GIFs animados en la base de datos.");
            }

        } catch (Exception e) {
            System.err.println("❌ Error crítico al conectar con ExerciseDB: " + e.getMessage());
        }
    }
}