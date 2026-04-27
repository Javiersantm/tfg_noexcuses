package com.javiersm.noexcuses.entrenamientos.infra;

import com.javiersm.noexcuses.entrenamientos.aplicacion.EntrenamientoService;
import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    public EntrenamientoController(EntrenamientoService entrenamientoService) {
        this.entrenamientoService = entrenamientoService;
    }

    // 1. Guardar el entreno cuando le dé a Finalizar
    @PostMapping("/finalizar")
    public ResponseEntity<String> registrarEntrenamiento(@RequestBody Entrenamiento entrenamiento, Authentication authentication) {
        try {
            entrenamientoService.registrarEntrenamiento(entrenamiento, authentication.getName());
            return ResponseEntity.ok("¡Entrenamiento registrado! El día se pondrá en verde.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    // 2. Obtener los entrenos de un mes concreto para el Dashboard
    @GetMapping("/mes")
    public ResponseEntity<List<Entrenamiento>> obtenerParaCalendario(
            @RequestParam int anio,
            @RequestParam int mes,
            Authentication authentication) {

        List<Entrenamiento> entrenamientos = entrenamientoService.obtenerEntrenamientosDelMes(authentication.getName(), anio, mes);
        return ResponseEntity.ok(entrenamientos);
    }
}