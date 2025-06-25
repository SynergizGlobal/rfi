package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class RFIInspectionAutofillDTO {
    private String nameOfWork;
    private String location;
    private String date;
    private String structureType;
    private String component;
    private  String rfiNo; 
}