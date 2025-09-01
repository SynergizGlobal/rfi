package com.metro.rfisystem.backend.serviceImpl;


import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.metro.rfisystem.backend.dto.ChecklistRowDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
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
	 private final ChecklistDescriptionRepository checklistDescriptionRepo;
	 @Value("${file.upload-dir}")
	 private String uploadDir;


	@Override
    @Transactional
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto,String deptFk) throws IOException {
		
	
		  //  Fetch the RFIInspectionDetails using the ID
		    RFI inspection = rfiRepository.findById(dto.getRfiId())
		        .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));

		    List<RFIChecklistItem> existingRows = checklistRepository.findAllByRfiAndEnclosureName(inspection, dto.getEnclosureName());
		    if (!existingRows.isEmpty()) {
		        checklistRepository.deleteAll(existingRows);
		    }

		    // save each row
		    if (dto.getChecklistRows() != null) {
		    for (ChecklistRowDTO row : dto.getChecklistRows()) {
		        RFIChecklistItem checklist = new RFIChecklistItem();
		        checklist.setRfi(inspection);
		        checklist.setEnclosureName(dto.getEnclosureName());
		        checklist.setUploadedby(deptFk);

		        // set contractor vs engineer fields
		        checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
		         checklist.setStatus(row.getStatus());
		        checklist.setContractorRemark(row.getContractorRemark());
		        checklist.setAeRemark(row.getAeRemark());
		        
		        if (row.getChecklistDescriptionId() != null) {
	                ChecklistDescription description = checklistDescriptionRepo.findById(row.getChecklistDescriptionId())
	                        .orElseThrow(() -> new RuntimeException("Invalid checklist description id: " + row.getChecklistDescriptionId()));
	                checklist.setChecklistDescription(description);
		        }
		    
	        checklistRepository.save(checklist);
	    } }
	}
		@Override
		public RFIInspectionChecklistDTO getChecklist(Long rfiId, String enclosureName) {
			  RFI rfi = rfiRepository.findById(rfiId)
		                .orElseThrow(() -> new EntityNotFoundException("RFI not found with ID: " + rfiId));

	
			  
			  List<RFIChecklistItem> items = checklistRepository.findAllByRfiAndEnclosureName(rfi, enclosureName);
			    if (items.isEmpty()) {
			        throw new EntityNotFoundException("Checklist not found for enclosure: " + enclosureName);
			    }

			    RFIInspectionChecklistDTO dto = new RFIInspectionChecklistDTO();
			    dto.setRfiId(rfi.getId());
			    dto.setEnclosureName(enclosureName);
			    dto.setGradeOfConcrete(items.get(0).getGradeOfConcrete());
                dto.setChecklistId(dto.getChecklistId());
			    List<ChecklistRowDTO> rowDtos = items.stream().map(entity -> {
			        ChecklistRowDTO row = new ChecklistRowDTO();

			        row.setStatus(entity.getStatus());
			        row.setContractorRemark(entity.getContractorRemark());
			        row.setAeRemark(entity.getAeRemark());
			        return row;
			    }).toList();

			    dto.setChecklistRows(rowDtos);
				      return dto;
		    }

	
	
}

