package com.metro.rfisystem.backend.service;

import java.io.IOException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;

public interface InspectionService {

	public RfiInspectionDTO getById(Long id);

	public void startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, MultipartFile[] siteImages);

    ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy) throws IOException, DocumentException;


}
