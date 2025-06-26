package com.metro.rfisystem.backend.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ConfirmationRequestDTO {
    private InspectionStatus inspectionStatus;
    private TestType testsInSiteLab;
    private List<MultipartFile> uploadDocuments;

   
}

