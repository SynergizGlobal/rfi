package com.metro.rfisystem.backend.dto;


import lombok.Data;

@Data
public class AssignExecutiveRequest {
    private String contract;      
    private String contractId;
    private String structureType;
    private String structure;
    private String assignedPersonClient; 
    private String department;
}
