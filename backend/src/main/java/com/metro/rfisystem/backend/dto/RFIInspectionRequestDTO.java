package com.metro.rfisystem.backend.dto;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RFIInspectionRequestDTO {
	private Long inspectionId;
    private Long rfiId;
    private String location;
    private String chainage;
    private String selfiePath;
    private String  testSiteDocuments;
    private String StringRfiId;
    private String project;
    private String work;
    private String contract;
    private String contractor;
    private String activity;
    private String rfiDescription;
    private String description;
    private InspectionStatus inspectionStatus;
	private TestType testInsiteLab;
	private String nameOfRepresentative; 
	private String measurementType;
    private Double length;
    private Double breadth;
    private Double height;
    private Integer noOfItems;
    private Double totalQty;
    private Double weight;
    private String units;
    private String engineerRemarks;
    private Object workStatus;
    private String uploadedBy;
    private String descriptionEnclosure;
    private MeasurementDTO measurements;
    private List<String> supportingDescriptions; // descriptions
    private List<String> supportingFiles;




	
   
}
