package com.metro.rfisystem.backend.serviceImpl;
 
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;
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
	public List<RfiReportDTO> getRfiReportDetails(long id) {
		return rfiRepository.getRfiReportDetails(id);
	}


}