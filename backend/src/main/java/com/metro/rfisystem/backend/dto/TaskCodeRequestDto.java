package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskCodeRequestDto {
    private String contractId;
    private String structureType;
    private String structure;
    private String component;
    private String element;
    private String activityName;
}
