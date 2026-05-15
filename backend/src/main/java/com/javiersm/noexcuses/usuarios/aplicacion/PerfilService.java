package com.javiersm.noexcuses.usuarios.aplicacion;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.entrenamientos.infra.EntrenamientoRepository;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final EntrenamientoRepository entrenamientoRepository;

    public PerfilService(UsuarioRepository usuarioRepository, EntrenamientoRepository entrenamientoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.entrenamientoRepository = entrenamientoRepository;
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPerfil(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Entrenamiento> obtenerHistorial(String username) {
        Usuario usuario = obtenerPerfil(username);
        return entrenamientoRepository.findByUsuarioOrderByFechaDesc(usuario);
    }

    @Transactional
    public Usuario actualizarPerfil(String username, Usuario datosActualizados) {
        Usuario usuario = obtenerPerfil(username);

        usuario.setPeso(datosActualizados.getPeso());
        usuario.setAltura(datosActualizados.getAltura());
        usuario.setObjetivo(datosActualizados.getObjetivo());
        usuario.setNivel(datosActualizados.getNivel());
        usuario.setDiasEntreno(datosActualizados.getDiasEntreno());
        if (datosActualizados.getCronometroAutomatico() != null) {
            usuario.setCronometroAutomatico(datosActualizados.getCronometroAutomatico());
        }

        return usuarioRepository.save(usuario);
    }

    // 🚀 UNIFICADO: Método para subir la foto de perfil
    @Transactional
    public Usuario actualizarFotoPerfil(String username, MultipartFile file) {
        Usuario usuario = obtenerPerfil(username);

        if (file != null && !file.isEmpty()) {
            // Nombre único para que no se pisen las fotos
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replace(" ", "_");
            Path path = Paths.get("uploads/" + fileName);
            try {
                Files.createDirectories(path.getParent());
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                usuario.setFotoPerfil(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar la foto: " + e.getMessage());
            }
        }
        return usuarioRepository.save(usuario);
    }
}