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

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIInspectionChecklistServicImpl  implements RFIInspectionChecklistService {
	
	
	 private final RFIInspectionChecklistRepository checklistRepository;
	 private final RFIRepository rfiRepository;
	 @Value("${file.upload-dir}")
	 private String uploadDir;


	@Override
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, MultipartFile contractorSig,
			MultipartFile clientSig, String deptFk) throws IOException {
		
	
		  //  Fetch the RFIInspectionDetails using the ID
		    RFI inspection = rfiRepository.findById(dto.getRfiId())
		        .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));

		    Optional<RFIChecklistItem> existingOptional = checklistRepository.findByRfiAndEnclosureName(inspection, dto.getEnclosureName());

	        RFIChecklistItem checklist = existingOptional.orElseGet(RFIChecklistItem::new);
	        checklist.setRfi(inspection);
	        checklist.setEnclosureName(dto.getEnclosureName());
	        checklist.setUploadedby(deptFk);
	        if ("Con".equalsIgnoreCase(deptFk)) {
	        	checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
	        	checklist.setDrawingApproved(dto.getDrawingApproved());
		        checklist.setAlignmentOk(dto.getAlignmentOk());
	            checklist.setDrawingRemarkContractor(dto.getDrawingRemarkContractor());
	            checklist.setAlignmentRemarkContractor(dto.getAlignmentRemarkContractor());
	            checklist.setContractorSignature(contractorSig != null ? saveFile(contractorSig) : checklist.getContractorSignature());
	        } else if ("Engg".equalsIgnoreCase(deptFk)) {
	            checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());
	            checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());
	            checklist.setGcMrvcRepresentativeSignature(clientSig != null ? saveFile(clientSig) : checklist.getGcMrvcRepresentativeSignature());
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
		public RFIInspectionChecklistDTO getChecklist(Long rfiId, String enclosureName) {
			  RFI rfi = rfiRepository.findById(rfiId)
		                .orElseThrow(() -> new EntityNotFoundException("RFI not found with ID: " + rfiId));

		        RFIChecklistItem checklistItem = checklistRepository.findByRfiAndEnclosureName(rfi, enclosureName)
		                .orElseThrow(() -> new EntityNotFoundException("Checklist not found for enclosure: " + enclosureName));
     
		        return mapToDto(checklistItem);
		    }	
		
		   private RFIInspectionChecklistDTO mapToDto(RFIChecklistItem entity) {
			   RFIInspectionChecklistDTO dto = new RFIInspectionChecklistDTO();
		        dto.setRfiId(entity.getRfi().getId());
		        dto.setEnclosureName(entity.getEnclosureName());
		        dto.setGradeOfConcrete(entity.getGradeOfConcrete());
		        dto.setDrawingApproved(entity.getDrawingApproved());
		        dto.setAlignmentOk(entity.getAlignmentOk());
		        dto.setDrawingRemarkContractor(entity.getDrawingRemarkContractor());
		        dto.setAlignmentRemarkContractor(entity.getAlignmentRemarkContractor());
		       // dto.setContractorSignature()
		      //  dto.setContractorSignature(null);
		        

		        // AE / Regular User fields
		        dto.setDrawingRemarkAE(entity.getDrawingRemarkAE());
		        dto.setAlignmentRemarkAE(entity.getAlignmentRemarkAE());
		    //    dto.setGcMrvcRepresentativeSignature(entity.getGcMrvcRepresentativeSignature());

		        return dto;
		    }
	
}

