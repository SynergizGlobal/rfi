package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFI_DTO {

	private Long Id;
	private String  structureType, rfiDescription,action,typeOfRFI,nameOfRepresentative,enclosures,location,description;
	private LocalDate dateOfSubmission,dateOfInspection;
    private LocalDateTime timeOfInspection;
    private List<Project> project;
    private List<Work> work;
    private List<Contract> contact;
    private List<Structure> structure;
    private List<Activity> activity;
    
    
	
}
