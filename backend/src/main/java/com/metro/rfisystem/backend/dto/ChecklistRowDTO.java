package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistRowDTO {

	private Long checklistDescriptionId;
	 private String description;
	    //private ChecklistOption status;
	 private String status;
	    private String contractorRemark;
	    private String aeRemark;
}

