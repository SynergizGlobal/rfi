package com.metro.rfisystem.backend.service;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;

public interface RFIEnclosureService {
    String uploadEnclosureFile(Long inspectionId, MultipartFile file);
    
    public RFIInspectionAutofillDTO getAutofillData(Long rfiId);
}