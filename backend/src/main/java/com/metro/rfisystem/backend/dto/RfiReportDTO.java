package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RfiReportDTO {

    private String consultant;
    private String contract;
    private String contractor;
    private String contractId;
    private String rfiId;
    private String rfiStatus;
    private String dateOfInspection;
    private String location;
    private String proposedInspectionTime;
    private String actualInspectionTime;
    private String rfiDescription;
    private String enclosures;
    private String contractorRepresentative;
    private String clientRepresentative;
    private String descriptionByContractor;
    private String validationStatus;
    private String remarks;
    private String validationComments;
    private String selfieClient;
    private String selfieContractor;
    private String imagesUploadedByClient;
    private String imagesUploadedByContractor;
    private String testStatus;
    private String testSiteDocumentsContractor;
    private String testResultContractor;
    private String testResultEngineer;
    private String conSupportFilePaths;
    private String enggSupportFilePaths;

    private String attachmentData;

    private List<AttachmentFileDTO> attachments;


    public RfiReportDTO(
            String consultant,
            String contract,
            String contractor,
            String contractId,
            String rfiId,
            String rfiStatus,
            String dateOfInspection,
            String location,
            String proposedInspectionTime,
            String actualInspectionTime,
            String rfiDescription,
            String enclosures,
            String contractorRepresentative,
            String clientRepresentative,
            String descriptionByContractor,
            String validationStatus,
            String remarks,
            String validationComments,
            String selfieClient,
            String selfieContractor,
            String imagesUploadedByClient,
            String imagesUploadedByContractor,
            String testStatus,
            String testSiteDocumentsContractor,
            String testResultContractor,
            String testResultEngineer,
            String conSupportFilePaths,
            String enggSupportFilePaths,
            String attachmentData
    ) {
        this.consultant = consultant;
        this.contract = contract;
        this.contractor = contractor;
        this.contractId = contractId;
        this.rfiId = rfiId;
        this.rfiStatus = rfiStatus;
        this.dateOfInspection = dateOfInspection;
        this.location = location;
        this.proposedInspectionTime = proposedInspectionTime;
        this.actualInspectionTime = actualInspectionTime;
        this.rfiDescription = rfiDescription;
        this.enclosures = enclosures;
        this.contractorRepresentative = contractorRepresentative;
        this.clientRepresentative = clientRepresentative;
        this.descriptionByContractor = descriptionByContractor;
        this.validationStatus = validationStatus;
        this.remarks = remarks;
        this.validationComments = validationComments;
        this.selfieClient = selfieClient;
        this.selfieContractor = selfieContractor;
        this.imagesUploadedByClient = imagesUploadedByClient;
        this.imagesUploadedByContractor = imagesUploadedByContractor;
        this.testStatus = testStatus;
        this.testSiteDocumentsContractor = testSiteDocumentsContractor;
        this.testResultContractor = testResultContractor;
        this.testResultEngineer = testResultEngineer;
        this.conSupportFilePaths = conSupportFilePaths;
        this.enggSupportFilePaths = enggSupportFilePaths;
        this.attachmentData = attachmentData;
    }
    
}