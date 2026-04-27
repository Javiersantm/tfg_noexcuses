package com.javiersm.noexcuses.usuarios.aplicacion;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.entrenamientos.infra.EntrenamientoRepository;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final EntrenamientoRepository entrenamientoRepository;

    // Carpeta donde se guardarán las fotos en tu ordenador/servidor
    private final String UPLOAD_DIR = "uploads/perfiles/";

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

        // Actualizamos solo los datos permitidos
        usuario.setPeso(datosActualizados.getPeso());
        usuario.setAltura(datosActualizados.getAltura());
        usuario.setObjetivo(datosActualizados.getObjetivo());
        usuario.setNivel(datosActualizados.getNivel());
        usuario.setDiasEntreno(datosActualizados.getDiasEntreno());

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public String subirFotoPerfil(String username, MultipartFile archivo) throws IOException {
        Usuario usuario = obtenerPerfil(username);

        // 1. Crear la carpeta si no existe
        Path rutaCarpeta = Paths.get(UPLOAD_DIR);
        if (!Files.exists(rutaCarpeta)) {
            Files.createDirectories(rutaCarpeta);
        }

        // 2. Generar un nombre único para el archivo (para evitar que dos "foto.jpg" se sobreescriban)
        String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
        Path rutaArchivo = Paths.get(UPLOAD_DIR + nombreArchivo);

        // 3. Guardar el archivo físicamente
        Files.write(rutaArchivo, archivo.getBytes());

        // 4. Guardar la URL en la base de datos (luego configuraremos Spring para que lea esta URL)
        String urlFoto = "/uploads/perfiles/" + nombreArchivo;
        usuario.setFotoPerfilUrl(urlFoto);
        usuarioRepository.save(usuario);

        return urlFoto;
    }
}