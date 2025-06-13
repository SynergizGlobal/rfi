package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFI_DTO {

	private Long Id;
	private String project, work,contact, structureType, structure, component, element,activity, rfiDescription,action,typeOfRFI,nameOfRepresentative,enclosures,location,description;
	private LocalDate dateOfSubmission,dateOfInspection;
    private LocalDateTime timeOfInspection;
	
}
