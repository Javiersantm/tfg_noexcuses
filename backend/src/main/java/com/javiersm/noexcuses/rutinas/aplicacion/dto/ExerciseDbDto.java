package com.javiersm.noexcuses.rutinas.aplicacion.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExerciseDbDto {
    private String id;
    private String name;
    private String bodyPart;
    private String target;
    private String equipment;
    private String gifUrl;
    private List<String> instructions; // La API devuelve las instrucciones como una lista de textos
}