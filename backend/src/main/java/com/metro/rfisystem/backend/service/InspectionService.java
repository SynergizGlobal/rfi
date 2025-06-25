package com.metro.rfisystem.backend.service;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;

public interface InspectionService {
	
	  public RfiInspectionDTO getById(Long id);

	public void startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, MultipartFile[] siteImages);

	
}
