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

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private String grupoMuscular; // Ej: Pecho, Espalda, Piernas, Core...

    // A futuro podemos guardar una URL de una imagen o vídeo demostrativo
    private String urlVideoDemonstracion;
}