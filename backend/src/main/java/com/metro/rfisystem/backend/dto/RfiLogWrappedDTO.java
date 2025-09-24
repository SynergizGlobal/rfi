package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiLogWrappedDTO {
    private RfiDetailsLogDTO reportDetails;              
    private List<ChecklistItemDTO> checklistItems;  
    private List<EnclosureDTO> enclosures;
    private Optional<MeasurementDTO> measurementDetails;
}
