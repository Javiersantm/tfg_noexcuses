package com.javiersm.noexcuses.rutinas.dominio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ejercicios_dia")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EjercicioDia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dia_rutina_id", nullable = false)
    private DiaRutina diaRutina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ejercicio_id", nullable = false)
    private Ejercicio ejercicio;

    @Column(nullable = false)
    private Integer series; // Ej: 4

    @Column(nullable = false)
    private String repeticiones; // Lo ponemos como String por si es "8-10" o "Al fallo"

    private Integer descansoSegundos; // Ej: 90 (que luego tu frontend convertirá a 1:30 min)
}