package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.InspectionStatus;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.TestType;
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
    public String uploadEnclosureFile( Long rfiId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Invalid file name.");
        }


        String fileName =  rfiId+ "_" + originalFilename;
        Path uploadPath = Paths.get(uploadDir);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // Save to database
            
         //   RFIInspectionDetails inspection = inspectionRepository.findById(rfiId)
                 //   .orElseThrow(() -> new IllegalArgumentException("Invalid Inspection ID"));

            RFI inspection =rfiRepository.findById(rfiId).orElseThrow(() -> new IllegalArgumentException("Invalid RFI ID"));
            RFIEnclosure enclosure = new RFIEnclosure();
            enclosure.setEnclosureUploadFile(filePath.toString());
          //  enclosure.setRfiInspection(inspection);
            enclosure.setRfi(inspection);
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

	
	 @Value("${file.site.test.dir}")
	 private String uploadDirTest;
	@Override
	public void processConfirmation(InspectionStatus status, TestType testType,
			List<MultipartFile> files) {
		

	        if (files != null) {
	            files.forEach(file -> {
					try {
						saveFile(file);
					} catch (Exception e) {
						
						e.printStackTrace();
					}
				});
	        }

	        // Optional: persist to DB
	       // System.out.println("Saved: status=" + status + ", test=" + testType);
	    }

	    private void saveFile(MultipartFile file) throws Exception {
	        if (file.isEmpty()) return;

	        try {
	            Files.createDirectories(Paths.get(uploadDirTest));
	            Path dest = Paths.get(uploadDirTest).resolve(Paths.get(file.getOriginalFilename())).normalize().toAbsolutePath();

	            if (!dest.getParent().equals(Paths.get(uploadDirTest).toAbsolutePath())) {
	                throw new Exception("Cannot write file outside designated directory");
	            }

	            try (InputStream is = file.getInputStream()) {
	                Files.copy(is, dest, StandardCopyOption.REPLACE_EXISTING);
	            }
	        } catch (IOException e) {
	            throw new Exception("Failed to store " + file.getOriginalFilename(), e);
	        }
	    }
		
	}
