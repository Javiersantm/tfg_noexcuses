package com.javiersm.noexcuses.entrenamientos.aplicacion;

import com.javiersm.noexcuses.entrenamientos.aplicacion.dto.CompletarEntrenoDto;
import com.javiersm.noexcuses.entrenamientos.aplicacion.dto.SerieDto;
import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.entrenamientos.dominio.SerieCompletada;
import com.javiersm.noexcuses.entrenamientos.infra.EntrenamientoRepository;
import com.javiersm.noexcuses.entrenamientos.infra.SerieCompletadaRepository;
import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import com.javiersm.noexcuses.rutinas.infra.EjercicioRepository;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EntrenamientoService {

    private final EntrenamientoRepository entrenamientoRepository;
    private final SerieCompletadaRepository serieCompletadaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final UsuarioRepository usuarioRepository;

    public EntrenamientoService(EntrenamientoRepository entrenamientoRepository,
                                SerieCompletadaRepository serieCompletadaRepository,
                                EjercicioRepository ejercicioRepository,
                                UsuarioRepository usuarioRepository) {
        this.entrenamientoRepository = entrenamientoRepository;
        this.serieCompletadaRepository = serieCompletadaRepository;
        this.ejercicioRepository = ejercicioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public String registrarEntrenamientoHoy(String username, CompletarEntrenoDto dto, org.springframework.web.multipart.MultipartFile foto) throws java.io.IOException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        LocalDate hoy = LocalDate.now();
        if (entrenamientoRepository.existsByUsuarioAndFecha(usuario, hoy)) {
            return "¡Ya has entrenado hoy!";
        }

        // --- Lógica de la Foto ---
        String rutaFoto = null;
        if (foto != null && !foto.isEmpty()) {
            String uploadDir = "uploads/progreso/";
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(path)) java.nio.file.Files.createDirectories(path);

            String nombreArchivo = java.util.UUID.randomUUID().toString() + "_" + foto.getOriginalFilename();
            java.nio.file.Files.copy(foto.getInputStream(), path.resolve(nombreArchivo));
            rutaFoto = "/uploads/progreso/" + nombreArchivo;
        }

        // 1. Guardamos el entrenamiento con la foto y EL ID DEL DÍA 🚀
        Entrenamiento nuevoEntrenamiento = Entrenamiento.builder()
                .usuario(usuario)
                .fecha(hoy)
                .sensacion(dto.getSensacion())
                .eficiencia(dto.getEficiencia())
                .pesoCorporal(dto.getPesoCorporal())
                .fotoUrl(rutaFoto)
                .diaRutinaId(dto.getDiaRutinaId()) // 🚀 AQUÍ GUARDAMOS EL ID DEL DÍA
                .build();
        entrenamientoRepository.save(nuevoEntrenamiento);

        // 2. Actualizamos el peso en el perfil
        if (dto.getPesoCorporal() != null) {
            usuario.setPeso(dto.getPesoCorporal());
            usuarioRepository.save(usuario);
        }

        // 3. Guardamos todas las series realizadas
        if (dto.getSeries() != null && !dto.getSeries().isEmpty()) {
            for (SerieDto serieDto : dto.getSeries()) {
                if (serieDto.getPeso() != null && serieDto.getRepeticiones() != null) {
                    Ejercicio ej = ejercicioRepository.findById(serieDto.getEjercicioId())
                            .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

                    SerieCompletada serie = SerieCompletada.builder()
                            .entrenamiento(nuevoEntrenamiento)
                            .ejercicio(ej)
                            .numeroSerie(serieDto.getNumeroSerie())
                            .pesoLevantado(serieDto.getPeso())
                            .repeticionesRealizadas(serieDto.getRepeticiones())
                            .build();
                    serieCompletadaRepository.save(serie);
                }
            }
        }

        return "¡Entrenamiento guardado con foto de progreso! 💪";
    }

    public List<Integer> obtenerDiasDelMes(String username, int year, int month) {
        Usuario usuario = usuarioRepository.findByUsername(username).orElseThrow();
        return entrenamientoRepository.findDiasEntrenadosPorMes(usuario, year, month);
    }

    // 🚀 NUEVO: Método para devolver los días completados en la última semana
    @Transactional(readOnly = true)
    public List<Long> obtenerDiasCompletadosEstaSemana(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscamos entrenamientos de los últimos 7 días
        LocalDate haceUnaSemana = LocalDate.now().minusDays(7);

        return entrenamientoRepository.findByUsuarioAndFechaAfter(usuario, haceUnaSemana)
                .stream()
                .map(Entrenamiento::getDiaRutinaId)
                .filter(id -> id != null)
                .distinct()
                .toList();
    }
}