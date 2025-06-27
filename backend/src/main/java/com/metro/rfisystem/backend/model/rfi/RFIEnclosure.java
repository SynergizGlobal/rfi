package com.metro.rfisystem.backend.model.rfi;


import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "rfi_enclosure")
@Data
public class RFIEnclosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "inspection_id_fk", nullable = false)
    @JsonBackReference
    private RFIInspectionDetails rfiInspection;
    
    
    private String enclosureName;
    private String view;
    
    
    @Column(length = 1000)
    private String enclosureUploadFile;
}
