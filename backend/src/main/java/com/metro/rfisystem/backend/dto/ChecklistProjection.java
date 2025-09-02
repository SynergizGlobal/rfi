package com.metro.rfisystem.backend.dto;

public interface ChecklistProjection {
	
    Long getId();
    String getEnclosername();
    String getAction();
    String getChecklisttitle();
    String getChecklistDescription();
    String getStatus();
    String getContractorRemark();
    String getAeRemark();

}