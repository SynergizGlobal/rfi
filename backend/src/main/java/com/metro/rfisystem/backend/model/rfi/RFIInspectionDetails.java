package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus;
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
    
    private String txn_id;
    private String created_by;
    private String rfi_id;
    
    @Column(name = "measurement_type")
    private String measurementType;

    @Column(name = "length")
    private Double length;

    @Column(name = "breadth")
    private Double breadth;

    @Column(name = "height")
    private Double height;

    @Column(name = "no_of_items")
    private Integer noOfItems;
  

    @Column(name = "total_qty")
    private Double totalQty;
    
    @Column(name = "ae_remarks", length = 1000)
    private String engineerRemarks;

    
    @Column(name = "work_status")
    private InspectionWorkFlowStatus workStatus;
    
    @Column(name = "contractor_submitted_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate contractor_submitted_date;
    
    @Column(name = "engineer_submitted_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate engineer_submitted_date;
    
    @Column(name = "contractor_esign_done")
    private Boolean contractorEsignDone = false;

    @Column(name = "engineer_esign_done")
    private Boolean engineerEsignDone = false;
    
}
