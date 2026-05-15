package com.javiersm.noexcuses.usuarios.infra;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.usuarios.aplicacion.PerfilService;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<Usuario> verPerfil(Authentication authentication) {
        return ResponseEntity.ok(perfilService.obtenerPerfil(authentication.getName()));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<Entrenamiento>> verHistorial(Authentication authentication) {
        return ResponseEntity.ok(perfilService.obtenerHistorial(authentication.getName()));
    }

    @PutMapping("/editar")
    public ResponseEntity<Usuario> editarPerfil(@RequestBody Usuario datosActualizados, Authentication authentication) {
        return ResponseEntity.ok(perfilService.actualizarPerfil(authentication.getName(), datosActualizados));
    }

    @PostMapping("/foto")
    public ResponseEntity<Usuario> subirFoto(@RequestParam("foto") MultipartFile foto, Authentication authentication) {
        return ResponseEntity.ok(perfilService.actualizarFotoPerfil(authentication.getName(), foto));
    }
}