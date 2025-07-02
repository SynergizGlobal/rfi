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
	private String descriptionByContractor;
	private String drawingStatus;
	private String alignmentStatus;
	private String drawingRemarksContracotr;
	private String drawingRemarksClient;
	private String alignmentoCntractorRemarks;
	private String alignmentClientRemarks;
	private String status;
	private String remarks;
	private String contractorEnclosureFilePaths;
	private String clientEnclosureFilePaths;
	private String selfieClient;
	private String selfieContractor;
	private String imagesUploadedByClient;
	private String imagesUploadedByContractor;
	private String testInsiteLabContractor;
	private String testSiteDocumentsContractor;
	private String contractorSignature;
	private String gcMrvcSignature;
}
