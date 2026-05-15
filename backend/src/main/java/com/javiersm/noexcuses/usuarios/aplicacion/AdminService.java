package com.javiersm.noexcuses.usuarios.aplicacion;

import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.infra.EjercicioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final EjercicioRepository ejercicioRepository; // 🚀 Añadimos los ejercicios

    @PersistenceContext
    private EntityManager entityManager;

    public AdminService(UsuarioRepository usuarioRepository, EjercicioRepository ejercicioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.ejercicioRepository = ejercicioRepository;
    }

    // --- MÉTODOS DE USUARIOS Y MÉTRICAS (Los que ya teníamos) ---
    public List<Usuario> listarTodosLosUsuarios() { return usuarioRepository.findAll(); }

    @Transactional
    public void alternarEstadoUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(!usuario.getActivo());
        usuarioRepository.save(usuario);
    }

    public long contarEntrenamientosTotales() {
        try {
            return (Long) entityManager.createQuery("SELECT COUNT(e) FROM Entrenamiento e").getSingleResult();
        } catch (Exception e) { return 0; }
    }

    // --- 🚀 NUEVOS MÉTODOS DE EJERCICIOS ---
    public List<Ejercicio> listarEjercicios() {
        return ejercicioRepository.findAll();
    }

    @Transactional
    public void actualizarEjercicio(Long id, String nombre, String descripcion, Boolean activo) {
        Ejercicio ej = ejercicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        if (nombre != null) ej.setNombre(nombre);
        if (descripcion != null) ej.setDescripcion(descripcion);
        if (activo != null) ej.setActivo(activo); // Usamos setActivo nativo de Lombok

        ejercicioRepository.save(ej);
    }
}