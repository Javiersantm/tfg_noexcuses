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

    // 1. Obtener los datos del usuario logueado
    @GetMapping
    public ResponseEntity<Usuario> verPerfil(Authentication authentication) {
        return ResponseEntity.ok(perfilService.obtenerPerfil(authentication.getName()));
    }

    // 2. Obtener el historial completo de entrenamientos
    @GetMapping("/historial")
    public ResponseEntity<List<Entrenamiento>> verHistorial(Authentication authentication) {
        return ResponseEntity.ok(perfilService.obtenerHistorial(authentication.getName()));
    }

    // 3. Editar datos del perfil (peso, altura, etc.)
    @PutMapping("/editar")
    public ResponseEntity<Usuario> editarPerfil(@RequestBody Usuario datosActualizados, Authentication authentication) {
        Usuario usuarioActualizado = perfilService.actualizarPerfil(authentication.getName(), datosActualizados);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // 4. Subir la foto de perfil (Fíjate que usamos @RequestParam("foto") y MultipartFile)
    @PostMapping("/foto")
    public ResponseEntity<String> subirFoto(@RequestParam("foto") MultipartFile foto, Authentication authentication) {
        try {
            String urlFoto = perfilService.subirFotoPerfil(authentication.getName(), foto);
            return ResponseEntity.ok("Foto subida con éxito. URL: " + urlFoto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al subir la foto: " + e.getMessage());
        }
    }
}