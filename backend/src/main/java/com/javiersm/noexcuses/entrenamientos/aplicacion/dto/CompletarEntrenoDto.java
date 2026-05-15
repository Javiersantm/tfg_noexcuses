package com.javiersm.noexcuses.entrenamientos.aplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompletarEntrenoDto {
    private Integer sensacion;
    private Integer eficiencia;
    private Double pesoCorporal; // NUEVO: El peso del usuario hoy
    private List<SerieDto> series; // NUEVO: La lista de lo que ha levantado
}