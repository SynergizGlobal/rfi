package com.metro.rfisystem.backend.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;

 public interface RFIInspectionChecklistService{

    public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, 
    		MultipartFile contractorSig, MultipartFile clientSig) throws IOException;
}
