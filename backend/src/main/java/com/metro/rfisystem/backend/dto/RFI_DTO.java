package com.metro.rfisystem.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFI_DTO {

	private Long id;
	private String rfi_Id;
	private String contractId;
	private String rfiDescription;
	private String structureType;
	private String action;
	private String typeOfRFI;
	private String nameOfRepresentative;
	private String enclosures;
	private String location;
	private String component;
	private String element;
	private String description;
	private LocalDate dateOfSubmission, dateOfInspection;
	private LocalTime TimeOfInspection;
	private String project;
	private String work;
	private String contract;
	private String structure;
	private String activity;
	private String status;
    private String contractor;

}
