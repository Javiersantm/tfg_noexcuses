package com.javiersm.noexcuses.rutinas.dominio;

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
@Table(name = "rutinas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rutina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre; // Ej: "Rutina Fuerza 4 días", "Mi Rutina Manual"

    private LocalDate fechaCreacion;

    private boolean esGeneradaAutomaticamente;

    // Relación: Muchos usuarios podrían tener muchas rutinas (historial), pero
    // asumimos que esta rutina es de UN usuario.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Relación: Una rutina tiene varios días. CascadeType.ALL significa que
    // si borramos la rutina, se borran sus días.
    @OneToMany(mappedBy = "rutina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaRutina> dias = new ArrayList<>();
}