package com.javiersm.noexcuses.usuarios.infra;

import com.javiersm.noexcuses.usuarios.aplicacion.RegistroService;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@RequestBody Usuario usuario) {
        try {
            registroService.registrarUsuario(usuario);
            return ResponseEntity.ok("¡Registro completado con éxito! Ya no hay excusas.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}