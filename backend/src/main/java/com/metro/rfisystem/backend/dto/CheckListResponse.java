package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class CheckListResponse {
    Long checklistDescId;
    String checklistDescription;
    String contractorStatus;
    String engineerStatus;
    String contractorRemarks;
    String engineerRemark;

}