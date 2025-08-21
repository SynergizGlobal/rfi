package com.metro.rfisystem.backend.serviceImpl;



import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionChecklistRepository;

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
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto,String deptFk) throws IOException {
		
	
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
	            checklist.setCleaningOk(dto.getCleaningOk());
	            checklist.setCleaningRemarkContractor(dto.getCleaningRemarkContractor());
	            checklist.setJointPacking(dto.getJointPacking());
	            checklist.setJointPackingRemarkContractor(dto.getJointPackingRemarkContractor());
	            checklist.setBarBendingApproved(dto.getBarBendingApproved());
	            checklist.setBarBendingRemarkContractor(dto.getBarBendingRemarkContractor());
	            checklist.setCoverBlockProvided(dto.getCoverBlockProvided());
	            checklist.setCoverBlockRemarkContractor(dto.getCoverBlockRemarkContractor());
	            checklist.setReinforcementAlignment(dto.getReinforcementAlignment());
	            checklist.setReinforcementRemarkContractor(dto.getReinforcementRemarkContractor());
	            checklist.setWalkwayAvailable(dto.getWalkwayAvailable());
	            checklist.setWalkwayRemarkContractor(dto.getWalkwayRemarkContractor());
	            checklist.setMixDesignApproved(dto.getMixDesignApproved());
	            checklist.setMixDesignRemarkContractor(dto.getMixDesignRemarkContractor());
	            checklist.setVibratorsAvailable(dto.getVibratorsAvailable());
	            checklist.setVibratorsRemarkContractor(dto.getVibratorsRemarkContractor());
	            checklist.setPropsProvided(dto.getPropsProvided());
	            checklist.setPropsRemarkContractor(dto.getPropsRemarkContractor());
	            checklist.setLevelPegsFixed(dto.getLevelPegsFixed());
	            checklist.setLevelPegsRemarkContractor(dto.getLevelPegsRemarkContractor());
	            checklist.setConcretePumpAvailable(dto.getConcretePumpAvailable());
	            checklist.setConcretePumpRemarkContractor(dto.getConcretePumpRemarkContractor());
	            checklist.setDgLightingAvailable(dto.getDgLightingAvailable());
	            checklist.setDgLightingRemarkContractor(dto.getDgLightingRemarkContractor());
	            checklist.setCuringArrangements(dto.getCuringArrangements());
	            checklist.setCuringRemarkContractor(dto.getCuringRemarkContractor());
	            checklist.setTransitMixerApproach(dto.getTransitMixerApproach());
	            checklist.setTransitMixerRemarkContractor(dto.getTransitMixerRemarkContractor());
	            checklist.setPpeProvided(dto.getPpeProvided());
	            checklist.setPpeRemarkContractor(dto.getPpeRemarkContractor());
	            
	        } else if ("Engg".equalsIgnoreCase(deptFk)) {
	            checklist.setDrawingRemarkAE(dto.getDrawingRemarkAE());
	            checklist.setAlignmentRemarkAE(dto.getAlignmentRemarkAE());
	            checklist.setCleaningRemarkEngineer(dto.getCleaningRemarkEngineer());
	            checklist.setJointPackingRemarkEngineer(dto.getJointPackingRemarkEngineer());
	            checklist.setBarBendingRemarkEngineer(dto.getBarBendingRemarkEngineer());
	            checklist.setCoverBlockRemarEngineer(dto.getCoverBlockRemarkEngineer());
	            checklist.setReinforcementRemarkEngineer(dto.getReinforcementRemarkEngineer());
	            checklist.setWalkwayRemarkEngineer(dto.getWalkwayRemarkEngineer());
	            checklist.setMixDesignRemarEngineer(dto.getMixDesignRemarkEngineer());
	            checklist.setVibratorsRemarkEngineer(dto.getVibratorsRemarkEngineer());
	            checklist.setPropsRemarkEngineer(dto.getPropsRemarkEngineer());
	            checklist.setLevelPegsRemarkEngineer(dto.getLevelPegsRemarkEngineer());
	            checklist.setConcretePumpRemarkEngineer(dto.getConcretePumpRemarkEngineer());
	            checklist.setDgLightingRemarkEngineer(dto.getDgLightingRemarkEngineer());
	            checklist.setCuringRemarkEngineer(dto.getCuringRemarkEngineer());
	            checklist.setTransitMixerRemarkEngineer(dto.getTransitMixerRemarkEngineer());
	            checklist.setPpeRemarkEngineer(dto.getPpeRemarkEngineer());
	        }

	      
	       
	        checklistRepository.save(checklist);
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
		        dto.setCleaningOk(entity.getCleaningOk());
	            dto.setCleaningRemarkContractor(entity.getCleaningRemarkContractor());
	            dto.setJointPacking(entity.getJointPacking());
	            dto.setJointPackingRemarkContractor(entity.getJointPackingRemarkContractor());
	            dto.setBarBendingApproved(entity.getBarBendingApproved());
	            dto.setBarBendingRemarkContractor(entity.getBarBendingRemarkContractor());
	            dto.setCoverBlockProvided(entity.getCoverBlockProvided());
	            dto.setCoverBlockRemarkContractor(entity.getCoverBlockRemarkContractor());
	            dto.setReinforcementAlignment(entity.getReinforcementAlignment());
	            dto.setReinforcementRemarkContractor(entity.getReinforcementRemarkContractor());
	            dto.setWalkwayAvailable(entity.getWalkwayAvailable());
	            dto.setWalkwayRemarkContractor(entity.getWalkwayRemarkContractor());
	            dto.setMixDesignApproved(entity.getMixDesignApproved());
	            dto.setMixDesignRemarkContractor(entity.getMixDesignRemarkContractor());
	            dto.setVibratorsAvailable(entity.getVibratorsAvailable());
	            dto.setVibratorsRemarkContractor(entity.getVibratorsRemarkContractor());
	            dto.setPropsProvided(entity.getPropsProvided());
	            dto.setPropsRemarkContractor(entity.getPropsRemarkContractor());
	            dto.setLevelPegsFixed(entity.getLevelPegsFixed());
	            dto.setLevelPegsRemarkContractor(entity.getLevelPegsRemarkContractor());
	            dto.setConcretePumpAvailable(entity.getConcretePumpAvailable());
	            dto.setConcretePumpRemarkContractor(entity.getConcretePumpRemarkContractor());
	            dto.setDgLightingAvailable(entity.getDgLightingAvailable());
	            dto.setDgLightingRemarkContractor(entity.getDgLightingRemarkContractor());
	            dto.setCuringArrangements(entity.getCuringArrangements());
	            dto.setCuringRemarkContractor(entity.getCuringRemarkContractor());
	            dto.setTransitMixerApproach(entity.getTransitMixerApproach());
	            dto.setTransitMixerRemarkContractor(entity.getTransitMixerRemarkContractor());
	            dto.setPpeProvided(entity.getPpeProvided());
	            dto.setPpeRemarkContractor(entity.getPpeRemarkContractor());
	            
		        

		        //  Engineer fields
		        dto.setDrawingRemarkAE(entity.getDrawingRemarkAE());
		        dto.setAlignmentRemarkAE(entity.getAlignmentRemarkAE());
		        dto.setCleaningRemarkEngineer(entity.getCleaningRemarkEngineer());
		        dto.setJointPackingRemarkEngineer(entity.getJointPackingRemarkEngineer());
		        dto.setBarBendingRemarkEngineer(entity.getBarBendingRemarkEngineer());
		        dto.setCoverBlockRemarkEngineer(entity.getCoverBlockRemarEngineer());
		        dto.setReinforcementRemarkEngineer(entity.getReinforcementRemarkEngineer());
		        dto.setWalkwayRemarkEngineer(entity.getWalkwayRemarkEngineer());
		        dto.setMixDesignRemarkEngineer(entity.getMixDesignRemarEngineer());
		        dto.setVibratorsRemarkEngineer(entity.getVibratorsRemarkEngineer());
		        dto.setPropsRemarkEngineer(entity.getPropsRemarkEngineer());
		        dto.setLevelPegsRemarkEngineer(entity.getLevelPegsRemarkEngineer());
		        dto.setConcretePumpRemarkEngineer(entity.getConcretePumpRemarkEngineer());
		        dto.setDgLightingRemarkEngineer(entity.getDgLightingRemarkEngineer());
		        dto.setCuringRemarkEngineer(entity.getCuringRemarkEngineer());
		        dto.setTransitMixerRemarkEngineer(entity.getTransitMixerRemarkEngineer());
		        dto.setPpeRemarkEngineer(entity.getPpeRemarkEngineer());
		        return dto;
		    }
	
}

