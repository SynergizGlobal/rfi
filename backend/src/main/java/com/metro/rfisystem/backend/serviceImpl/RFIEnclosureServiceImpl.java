package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIEnclosure;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIEnclosureService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIEnclosureServiceImpl implements RFIEnclosureService {

	private final RFIEnclosureRepository enclosureRepository;
	private final RFIInspectionDetailsRepository inspectionRepository;
	 private final RFIRepository rfiRepository;
	    
	
    @Value("${rfi.enclosures.upload-dir}")
    private String uploadDir;
    
    @Override
    public String uploadEnclosureFile(Long inspectionId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Invalid file name.");
        }


        String fileName =  inspectionId+ "_" + originalFilename;
        Path uploadPath = Paths.get(uploadDir);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // Save to database
            
            RFIInspectionDetails inspection = inspectionRepository.findById(inspectionId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid Inspection ID"));

            RFIEnclosure enclosure = new RFIEnclosure();
            enclosure.setEnclosureUpload(filePath.toString());
            enclosure.setRfiInspection(inspection); 
            //enclosure.setFilePath(filePath.toString());
           
            enclosureRepository.save(enclosure);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
        }
}

	@Override
	public RFIInspectionAutofillDTO getAutofillData(Long rfiId) {
		
		 RFI rfi = rfiRepository.findById(rfiId)
	                .orElseThrow(() -> new RuntimeException("RFI not found"));

	        Optional<RFIInspectionDetails> inspectionOpt = inspectionRepository.findByRfiId(rfiId);

	        RFIInspectionAutofillDTO dto = new RFIInspectionAutofillDTO();
	        dto.setNameOfWork(rfi.getWork());
	        dto.setStructureType(rfi.getStructureType());
	        dto.setComponent(rfi.getComponent());
	        dto.setRfiNo(rfi.getRfi_Id());
	        
	        dto.setDate(rfi.getDateOfInspection() != null ? rfi.getDateOfInspection().toString() : "");

	        if (inspectionOpt.isPresent()) {
	            RFIInspectionDetails insp = inspectionOpt.get();
	            dto.setLocation(insp.getLocation() != null ? insp.getLocation() : rfi.getLocation());
	        } else {
	            dto.setLocation(rfi.getLocation());
	        }

	        return dto;
	    }
}