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
    
     @Enumerated(EnumType.STRING)
     @Column(name = "alignment_ok")
     private ChecklistOption alignmentOk;
     
     @Column(length = 1000)
     private String drawingRemarkContractor;
     @Column(length = 1000)
     private String drawingRemarkAE;

     @Column(length = 1000)
     private String alignmentRemarkContractor;
     @Column(length = 1000)
     private String alignmentRemarkAE;
     
     @Column(name="enclosure_name")
     private String enclosureName;
     @Column(name="uploaded_by")
     private String uploadedby;

     private String contractorSignature;
     private String gcMrvcRepresentativeSignature;
 
}