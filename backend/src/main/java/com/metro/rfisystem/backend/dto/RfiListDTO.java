package com.metro.rfisystem.backend.dto;

public interface RfiListDTO {
	Long getId(); 
    String getRfi_Id();
    String getProject();
    String getStructure();
    String getElement();
    String getActivity();
    String getAssignedPersonClient(); // used in filtering
    String getCreatedBy();            // add this if filtering by creator
    String getdateOfSubmission();
    String getInspectionStatus();
}

