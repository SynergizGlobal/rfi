package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
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
	public boolean sendRfiForValidation(Long rfiId) {
		Optional<RfiStatusProjection> rfiProjOpt = rfiRepository.findStatusById(rfiId);

		if (rfiProjOpt.isPresent()) {
		    RfiStatusProjection rfi = rfiProjOpt.get();

		    if ( !"INSPECTED_By_AE".equalsIgnoreCase(rfi.getStatus())) {
		        return false;
		    }

		    // Now fetch full entity to update + link validation
		    RFI fullRfi = rfiRepository.findById(rfi.getId())
		                               .orElseThrow(() -> new RuntimeException("RFI not found"));

		    fullRfi.setStatus("VALIDATION_PENDING");

		    RfiValidation validation = new RfiValidation();
		    validation.setRfi(fullRfi);
		    validation.setSentForValidationAt(LocalDateTime.now());

		    fullRfi.setRfiValidation(validation);

		    rfiRepository.save(fullRfi);

		    return true;
		}
		return false;
    }

	@Override
	public List<GetRfiDTO> showRfiValidations() {
		return rfiRepository.showRfiValidations();
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

	    rfi.setStatus("INSPECTION_DONE");
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
	public void generateRfiPdf(long id, OutputStream out) throws Exception {
		// TODO Auto-generated method stub
		
	}

	@Override
	public List<RfiReportDTO> getRfiReportDetails(long id) {
		
		return rfiRepository.getRfiReportDetails(id);
	}
	
//	@Override
//    public void generateRfiPdf(long id, OutputStream out) throws Exception {
//        RfiReportDTO dto = rfiRepository.getRfiReportDetails(id);
//        new RfiPdfGenerator().generateRfiReportPdf(dto, out);
//    }
	
	
}
