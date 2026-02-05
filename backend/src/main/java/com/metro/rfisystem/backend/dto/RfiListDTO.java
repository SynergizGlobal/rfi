package com.metro.rfisystem.backend.dto;

public interface RfiListDTO {
	Long getId(); 
    String getRfi_Id();
    String getProject();
    String getStructure();
    String getElement();
    String getActivity();
    String getAssignedPersonClient();
    String getCreatedBy();  
    String getRfiDescription();
    String getdateOfSubmission();
    String getInspectionStatus();
    String getStatus();
    String getApprovalStatus();
    String getValidationStatus();
    String getAction();
    String getImgClient();
    String getImgContractor();
    String getNameOfRepresentative();
    Boolean getRepresentativeReportingToContractor();
    String getMeasurementType();
    Double getTotalQty();
    String getContractId();
    String getTestResCon();
    String getTestResEngg();
    String getDateOfInspection();
    String getTimeOfInspection();
    
    
}

