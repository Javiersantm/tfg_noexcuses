package com.javiersm.noexcuses.entrenamientos.aplicacion;

import com.javiersm.noexcuses.entrenamientos.dominio.Entrenamiento;
import com.javiersm.noexcuses.entrenamientos.infra.EntrenamientoRepository;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import com.javiersm.noexcuses.usuarios.infra.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EntrenamientoService {

    private final EntrenamientoRepository entrenamientoRepository;
    private final UsuarioRepository usuarioRepository;

    public EntrenamientoService(EntrenamientoRepository entrenamientoRepository, UsuarioRepository usuarioRepository) {
        this.entrenamientoRepository = entrenamientoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void registrarEntrenamiento(Entrenamiento entrenamiento, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        entrenamiento.setUsuario(usuario);
        entrenamiento.setFecha(LocalDate.now());

        // Vinculamos las series al entrenamiento para que JPA lo guarde todo en cascada
        if (entrenamiento.getSeriesCompletadas() != null) {
            entrenamiento.getSeriesCompletadas().forEach(serie -> serie.setEntrenamiento(entrenamiento));
        }

        entrenamientoRepository.save(entrenamiento);
    }

    @Transactional(readOnly = true)
    public List<Entrenamiento> obtenerEntrenamientosDelMes(String username, int anio, int mes) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Calculamos el primer y último día del mes
        LocalDate inicio = LocalDate.of(anio, mes, 1);
        LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());

        return entrenamientoRepository.findByUsuarioAndFechaBetweenOrderByFechaAsc(usuario, inicio, fin);
    }
}