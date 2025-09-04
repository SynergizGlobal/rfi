package com.metro.rfisystem.backend.controller;

import java.util.List;

public record InspectionRequest(Long id, String enclosureName, String gradeOfConceret,
                                List<InspectionRequestDto> dtos) {
    public record InspectionRequestDto(Long checkListId, String constructorRemarks, Long descriptionId,
                                       String engineerRemarks, String status) {

    }
}



