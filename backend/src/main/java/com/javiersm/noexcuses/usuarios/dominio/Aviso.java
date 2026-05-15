package com.javiersm.noexcuses.usuarios.dominio;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Aviso {
    @Id
    private Long id = 1L;
    private String mensaje;
    private boolean activo;
}