package com.javiersm.noexcuses.rutinas.dominio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ejercicios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ejercicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID original de la API
    private String apiId;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT") // Cambiado a TEXT para que quepan bien las instrucciones
    private String descripcion;

    @Column(nullable = false)
    private String grupoMuscular;

    private String equipo; // Ej: barbell, dumbbell, body weight...

    private String gifUrl; // ¡Aquí guardaremos el enlace al GIF animado!
}