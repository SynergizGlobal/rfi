package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistDTO {
    private Long id;
    private String enclosername;
    private String action;
    private String checklisttitle;
    private String checklistDescription;

  
}

