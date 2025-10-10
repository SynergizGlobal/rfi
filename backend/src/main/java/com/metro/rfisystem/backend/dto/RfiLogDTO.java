package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfiLogDTO {
	private long id;
    private String rfiId;
    private String dateOfSubmission;
    private String rfiDescription;
    private String rfiRequestedBy;
    private String department;
    private String person;
    private String dateRaised;
    private String dateResponded;
    private String  enggApproval;
    private String status;
    private String eStatus;
    private String notes;
    private String project;
    private String work;
    private String contract;
	private String nameOfRepresentative;
	private String txnId;


}
