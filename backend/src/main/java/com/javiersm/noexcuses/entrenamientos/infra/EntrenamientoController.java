package com.javiersm.noexcuses.entrenamientos.infra;

import com.javiersm.noexcuses.entrenamientos.aplicacion.EntrenamientoService;
import com.javiersm.noexcuses.entrenamientos.aplicacion.dto.CompletarEntrenoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrenamientos")
public class EntrenamientoController {

    private final EntrenamientoService entrenamientoService;

    public EntrenamientoController(EntrenamientoService entrenamientoService) {
        this.entrenamientoService = entrenamientoService;
    }

    @PostMapping(value = "/completar", consumes = {"multipart/form-data"})
    public ResponseEntity<String> completarEntrenamiento(
            @RequestPart("datos") CompletarEntrenoDto dto,
            @RequestPart(value = "foto", required = false) org.springframework.web.multipart.MultipartFile foto,
            Authentication authentication) {
        try { // 🚀 Corregido el typo aquí
            String mensaje = entrenamientoService.registrarEntrenamientoHoy(authentication.getName(), dto, foto);
            return ResponseEntity.ok(mensaje);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/calendario")
    public ResponseEntity<List<Integer>> obtenerCalendario(@RequestParam int year, @RequestParam int month, Authentication authentication) {
        List<Integer> dias = entrenamientoService.obtenerDiasDelMes(authentication.getName(), year, month);
        return ResponseEntity.ok(dias);
    }

    @GetMapping("/estado-semana")
    public ResponseEntity<List<Long>> obtenerEstadoSemana(Authentication authentication) {
        return ResponseEntity.ok(entrenamientoService.obtenerDiasCompletadosEstaSemana(authentication.getName()));
    }
}