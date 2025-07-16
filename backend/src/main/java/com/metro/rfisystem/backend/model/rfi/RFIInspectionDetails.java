package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.metro.rfisystem.backend.dto.InspectionStatus;
import com.metro.rfisystem.backend.dto.TestType;
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
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "rfi_inspection_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "rfi")
public class RFIInspectionDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rfi_id_fk", referencedColumnName = "id")
    @JsonBackReference
    private RFI rfi;

   
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
    @Column(columnDefinition ="VARCHAR(20)")
    private InspectionStatus inspectionStatus;

   
    @Enumerated(EnumType.STRING)
    @Column(name="test_insite_lab", nullable =true)
    private TestType testInsiteLab;
    
    private String  testSiteDocuments;
    
    @Column(name="uploaded_by")
    private String uploadedBy;
}
