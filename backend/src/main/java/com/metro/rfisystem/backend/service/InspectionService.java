package com.metro.rfisystem.backend.service;

import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;

public interface InspectionService {

	public RfiInspectionDTO getById(Long id);

	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, MultipartFile[] siteImages,String UserRole);

	public void updateInspectionStatus(RFIInspectionRequestDTO dto, MultipartFile testDocument);
    ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy) throws IOException, DocumentException;


}
