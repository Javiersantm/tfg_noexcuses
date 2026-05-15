package com.javiersm.noexcuses.entrenamientos.aplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompletarEntrenoDto {
    private Integer sensacion;
    private Integer eficiencia;
    private Double pesoCorporal;
    private List<SerieDto> series;
    private Long diaRutinaId;
}