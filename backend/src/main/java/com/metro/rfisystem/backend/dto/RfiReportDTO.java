package com.metro.rfisystem.backend.dto;

public interface RfiReportDTO {
    String getConsultant();
    String getContract();
    String getContractor();
    String getContractId();
    String getRfiId();
    String getRfiStatus();
    String getDateOfInspection();
    String getLocation();
    String getProposedInspectionTime();
    String getActualInspectionTime();
    String getRfiDescription();
    String getEnclosures();
    String getContractorRepresentative();
    String getClientRepresentative();
    String getDescriptionByContractor();
    String getValidationStatus();
    String getRemarks();
    String getSelfieClient();
    String getSelfieContractor();
    String getImagesUploadedByClient();
    String getImagesUploadedByContractor();
    String getTestStatus();
    String getTestSiteDocumentsContractor();
    String getTestResultContractor();
    String getTestResultEngineer();
    String getConSupportFilePaths();
    String getEnggSupportFilePaths();


}

