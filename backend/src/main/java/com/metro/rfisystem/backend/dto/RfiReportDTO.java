package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiReportDTO {
    private String consultant;
    private String contract;
    private String contractor;
    private String contractId;
    private String rfiId;
    private String dateOfInspection;
    private String location;
    private String proposedInspectionTime;
    private String actualInspectionTime;
    private String rfiDescription;
    private String enclosures;
    private String contractorRepresentative;
    private String clientRepresentative;
    private String contractorRemarks;
    private String clientRemarks;
    private String action;
    private String remarks;
    private String enclosureFilePath;
    private Boolean testInsiteLab;
    private String testSiteDocuments;
    private String selfiePath;
    private String imagesUploadedByClient;
    private String imagesUploadedByContractor;
}

