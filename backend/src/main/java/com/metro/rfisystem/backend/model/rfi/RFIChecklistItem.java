package com.metro.rfisystem.backend.model.rfi;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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

   
   //  @Enumerated(EnumType.STRING)
   //  private ChecklistOption status; // YES, NO, NA
     private String status;
     private String contractorRemark;
     private String aeRemark;

     @Column(name="enclosure_name")
     private String enclosureName;
     @Column(name="uploaded_by")
     private String uploadedby;

     
     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name="chk_des_id", referencedColumnName = "id")
     private ChecklistDescription checklistDescription;





}