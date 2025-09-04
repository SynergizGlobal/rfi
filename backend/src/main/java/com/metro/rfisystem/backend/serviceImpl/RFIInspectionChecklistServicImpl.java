package com.metro.rfisystem.backend.serviceImpl;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class RFIInspectionChecklistServicImpl implements RFIInspectionChecklistService {


    private final RFIInspectionChecklistRepository checklistRepository;
    private final RFIRepository rfiRepository;
    private final ChecklistDescriptionRepository checklistDescriptionRepo;
    @Value("${file.upload-dir}")
    private String uploadDir;


    
    
	@Override
    @Transactional
	public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto,String deptFk)  {
		
	

	    // Fetch the RFIInspectionDetails using the ID
	    RFI inspection = rfiRepository.findById(dto.getRfiId())
	            .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));

	    if (dto.getChecklistRows() != null) {
	        for (ChecklistRowDTO row : dto.getChecklistRows()) {

	            ChecklistDescription description = null;
	            if (row.getChecklistDescriptionId() != null) {
	                description = checklistDescriptionRepo.findById(row.getChecklistDescriptionId())
	                        .orElseThrow(() -> new RuntimeException(
	                                "Invalid checklist description id: " + row.getChecklistDescriptionId()));
	            }

	            // 🔎 Check if record exists
	            Optional<RFIChecklistItem> existing = checklistRepository
	                    .findByRfiAndEnclosureNameAndChecklistDescription(inspection, dto.getEnclosureName(), description);

	            RFIChecklistItem checklist;
	            if (existing.isPresent()) {
	                // ✅ Update existing
	                checklist = existing.get();
	            } else {
	                // ➕ Create new
	                checklist = new RFIChecklistItem();
	                checklist.setRfi(inspection);
	                checklist.setEnclosureName(dto.getEnclosureName());
	                checklist.setUploadedby(deptFk);
	                checklist.setChecklistDescription(description);
	            }

	            // Update fields
	            checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
	            checklist.setStatus(row.getStatus());
	            checklist.setContractorRemark(row.getContractorRemark());
	            checklist.setAeRemark(row.getAeRemark());

	            checklistRepository.save(checklist);
	        }
	    }
	}
//    @Override
//    @Transactional
//    public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, String deptFk) throws IOException {
//
//
//        //  Fetch the RFIInspectionDetails using the ID
//        RFI inspection = rfiRepository.findById(dto.getRfiId())
//                .orElseThrow(() -> new RuntimeException("Invalid inspection ID: " + dto.getRfiId()));
//
//        List<RFIChecklistItem> existingRows = checklistRepository.findAllByRfiAndEnclosureName(inspection, dto.getEnclosureName());
//        if (!existingRows.isEmpty()) {
//            checklistRepository.deleteAll(existingRows);
//        }
//
//        // save each row
//        if (dto.getChecklistRows() != null) {
//            for (ChecklistRowDTO row : dto.getChecklistRows()) {
//                RFIChecklistItem checklist = new RFIChecklistItem();
//                checklist.setRfi(inspection);
//                checklist.setEnclosureName(dto.getEnclosureName());
//                checklist.setUploadedby(deptFk);
//
//                // set contractor vs engineer fields
//                checklist.setGradeOfConcrete(dto.getGradeOfConcrete());
//                checklist.setStatus(row.getStatus());
//                checklist.setContractorRemark(row.getContractorRemark());
//                checklist.setAeRemark(row.getAeRemark());
//
//                if (row.getChecklistDescriptionId() != null) {
//                    ChecklistDescription description = checklistDescriptionRepo.findById(row.getChecklistDescriptionId())
//                            .orElseThrow(() -> new RuntimeException("Invalid checklist description id: " + row.getChecklistDescriptionId()));
//                    checklist.setChecklistDescription(description);
//                }
//
//                checklistRepository.save(checklist);
//            }
//        }
//    }
    
    
	/*
	 * @Transactional
	 * 
	 * @Override public void saveChecklistWithFiles(InspectionRequest requests,
	 * String deptFk) throws Exception { RFI rfi =
	 * rfiRepository.findById(requests.id()).orElseThrow(() -> new
	 * EntityNotFoundException("RFI not found")); List<RFIChecklistItem>
	 * existingRows = checklistRepository.findAllByRfiAndEnclosureName(rfi,
	 * requests.enclosureName());
	 * 
	 * List<InspectionRequest.InspectionRequestDto> dtos = requests.dtos();
	 * List<RFIChecklistItem> items = new ArrayList<>(); if (!dtos.isEmpty()) { for
	 * (InspectionRequest.InspectionRequestDto dto : dtos) { RFIChecklistItem item =
	 * new RFIChecklistItem(); RFIChecklistItem checklist = new RFIChecklistItem();
	 * checklist.setRfi(rfi); checklist.setEnclosureName(requests.enclosureName());
	 * checklist.setUploadedby(deptFk);
	 * 
	 * // set contractor vs engineer fields
	 * checklist.setGradeOfConcrete(requests.gradeOfConceret());
	 * checklist.setStatus(dto.status());
	 * checklist.setContractorRemark(dto.constructorRemarks());
	 * checklist.setAeRemark(dto.engineerRemarks()); if (dto.descriptionId() !=
	 * null) { ChecklistDescription description =
	 * checklistDescriptionRepo.findById(dto.checkListId()) .orElseThrow(() -> new
	 * RuntimeException("Invalid checklist description id: " +
	 * dto.descriptionId())); checklist.setChecklistDescription(description); }
	 * items.add(checklist); } } checklistRepository.saveAll(items); }
	 * 
	 */
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

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

