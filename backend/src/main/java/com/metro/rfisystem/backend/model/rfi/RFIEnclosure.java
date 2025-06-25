package com.metro.rfisystem.backend.model.rfi;


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
    private RFIInspectionDetails rfiInspection;
    
    
    private String rfiId;
    private String view;
    
    private String other;
    
    @Column(length = 1000)
    private String enclosureUpload;
}
