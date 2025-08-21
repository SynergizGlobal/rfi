package com.metro.rfisystem.backend.dto;




import lombok.Data;

@Data
public class RFIInspectionChecklistDTO {

	private Long checklistId;
	private Long rfiId;
    private String gradeOfConcrete;

    private ChecklistOption drawingApproved;
    private String drawingRemarkContractor;
    private String drawingRemarkAE;

    private ChecklistOption alignmentOk;
    private String alignmentRemarkContractor;
    private String alignmentRemarkAE;
    
    private ChecklistOption cleaningOk;
    private String cleaningRemarkContractor;
    private String cleaningRemarkEngineer;
    
    private ChecklistOption jointPacking;
    private String jointPackingRemarkContractor;
    private String jointPackingRemarkEngineer;
    
    private ChecklistOption barBendingApproved;
    private String barBendingRemarkContractor;
    private String barBendingRemarkEngineer;
    
    private ChecklistOption coverBlockProvided;
    private String coverBlockRemarkContractor;
    private String coverBlockRemarkEngineer;
    
    private ChecklistOption reinforcementAlignment;
    private String reinforcementRemarkContractor; 
    private String reinforcementRemarkEngineer;
     
    private ChecklistOption walkwayAvailable;
    private String walkwayRemarkContractor;
    private String walkwayRemarkEngineer;
    
    private ChecklistOption mixDesignApproved;
    private String mixDesignRemarkContractor;
    private String mixDesignRemarkEngineer;
    
    private ChecklistOption vibratorsAvailable;
    private String vibratorsRemarkContractor;
    private String vibratorsRemarkEngineer;
    
    
    private ChecklistOption propsProvided;
    private String propsRemarkContractor;
    private String propsRemarkEngineer;
    
    private ChecklistOption levelPegsFixed;
    private String levelPegsRemarkContractor;
    private String levelPegsRemarkEngineer;
    
    private ChecklistOption concretePumpAvailable;
    private String concretePumpRemarkContractor;
    private String concretePumpRemarkEngineer;

    private ChecklistOption dgLightingAvailable;
    private String dgLightingRemarkContractor;
    private String dgLightingRemarkEngineer;
    
    
    private ChecklistOption curingArrangements;
    private String curingRemarkContractor;
    private String curingRemarkEngineer;
    
    
    private ChecklistOption transitMixerApproach;
    private String transitMixerRemarkContractor;
    private String transitMixerRemarkEngineer;  
    
    private ChecklistOption ppeProvided;
    private String ppeRemarkContractor;
    private String ppeRemarkEngineer;
    
    private String enclosureName;
    private String uploadedBy;
}
