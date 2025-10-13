package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnclosureNameDto {
    private Long id;
    private String encloserName;
    private String action;
    
    public EnclosureNameDto(Long id, String encloserName) {
        this.id = id;
        this.encloserName = encloserName;
    }

}
