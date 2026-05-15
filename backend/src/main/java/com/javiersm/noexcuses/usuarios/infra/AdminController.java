package com.javiersm.noexcuses.usuarios.infra;

import com.javiersm.noexcuses.usuarios.aplicacion.AdminService;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.dominio.Aviso;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AvisoRepository avisoRepository;

    public AdminController(AdminService adminService, AvisoRepository avisoRepository) {
        this.adminService = adminService;
        this.avisoRepository = avisoRepository;
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        return ResponseEntity.ok(adminService.listarTodosLosUsuarios());
    }

    @PostMapping("/usuarios/{id}/toggle-status")
    public ResponseEntity<String> alternarEstado(@PathVariable Long id) {
        adminService.alternarEstadoUsuario(id);
        return ResponseEntity.ok("Estado del usuario actualizado");
    }

    @GetMapping("/entrenamientos/count")
    public ResponseEntity<Long> contarEntrenamientos() {
        return ResponseEntity.ok(adminService.contarEntrenamientosTotales());
    }

    public static class EjercicioUpdateDTO {
        public String nombre;
        public String descripcion;
        public Boolean activo;
    }

    @GetMapping("/ejercicios")
    public ResponseEntity<List<Ejercicio>> obtenerEjercicios() {
        return ResponseEntity.ok(adminService.listarEjercicios());
    }

    @PutMapping("/ejercicios/{id}")
    public ResponseEntity<String> actualizarEjercicio(@PathVariable Long id, @RequestBody EjercicioUpdateDTO dto) {
        adminService.actualizarEjercicio(id, dto.nombre, dto.descripcion, dto.activo);
        return ResponseEntity.ok("Ejercicio modificado con éxito");
    }

    @GetMapping("/aviso")
    public ResponseEntity<Aviso> obtenerAviso() {
        return ResponseEntity.ok(avisoRepository.findById(1L).orElse(new Aviso(1L, "", false)));
    }

    @PostMapping("/aviso")
    public ResponseEntity<String> guardarAviso(@RequestBody Aviso nuevoAviso) {
        nuevoAviso.setId(1L);
        avisoRepository.save(nuevoAviso);
        return ResponseEntity.ok("Aviso actualizado");
    }
}