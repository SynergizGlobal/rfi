package com.metro.rfisystem.backend.dto;

import org.springframework.web.multipart.MultipartFile;


import lombok.Data;

@Data
public class RFIInspectionChecklistDTO {

	private Long checklistId;
	private Long rfiId;
    private String gradeOfConcrete;

    private ChecklistOption drawingApproved;
    private ChecklistOption alignmentOk;
    
    private String drawingRemarkContractor;
    private String drawingRemarkAE;

   
    private String alignmentRemarkContractor;
    private String alignmentRemarkAE;

    private MultipartFile contractorSignature;
    private MultipartFile clientSignature;
    
    private String enclosureName;
    private String uploadedBy;
}
