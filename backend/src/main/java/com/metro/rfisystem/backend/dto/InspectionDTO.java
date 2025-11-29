package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionDTO {
	
	private Long inspectionId;
	private String rfiId;
	private LocalDate dateOfInspection;
	private LocalTime timeOfInspection;
	private String contractorRepresentative;
	private String status;
	private String rfiDescription;
	

}
