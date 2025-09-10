package com.metro.rfisystem.backend.serviceImpl;
 
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.ChecklistItemDTO;
import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.repository.rfi.RfiValidationRepository;
import com.metro.rfisystem.backend.service.RfiValidationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
 
@Service
@RequiredArgsConstructor
public class RfiValidationServiceImpl implements RfiValidationService {
	@Value("${file.uploadDsc.path}")
	private String dscBasePath;
 
	private final RFIRepository rfiRepository;
	private final RfiValidationRepository rfiValidationRepository;
	private final ChecklistDescriptionRepository checklistDescriptionRepository; 
	private final RFIEnclosureRepository enclosureRepository;
	

	@Override
	public List<GetRfiDTO> showValidations(String UserRole, String UserType, String UserId, String Department,
			String UserName) {
		if("IT Admin".equalsIgnoreCase(UserRole)) {
			return rfiRepository.showRfiValidationsItAdmin();
		}
		else if ("DyHOD".equalsIgnoreCase(UserType)) {
			return rfiRepository.showRfiValidationsDyHod(UserId);
		}
		return rfiRepository.showRfiValidationsAssignedBy(UserName);
	}
	
	
	@Override
	@Transactional
	public void validateRfiWithFile(RfiValidateDTO dto) {
	    Optional<RFI> rfiOpt = rfiRepository.findById(dto.getLong_rfi_id());
	    Optional<RfiValidation> valOpt = rfiValidationRepository.findById(dto.getLong_rfi_validate_id());
 
	    if (rfiOpt.isEmpty() || valOpt.isEmpty()) {
	        throw new RuntimeException("Invalid RFI or Validation ID.");
	    }
 
	    RFI rfi = rfiOpt.get();
	    RfiValidation validation = valOpt.get();
 
	    rfi.setStatus(EnumRfiStatus.INSPECTION_DONE);
	    rfiRepository.save(rfi);
 
	    validation.setRemarks(dto.getRemarks());
	    validation.setEnumValidation(dto.getAction());
 
	    MultipartFile file = dto.getFile();
	    if (file != null && !file.isEmpty()) {
	        try {
	            String folderPath = dscBasePath  + "/UploadDsc";
	            Path uploadDir = Paths.get(folderPath);
	            Files.createDirectories(uploadDir);
 
	            String fileName = file.getOriginalFilename();
	            Path fullFilePath = uploadDir.resolve(fileName);
	            file.transferTo(fullFilePath.toFile());
 
	            validation.setDscFilePath(fullFilePath.toString());
 
	        } catch (IOException e) {
	            throw new RuntimeException("Failed to upload DSC file", e);
	        }
	    }
 
	    rfiValidationRepository.save(validation);
	}

 
	@Override
	public RfiDetailsDTO getRfiPreview(Long rfiId) {
	    // Get report details (you already have List, so take first if present)
	    List<RfiReportDTO> reportList = rfiRepository.getRfiReportDetails(rfiId);
	    RfiReportDTO report = reportList.isEmpty() ? null : reportList.get(0);

	    // Get checklist + enclosures
	    List<ChecklistItemDTO> checklist = checklistDescriptionRepository.findChecklistItemsByRfiId(rfiId);
	    List<EnclosureDTO> enclosures = enclosureRepository.findEnclosuresByRfiId(rfiId);

	    return new RfiDetailsDTO(report, checklist, enclosures);
	}

	
	@Override
	@Transactional
	public String sendRfiForValidation(Long rfiId) {
	    Optional<RfiStatusProjection> rfiProjOpt = rfiRepository.findStatusById(rfiId);

	    if (rfiProjOpt.isEmpty()) {
	        return "RFI not found.";
	    }
	    RfiStatusProjection rfi = rfiProjOpt.get();
	    System.out.println(
	        "RFI ID: " + rfi.getId() +
	        ", Status: " + rfi.getStatus() +
	        ", Approval Status: " + rfi.getApprovalStatus()
	    );

	    // Already sent for validation
	    if (EnumRfiStatus.VALIDATION_PENDING.name().equalsIgnoreCase(rfi.getStatus())) {
	        return "RFI has already been sent for validation.";
	    }
	    
	    // Already sent for validation
	    if (EnumRfiStatus.INSPECTION_DONE.name().equalsIgnoreCase(rfi.getStatus())) {
	        return "RFI has already been Closed.";
	    }
	    
	    // Not yet inspected by engineer
	    if (!EnumRfiStatus.INSPECTED_BY_AE.name().equalsIgnoreCase(rfi.getStatus())) {
	        return "RFI has not been inspected yet by the engineer.";
	    }
	    
	    // Rejected by engineer
	    if (rfi.getApprovalStatus() == null) {
	        return "Inspection Approval Status By Engineer is Pending...";
	    }


	    // Rejected by engineer
	    if (!"Accepted".equalsIgnoreCase(rfi.getApprovalStatus())) {
	        return "Inspection was rejected  by the engineer.";
	    }

	

	    // ✅ Allowed case: INSPECTED_BY_AE + Accepted → move to VALIDATION_PENDING
	    RFI fullRfi = rfiRepository.findById(rfi.getId())
	            .orElseThrow(() -> new RuntimeException("RFI not found"));

	    fullRfi.setStatus(EnumRfiStatus.VALIDATION_PENDING);

	    RfiValidation validation = new RfiValidation();
	    validation.setRfi(fullRfi);
	    validation.setSentForValidationAt(LocalDateTime.now());

	    fullRfi.setRfiValidation(validation);
	    rfiRepository.save(fullRfi);

	    return "RFI sent for validation successfully.";
	}


}