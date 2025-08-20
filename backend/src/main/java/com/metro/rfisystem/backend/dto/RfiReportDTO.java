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
	// checklist for the Enclosure Level Sheet
	private String drawingStatusLS;
	private String alignmentStatusLS;
	private String drawingRemarksContracotrLS;
	private String drawingRemarksClientLS;
	private String alignmentoCntractorRemarksLS;
	private String alignmentClientRemarksLS;
	
	// checklist for the Enclosure Pour Card

	private String drawingStatusPC;
	private String alignmentStatusPC;
	private String drawingRemarksContracotrPC;
	private String drawingRemarksClientPC;
	private String alignmentoCntractorRemarksPC;
	private String alignmentClientRemarksPC;
	
	private String validationStatus;
	private String remarks;
	private String levelSheetFilePath;
	private String pourCardFilePath;
	private String selfieClient;
	private String selfieContractor;
	private String imagesUploadedByClient;
	private String imagesUploadedByContractor;
	private String testStatus;
	private String testSiteDocumentsContractor;

}
