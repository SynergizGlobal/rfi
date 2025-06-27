package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.metro.rfisystem.backend.dto.InspectionStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rfi_inspection_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RFIInspectionDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rfi_id_fk", referencedColumnName = "id")
    @JsonBackReference
    private RFI rfi;

    @OneToMany(mappedBy = "rfiInspection", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RFIChecklistItem> checklistItems = new ArrayList<>();

    @OneToMany(mappedBy = "rfiInspection", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RFIEnclosure> enclosures = new ArrayList<>();
    
    @Column(name = "inspection_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfInspection;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime timeOfInspection;

    private String location;
    
    private String chainage;

    private String selfiePath; // uploaded image path
    @Column(name = "site_image", length = 10000)
    private String siteImage;
    
    @Enumerated(EnumType.STRING)
    private InspectionStatus inspectionStatus;

    private boolean testInsiteLab;
    
    private String  testSiteDocuments;
    
    private String imgUploadedByClient;
    
    private String imgUploadedByContractor;
}
