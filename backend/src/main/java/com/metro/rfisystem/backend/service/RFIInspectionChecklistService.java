package com.metro.rfisystem.backend.service;


import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;

 public interface RFIInspectionChecklistService{


		public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, MultipartFile contractorSignature,
				MultipartFile clientSignature, String userRole) throws Exception;
    
	    public RFIInspectionChecklistDTO getChecklist(Long rfiId, String enclosureName);


}
