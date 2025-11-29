package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiInspectionDTO {
	private Long id;
    private String rfiId;
    private String work;
    private String contract;
    private String contractor;
    private String activity;
    private String description;
    private String location;
    private LocalDate  dataOfInspection;
    private LocalTime timeOfInspection;
    private String nameOfContractorReprsentative;
    private String measurementType;
    private Double totalQty;
    private Double length;
    private Double breadth;
    private Double height;
    private Integer noOfItems;
    private String descriptionEnclosure;

    
}