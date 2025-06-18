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
	private LocalDateTime timeOfInspection;
	private String project;
	private String work;
	private String contract;
	private String structure;
	private String activity;
	private String user;

}
