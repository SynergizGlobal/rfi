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

import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionChecklistRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIInspectionChecklistServicImpl  implements RFIInspectionChecklistService {
	
	
	 private final RFIInspectionChecklistRepository checklistRepository;
	 private final RFIInspectionDetailsRepository inspectionDetailsRepository;
	 @Value("${file.upload-dir}")
	 private String uploadDir;


	@Override
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, MultipartFile contractorSig,
			MultipartFile clientSig) throws IOException {
		
	
		  //  Fetch the RFIInspectionDetails using the ID
		    RFIInspectionDetails inspection = inspectionDetailsRepository.findById(dto.getInspectionId())
		        .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getInspectionId()));

	        RFIChecklistItem checklist = new RFIChecklistItem();
	        checklist.setRfiInspection(inspection);
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
	

	
}

