package com.metro.rfisystem.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AssignExecutiveResponse {
	private Long id;
    private String contract;          
    private String structureType;
    private String structure;
    private String assignedExecutive; 
}
