package com.metro.rfisystem.backend.controller;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Collections;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;
import com.metro.rfisystem.backend.service.RfiValidationService;
import jakarta.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/validation")
public class RfiValidateController {

	private final RfiValidationService rfiValidationService;


	@PostMapping(value = "/validate")
	public ResponseEntity<String> validateRfis(@ModelAttribute RfiValidateDTO dto) {
		boolean success = false;
	     success = rfiValidationService.validateRfi(dto);
	    if (success == false) {
	    	 return ResponseEntity
		                .status(HttpStatus.BAD_REQUEST)
		                .body("Failed to validate RFI.");
	       
	    } else {
	    	 return ResponseEntity.ok("RFI validated successfully.");
	    }
	}

	
	
	@PostMapping("/send-for-validation/{rfiId}")
	public ResponseEntity<String> sendForValidation(@PathVariable Long rfiId) {
	    try {
	        String result = rfiValidationService.sendRfiForValidation(rfiId);

	        if ("RFI sent for validation successfully.".equals(result)) {
	            return ResponseEntity.ok(result); 
	        } else {
	            return ResponseEntity.badRequest().body(result); 
	        }
	    } catch (DataIntegrityViolationException ex) {
	        return ResponseEntity.badRequest().body("This RFI is already sent for validation.");
	    } catch (Exception ex) {
	        return ResponseEntity.badRequest().body("Failed to send RFI for validation. Please try again.");
	    }
	}

    
	

	@GetMapping("/getRfiValidations")
	public ResponseEntity<List<GetRfiDTO>> showRfiIdsForValidations(HttpSession session) {
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");
		String userId = (String) session.getAttribute("userId");
		String department = (String) session.getAttribute("departmentFk");
		String userName = (String) session.getAttribute("userName");
		
		List<GetRfiDTO> list = rfiValidationService.showValidations(userRole, userType, userId, department, userName);

		if (list.isEmpty()) {
			return ResponseEntity.ok(Collections.emptyList()); 
		}

		return ResponseEntity.ok(list);
	}



	@GetMapping(value ="/getRfiReportDetail/{rfiId}",
			produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<RfiDetailsDTO> getRfiPreview(@PathVariable Long rfiId) {
		RfiDetailsDTO dto = rfiValidationService.getRfiPreview(rfiId);
	    if (dto.getReportDetails() == null) {
	        return ResponseEntity.noContent().build();
	    }
	    return ResponseEntity.ok(dto);
	}

    
    
	@GetMapping("/previewFiles")
	public ResponseEntity<Resource> serveFile(@RequestParam String filepath) throws IOException {
	    String decodedPath = URLDecoder.decode(filepath, StandardCharsets.UTF_8);
	    Path file = Paths.get(decodedPath.replace("\\", File.separator).replace("/", File.separator));
 
	    if (!Files.exists(file) || !Files.isReadable(file)) {
	        return ResponseEntity.notFound().build();
	    }
 
	    Resource resource = new UrlResource(file.toUri());
	    String contentType = Files.probeContentType(file);
	    if (contentType == null) {
	        contentType = "application/octet-stream";
	    }
 
	    return ResponseEntity.ok()
	        .contentType(MediaType.parseMediaType(contentType))
	        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName().toString() + "\"")
	        .body(resource);
	}


}