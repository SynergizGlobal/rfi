package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rfi_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long Id;
    private String rfi_Id;
    @Column(name = "project_name")
    private String project;
    @Column(name = "work_short_name")
    private String work;	
    @Column(name = "contract_short_name") 
    private String contract;

    @Column(name = "structure_type")
    private String structureType;

    
    private String structure;
    private String component;
    private String element;
    private String activity;

    @Column(name = "rfi_description", length = 1000)
    private String rfiDescription;

    private String action;

    @Column(name = "type_of_rfi")
    private String typeOfRFI;

    @Column(name = "name_of_representative")
    private String nameOfRepresentative;

    @Column(length = 1000)
    private String enclosures;

    private String location;

    @Column(length = 1000)
    private String description;
    
    @Column(name="time_of_inspection")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime timeOfInspection;

    @Column(name = "date_of_submission")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfSubmission;

    @Column(name = "date_of_inspection")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfInspection;

    
}