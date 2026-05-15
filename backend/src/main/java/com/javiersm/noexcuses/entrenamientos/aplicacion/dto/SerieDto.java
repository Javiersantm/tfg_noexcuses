package com.javiersm.noexcuses.entrenamientos.aplicacion.dto;

import lombok.Data;

@Data
public class SerieDto {
    private Long ejercicioId;
    private Integer numeroSerie;
    private Double peso;
    private Integer repeticiones;
}