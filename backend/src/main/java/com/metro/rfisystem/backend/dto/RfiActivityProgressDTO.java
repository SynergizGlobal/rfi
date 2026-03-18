package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfiActivityProgressDTO {

    private LocalDate rfiInspectionDate;
    private String p6ActivityIdFk;
    private Double completedScope;
}