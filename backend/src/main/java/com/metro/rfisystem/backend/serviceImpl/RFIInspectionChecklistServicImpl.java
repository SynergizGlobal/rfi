package com.metro.rfisystem.backend.serviceImpl;

import java.io.File;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
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

		    Optional<RFIChecklistItem> existingOptional = checklistRepository.findByRfi(inspection);

	        RFIChecklistItem checklist = existingOptional.orElseGet(RFIChecklistItem::new);
	        checklist.setRfi(inspection);
	        if (dto.getGradeOfConcrete() != null) checklist.setGradeOfConcrete(dto.getGradeOfConcrete());

	        if (dto.getDrawingApproved() != null) checklist.setDrawingApproved(dto.getDrawingApproved());
	        if (dto.getDrawingRemarkContractor() != null) checklist.setDrawingRemarkContractor(dto.getDrawingRemarkContractor());
	        if (dto.getDrawingRemarkAE() != null) checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());

	        if (dto.getAlignmentOk() != null) checklist.setAlignmentOk(dto.getAlignmentOk());
	        if (dto.getAlignmentRemarkContractor() != null) checklist.setAlignmentRemarkContractor(dto.getAlignmentRemarkContractor());
	        if (dto.getAlignmentRemarkAE() != null) checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());
	        
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
		public void updateChecklistWithFiles( RFIInspectionChecklistDTO dto,
				MultipartFile contractorSignature, MultipartFile clientSignature) throws IOException {
			
			 // Fetch the associated RFI
		  //  RFI rfi = rfiRepository.findById(dto.getRfiId())
		   //     .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));

		    // Find the existing checklist for that RFI
		    RFIChecklistItem checklist = checklistRepository.findById(dto.getChecklistId())
		        .orElseThrow(() -> new RuntimeException("Checklist not found for RFI ID: " + dto.getChecklistId()));

		    // Update fields
		    checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
		    checklist.setDrawingApproved(dto.getDrawingApproved());
		    checklist.setDrawingRemarkContractor(dto.getDrawingRemarkContractor());
		    checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());
		    checklist.setAlignmentOk(dto.getAlignmentOk());
		    checklist.setAlignmentRemarkContractor(dto.getAlignmentRemarkContractor());
		    checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());

		    // Optional: replace contractor signature
		    if (contractorSignature != null && !contractorSignature.isEmpty()) {
		        String contractorPath = saveFile(contractorSignature);
		        checklist.setContractorSignature(contractorPath);
		    }

		    // Optional: replace client signature
		    if (clientSignature != null && !clientSignature.isEmpty()) {
		        String clientPath = saveFile(clientSignature);
		        checklist.setGcMrvcRepresentativeSignature(clientPath);
		    }

		        checklistRepository.save(checklist);
		        
		}
		
	
}

