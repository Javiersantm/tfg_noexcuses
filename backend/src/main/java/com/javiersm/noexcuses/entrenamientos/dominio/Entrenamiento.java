package com.javiersm.noexcuses.entrenamientos.dominio;

import com.javiersm.noexcuses.rutinas.dominio.DiaRutina;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entrenamientos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Entrenamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dia_rutina_id", nullable = false)
    private DiaRutina diaRutina;

    @Column(nullable = false)
    private LocalDate fecha; // Fecha en la que se realizó el entreno

    private Integer duracionMinutos; // Cuánto tardó en total

    private Integer valoracion; // Del 1 al 10: ¿Cómo se ha sentido?
    private Integer dificultad; // Del 1 al 10: ¿Cuánto le ha costado? (RPE)

    // URL donde se guardará la foto de su cuerpo de ese día (opcional)
    private String fotoFisicoUrl;

    // Relación con cada una de las series que ha hecho en este entreno
    @OneToMany(mappedBy = "entrenamiento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SerieCompletada> seriesCompletadas = new ArrayList<>();
}