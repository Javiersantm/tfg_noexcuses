package com.javiersm.noexcuses.entrenamientos.dominio;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.javiersm.noexcuses.usuarios.dominio.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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

    @Column(nullable = false)
    private LocalDate fecha;

    private Integer sensacion;
    private Integer eficiencia;

    private Double pesoCorporal;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    private String fotoUrl;

    private Long diaRutinaId;
}