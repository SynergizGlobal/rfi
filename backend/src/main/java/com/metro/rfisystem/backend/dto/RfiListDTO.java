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
    String getdateOfSubmission();
    String getInspectionStatus();
    String getStatus();
    String getApprovalStatus();
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
    
}

