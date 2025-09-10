package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiDetailsDTO {
    private RfiReportDTO reportDetails;              
    private List<ChecklistItemDTO> checklistItems;  
    private List<EnclosureDTO> enclosures;          
}
