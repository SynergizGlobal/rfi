package com.metro.rfisystem.backend.dto;


import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@Data
public class RfiDetailsLogDTO {
    private String project;
    private String work;
    private String contract;
    private String contractId;
    private String structureType;
    private String structure;
    private String component;
    private String element;
    private String activity;
    private String rfiDescription;
    private String action;
    private String typeOfRfi;
    private String contractorRepresentative;
    private String contractor;
    private String enclosures;
    private String rfiId;
    private String rfiStatus;
    private String descriptionByContractor;
    private String dateOfCreation;
    private String conInspDate;
    private String proposedDateOfInspection;
    private String actualDateOfInspection;
    private String proposedInspectionTime;
    private String actualInspectionTime;
    private String dyHodUserId;
    private String clientRepresentative;
    private String clientDepartment;
    private String conLocation;
    private String clientLocation;
    private String chainage;
    private String validationStatus;
    private String remarks;
    private String validationComments;
    private String selfieClient;
    private String selfieContractor;
    private String imagesUploadedByClient;
    private String imagesUploadedByContractor;
    private String typeOfTest;
    private String testStatus;
    private String engineerRemarks;
    private String testSiteDocumentsContractor;

    // Extra field (not from query)
    private String dyHodUserName;
    
    
    public RfiDetailsLogDTO(
    	    String project,
    	    String work,
    	    String contract,
    	    String contractId,
    	    String structureType,
    	    String structure,
    	    String component,
    	    String element,
    	    String activity,
    	    String rfiDescription,
    	    String action,
    	    String typeOfRfi,
    	    String contractorRepresentative,
    	    String contractor,
    	    String enclosures,
    	    String rfiId,
    	    String rfiStatus,
    	    String descriptionByContractor,
    	    String dateOfCreation,
    	    String conInspDate,
    	    String proposedDateOfInspection,
    	    String actualDateOfInspection,
    	    String proposedInspectionTime,
    	    String actualInspectionTime,
    	    String dyHodUserId,
    	    String clientRepresentative,
    	    String clientDepartment,
    	    String conLocation,
    	    String clientLocation,
    	    String chainage,
    	    String validationStatus,
    	    String remarks,
    	    String validationComments,
    	    String selfieClient,
    	    String selfieContractor,
    	    String imagesUploadedByClient,
    	    String imagesUploadedByContractor,
    	    String typeOfTest,
    	    String testStatus,
    	    String engineerRemarks,
    	    String testSiteDocumentsContractor
    	) {
    	    this.project = project;
    	    this.work = work;
    	    this.contract = contract;
    	    this.contractId = contractId;
    	    this.structureType = structureType;
    	    this.structure = structure;
    	    this.component = component;
    	    this.element = element;
    	    this.activity = activity;
    	    this.rfiDescription = rfiDescription;
    	    this.action = action;
    	    this.typeOfRfi = typeOfRfi;
    	    this.contractorRepresentative = contractorRepresentative;
    	    this.contractor = contractor;
    	    this.enclosures = enclosures;
    	    this.rfiId = rfiId;
    	    this.rfiStatus = rfiStatus;
    	    this.descriptionByContractor = descriptionByContractor;
    	    this.dateOfCreation = dateOfCreation;
    	    this.conInspDate = conInspDate;
    	    this.proposedDateOfInspection = proposedDateOfInspection;
    	    this.actualDateOfInspection = actualDateOfInspection;
    	    this.proposedInspectionTime = proposedInspectionTime;
    	    this.actualInspectionTime = actualInspectionTime;
    	    this.dyHodUserId = dyHodUserId;
    	    this.clientRepresentative = clientRepresentative;
    	    this.clientDepartment = clientDepartment;
    	    this.conLocation = conLocation;
    	    this.clientLocation = clientLocation;
    	    this.chainage = chainage;
    	    this.validationStatus = validationStatus;
    	    this.remarks = remarks;
    	    this.validationComments = validationComments;
    	    this.selfieClient = selfieClient;
    	    this.selfieContractor = selfieContractor;
    	    this.imagesUploadedByClient = imagesUploadedByClient;
    	    this.imagesUploadedByContractor = imagesUploadedByContractor;
    	    this.typeOfTest = typeOfTest;
    	    this.testStatus = testStatus;
    	    this.engineerRemarks = engineerRemarks;
    	    this.testSiteDocumentsContractor = testSiteDocumentsContractor;
    	}

}
