package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class RFIInspectionRequestDTO {
    private Long rfiId;
    private String location;
    private String chainage;
    private String StringRfiId;
    private String project;
    private String work;
    private String contract;
    private String contractor;
    private String activity;
    private String rfiDescription;
    private String description;
    private InspectionStatus inspectionStatus;
	private boolean testInsiteLab;
}
