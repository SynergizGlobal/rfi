package com.metro.rfisystem.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistRowDTO {

    @JsonProperty("checklistDescriptionId")
	 private Long checklistDescriptionId;
	private String description;   
	 private String status;
	  private String contractorRemark;
	   private String aeRemark;
}

