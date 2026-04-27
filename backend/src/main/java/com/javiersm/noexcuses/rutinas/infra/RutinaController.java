package com.javiersm.noexcuses.rutinas.infra;

import com.javiersm.noexcuses.rutinas.aplicacion.RutinaService;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.dominio.Rutina;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrenamiento")
public class RutinaController {

    private final RutinaService rutinaService;

    public RutinaController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    // 1. Endpoint para pedir la lista de ejercicios
    @GetMapping("/ejercicios")
    public ResponseEntity<List<Ejercicio>> listarEjercicios() {
        return ResponseEntity.ok(rutinaService.obtenerTodosLosEjercicios());
    }

    // 2. Endpoint para guardar una rutina manual o generada
    @PostMapping("/rutinas")
    public ResponseEntity<String> crearRutina(@RequestBody Rutina rutina, Authentication authentication) {
        try {
            // Pillamos el nombre de usuario de la sesión actual de Spring Security
            String username = authentication.getName();
            rutinaService.guardarRutina(rutina, username);
            return ResponseEntity.ok("¡Rutina creada con éxito! A machacar.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear rutina: " + e.getMessage());
        }
    }

    // 3. Endpoint para generar una rutina automáticamente según el perfil del usuario
    @PostMapping("/generar")
    public ResponseEntity<String> generarRutinaAutomatica(Authentication authentication) {
        try {
            String username = authentication.getName();
            rutinaService.generarRutinaAutomatica(username);
            return ResponseEntity.ok("¡Rutina generada con éxito basándonos en tu nivel y objetivo!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al generar la rutina: " + e.getMessage());
        }
    }

    // 4. NUEVO: Endpoint para devolver la rutina actual del usuario logueado
    @GetMapping("/mi-rutina")
    public ResponseEntity<Rutina> obtenerMiRutina(Authentication authentication) {
        Rutina rutina = rutinaService.obtenerRutinaActiva(authentication.getName());
        if (rutina == null) {
            return ResponseEntity.noContent().build(); // Devuelve un código 204 (Vacío)
        }
        return ResponseEntity.ok(rutina);
    }
}