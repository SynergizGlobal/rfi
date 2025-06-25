package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class RFIInspectionRequestDTO {
    private Long rfiId;
    private String location;
    private String chainage;
}
