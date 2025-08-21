package com.metro.rfisystem.backend.model.rfi;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.metro.rfisystem.backend.dto.ChecklistOption;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "rfi_checklist_item")
@Data
public class RFIChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rfi_id_fk", referencedColumnName = "id")
    @JsonBackReference
    private RFI rfi;
    
    
    //Checklist for concrete
     @Column(name = "grade_of_concrete")
     private String gradeOfConcrete;

     // Checklist fields
     @Enumerated(EnumType.STRING)
     @Column(name = "drawing_approved")
     private ChecklistOption drawingApproved;
     
     @Column(length = 100)
     private String drawingRemarkContractor;
     @Column(length = 100)
     private String drawingRemarkAE;

     @Enumerated(EnumType.STRING)
     @Column(name = "alignment_ok")
     private ChecklistOption alignmentOk;
     
     @Column(length = 100)
     private String alignmentRemarkContractor;
     @Column(length = 100)
     private String alignmentRemarkAE;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "cleaning_ok")
     private ChecklistOption cleaningOk;

     @Column(length = 100)
     private String cleaningRemarkContractor;

     @Column(length = 100)
     private String cleaningRemarkEngineer;

     @Enumerated(EnumType.STRING)
     @Column(name = "joint_packing")
     private ChecklistOption jointPacking;

     @Column(length = 100)
     private String jointPackingRemarkContractor;

     @Column(length = 100)
     private String jointPackingRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "bar_bending_approved")
     private ChecklistOption barBendingApproved;

     @Column(length = 100)
     private String barBendingRemarkContractor;

     @Column(length = 100)
     private String barBendingRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "cover_block_provided")
     private ChecklistOption coverBlockProvided;

     @Column(length = 100)
     private String coverBlockRemarkContractor;

     @Column(length = 100)
     private String coverBlockRemarEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "reinforcement_alignment")
     private ChecklistOption reinforcementAlignment;

     @Column(length = 100)
     private String reinforcementRemarkContractor;

     @Column(length = 100)
     private String reinforcementRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "walkway_available")
     private ChecklistOption walkwayAvailable;

     @Column(length = 100)
     private String walkwayRemarkContractor;

     @Column(length = 100)
     private String walkwayRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "mix_design_approved")
     private ChecklistOption mixDesignApproved;

     @Column(length = 100)
     private String mixDesignRemarkContractor;

     @Column(length = 100)
     private String mixDesignRemarEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "vibrators_available")
     private ChecklistOption vibratorsAvailable;

     @Column(length = 100)
     private String vibratorsRemarkContractor;

     @Column(length = 100)
     private String vibratorsRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "props_provided")
     private ChecklistOption propsProvided;

     @Column(length = 100)
     private String propsRemarkContractor;

     @Column(length = 100)
     private String propsRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "level_pegs_fixed")
     private ChecklistOption levelPegsFixed;

     @Column(length = 100)
     private String levelPegsRemarkContractor;

     @Column(length = 100)
     private String levelPegsRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "concrete_pump_available")
     private ChecklistOption concretePumpAvailable;

     @Column(length = 100)
     private String concretePumpRemarkContractor;

     @Column(length = 100)
     private String concretePumpRemarkEngineer;


     @Enumerated(EnumType.STRING)
     @Column(name = "dg_lighting_available")
     private ChecklistOption dgLightingAvailable;

     @Column(length = 100)
     private String dgLightingRemarkContractor;

     @Column(length = 100)
     private String dgLightingRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "curing_arrangements")
     private ChecklistOption curingArrangements;

     @Column(length = 100)
     private String curingRemarkContractor;

     @Column(length = 100)
     private String curingRemarkEngineer;
     
     
     @Enumerated(EnumType.STRING)
     @Column(name = "transit_mixer_approach")
     private ChecklistOption transitMixerApproach;

     @Column(length = 100)
     private String transitMixerRemarkContractor;

     @Column(length = 100)
     private String transitMixerRemarkEngineer;
     
     @Enumerated(EnumType.STRING)
     @Column(name = "ppe_provided")
     private ChecklistOption ppeProvided;

     @Column(length = 100)
     private String ppeRemarkContractor;

     @Column(length = 100)
     private String ppeRemarkEngineer;

     @Column(name="enclosure_name")
     private String enclosureName;
     @Column(name="uploaded_by")
     private String uploadedby;

}