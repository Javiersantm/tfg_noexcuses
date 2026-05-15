package com.javiersm.noexcuses.usuarios.dominio;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellidos;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String correo;

    @Column(nullable = false)
    private String contrasena;

    private LocalDate fechaNacimiento;
    private Double peso;
    private Double altura;

    @Enumerated(EnumType.STRING)
    private Objetivo objetivo;

    @Enumerated(EnumType.STRING)
    private Nivel nivel;

    private Integer diasEntreno;
    private Boolean tieneRutina;

    @Column(nullable = false)
    private Boolean activo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    private LocalDate fechaRegistro;

    private String fotoPerfil;

    @Column(nullable = false)
    private Boolean cronometroAutomatico;

    @PrePersist
    protected void onCreate() {
        if (this.activo == null) this.activo = true; // Por defecto activo
        if (this.rol == null) this.rol = Rol.USUARIO; // Por defecto usuario normal
        if (this.fechaRegistro == null) this.fechaRegistro = LocalDate.now(); // Fecha de hoy
        if (this.cronometroAutomatico == null) this.cronometroAutomatico = true; // Crono activado por defecto
        if (this.tieneRutina == null) this.tieneRutina = false;
    }
}