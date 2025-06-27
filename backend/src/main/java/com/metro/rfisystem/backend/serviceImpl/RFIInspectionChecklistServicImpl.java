package com.metro.rfisystem.backend.serviceImpl;

import java.io.File;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionChecklistRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIInspectionChecklistServicImpl  implements RFIInspectionChecklistService {
	
	
	 private final RFIInspectionChecklistRepository checklistRepository;
	 private final RFIInspectionDetailsRepository inspectionDetailsRepository;
	 private final RFIRepository rfiRepository;
	 @Value("${file.upload-dir}")
	 private String uploadDir;


	@Override
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, MultipartFile contractorSig,
			MultipartFile clientSig) throws IOException {
		
	
		  //  Fetch the RFIInspectionDetails using the ID
		    RFI inspection = rfiRepository.findById(dto.getRfiId())
		        .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));

	        RFIChecklistItem checklist = new RFIChecklistItem();
	        checklist.setRfi(inspection);
	        checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
	        checklist.setDrawingApproved(dto.getDrawingApproved());
	        checklist.setDrawingRemarkContractor(dto.getDrawingRemarkContractor());
	        checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());
	        checklist.setAlignmentOk(dto.getAlignmentOk());
	        checklist.setAlignmentRemarkContractor(dto.getAlignmentRemarkContractor());
	        checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());

	        // Save contractor signature
	        if (contractorSig != null && !contractorSig.isEmpty()) {
	            String contractorPath = saveFile(contractorSig);
	            checklist.setContractorSignature(contractorPath);
	        }

	        // Save client signature
	        if (clientSig != null && !clientSig.isEmpty()) {
	            String clientPath = saveFile(clientSig);
	            checklist.setGcMrvcRepresentativeSignature(clientPath);
	        }

	        checklistRepository.save(checklist);
	    }

	    private String saveFile(MultipartFile file) throws IOException {
	        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
	        Path path = Paths.get(uploadDir + File.separator + filename);
	        Files.createDirectories(path.getParent());
	        Files.write(path, file.getBytes());
	        return path.toString();
	    }

		@Override
		public void updateChecklistWithFiles(Long checklistId, RFIInspectionChecklistDTO dto,
				MultipartFile contractorSignature, MultipartFile clientSignature) throws IOException {
			
			RFIChecklistItem checklist = checklistRepository.findById(checklistId)
	                .orElseThrow(() ->
	                     new RuntimeException("Checklist not found: " + checklistId));
			
			if (!checklist.getRfi().getId().equals(dto.getRfiId())) {
	            throw new IllegalArgumentException("RFI mismatch for checklist update");
	        }
			
			    checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
		        checklist.setDrawingApproved(dto.getDrawingApproved());
		        checklist.setDrawingRemarkContractor(dto.getDrawingRemarkContractor());
		        checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());
		        checklist.setAlignmentOk(dto.getAlignmentOk());
		        checklist.setAlignmentRemarkContractor(dto.getAlignmentRemarkContractor());
		        checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());
		        
		        
		        if (contractorSignature != null && !contractorSignature.isEmpty()) {
		            String newPath = replaceFile(checklist.getContractorSignature(),
		                                         contractorSignature);
		            checklist.setContractorSignature(newPath);
		        }
		        if (clientSignature != null && !clientSignature.isEmpty()) {
		            String newPath = replaceFile(checklist.getGcMrvcRepresentativeSignature(),
		                                         clientSignature);
		            checklist.setGcMrvcRepresentativeSignature(newPath);
		        }

		        
		        checklistRepository.save(checklist);
		        
		}
		
		 private String replaceFile(String oldPath, MultipartFile newFile)
		            throws IOException {

		        // delete old file if it exists
		        if (oldPath != null) {
		            try { Files.deleteIfExists(Paths.get(oldPath)); }
		            catch (IOException ex) { /* log & continue */ }
		        }

		        // store new file
		        String newName = UUID.randomUUID() + "_" + newFile.getOriginalFilename();
		        Path newPath  = Paths.get(uploadDir, newName);
		        Files.createDirectories(newPath.getParent());
		        newFile.transferTo(newPath.toFile());
		        return newPath.toString();
		    }
		
	   
		
		
	
		
		 
	
}

