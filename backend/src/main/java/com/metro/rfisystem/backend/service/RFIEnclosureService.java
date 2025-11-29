package com.metro.rfisystem.backend.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.dto.EnclosureFileDto;
import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.dto.InspectionStatus;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.TestType;

public interface RFIEnclosureService {
	String uploadEnclosureFile(Long rfiId, String enclosureName, MultipartFile file, String description);
    
    public RFIInspectionAutofillDTO getAutofillData(Long rfiId);

    public void processConfirmation(InspectionStatus status, TestType testType,
			List<MultipartFile> files);

    public List<EnclosureFileDto> getEnclosures(Long rfiId);


	int deleteFilesForEnclosure(Long rfiId, String enclosureName);







	

	
}