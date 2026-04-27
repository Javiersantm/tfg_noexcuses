package com.javiersm.noexcuses.entrenamientos.dominio;

import com.javiersm.noexcuses.rutinas.dominio.Ejercicio;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "series_completadas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SerieCompletada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entrenamiento_id", nullable = false)
    private Entrenamiento entrenamiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ejercicio_id", nullable = false)
    private Ejercicio ejercicio;

    @Column(nullable = false)
    private Integer numeroSerie; // 1 (primera serie), 2 (segunda serie)...

    @Column(nullable = false)
    private Double pesoLevantado; // Ej: 60.5 kg

    @Column(nullable = false)
    private Integer repeticionesRealizadas;
}