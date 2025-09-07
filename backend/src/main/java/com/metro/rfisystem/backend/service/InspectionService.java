 package com.metro.rfisystem.backend.service;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;

public interface InspectionService {

	public RfiInspectionDTO getById(Long id);

	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, List<MultipartFile> siteImages, MultipartFile testDocument, String deptFk);

	public InspectionSubmitResult SubmitInspection(RFIInspectionRequestDTO dto, MultipartFile testDocument, String deptFk);
	
    ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy) throws IOException, DocumentException;

	public InspectionSubmitResult markAsSubmitted(Long inspectionId, String deptFk);


}
