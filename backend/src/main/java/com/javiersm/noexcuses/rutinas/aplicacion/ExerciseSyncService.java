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
import java.util.Arrays;
import java.util.List;

@Service
public class ExerciseSyncService {

    private final EjercicioRepository ejercicioRepository;

    public ExerciseSyncService(EjercicioRepository ejercicioRepository) {
        this.ejercicioRepository = ejercicioRepository;
    }

    @Transactional
    public void sincronizarEjerciciosDesdeAPI() {
        if (ejercicioRepository.count() > 50) {
            System.out.println("✅ La base de datos ya tiene ejercicios. Saltando sincronización externa.");
            return;
        }

        System.out.println("🚀 Descargando ejercicios por grupos musculares...");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        // Asegúrate de que esta es tu API Key actual de RapidAPI
        headers.set("X-RapidAPI-Key", "e4728b2225msh97fd1af6ca92ed2p16d004jsna9f4e848aad3");
        headers.set("X-RapidAPI-Host", "exercisedb.p.rapidapi.com");

        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        // Los 10 grupos musculares exactos
        List<String> bodyParts = Arrays.asList(
                "back", "cardio", "chest", "lower arms", "lower legs",
                "neck", "shoulders", "upper arms", "upper legs", "waist"
        );

        int totalDescargados = 0;

        for (String part : bodyParts) {
            try {
                // 🚀 Usamos el comodín {part} para que Spring maneje los espacios de lower arms, etc.
                String url = "https://exercisedb.p.rapidapi.com/exercises/bodyPart/{part}?limit=10";

                ResponseEntity<ExerciseDbDto[]> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        ExerciseDbDto[].class,
                        part
                );

                ExerciseDbDto[] ejerciciosApi = response.getBody();

                if (ejerciciosApi != null) {
                    List<Ejercicio> nuevosEjercicios = new ArrayList<>();
                    for (ExerciseDbDto dto : ejerciciosApi) {

                        // 🚀 EXTRAEMOS LA DESCRIPCIÓN: Priorizamos el nuevo campo 'description'.
                        // Si no viene, intentamos unir las 'instructions'. Si no hay nada, texto por defecto.
                        String textoDescripcion = "Sin descripción.";
                        if (dto.getDescription() != null && !dto.getDescription().trim().isEmpty()) {
                            textoDescripcion = dto.getDescription();
                        } else if (dto.getInstructions() != null && !dto.getInstructions().isEmpty()) {
                            textoDescripcion = String.join(". ", dto.getInstructions());
                        }

                        Ejercicio ej = Ejercicio.builder()
                                .apiId(dto.getId())
                                .nombre(dto.getName())
                                .grupoMuscular(dto.getBodyPart().toLowerCase())
                                .equipo(dto.getEquipment())
                                .gifUrl(dto.getGifUrl())
                                .descripcion(textoDescripcion) // Asignamos el texto limpio
                                .build();
                        nuevosEjercicios.add(ej);
                    }
                    ejercicioRepository.saveAll(nuevosEjercicios);
                    totalDescargados += nuevosEjercicios.size();
                    System.out.println("✅ Descargados " + nuevosEjercicios.size() + " de: " + part);
                }
            } catch (Exception e) {
                System.err.println("❌ Error al descargar " + part + ": " + e.getMessage());
            }
        }
        System.out.println("🔥 ¡ÉXITO! Se han descargado e insertado " + totalDescargados + " ejercicios.");
    }
}