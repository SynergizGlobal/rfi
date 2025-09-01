package com.metro.rfisystem.backend.dto;




import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class RFIInspectionChecklistDTO {

	private Long checklistId;
	private Long rfiId;
    private String gradeOfConcrete;
    private List<ChecklistRowDTO> checklistRows = new ArrayList<>();;
    private String enclosureName;
    private String uploadedBy;
}
