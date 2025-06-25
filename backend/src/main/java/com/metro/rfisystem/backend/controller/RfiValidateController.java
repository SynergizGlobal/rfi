package com.metro.rfisystem.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;
import com.metro.rfisystem.backend.service.RfiValidationService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RfiValidateController {

	private final RfiValidationService rfiValidationService;
	
	@PutMapping("/rfi/{id}/send-for-validation")
	public ResponseEntity<String> sendForValidation(@PathVariable Long id) {
		boolean success = rfiValidationService.sendRfiForValidation(id);
		if (success) {
			return ResponseEntity.ok("RFI sent for validation");
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("RFI not found or not eligible");
		}
	}

	
	
	@PostMapping(value = "/validate", consumes = {"multipart/form-data"})
	public ResponseEntity<String> validateRfis(@ModelAttribute RfiValidateDTO dto) {
	    rfiValidationService.validateRfiWithFile(dto);
	    return ResponseEntity.ok("RFI validated with file uploaded.");
	}
	
	@GetMapping("/getRfiValidations")
	public ResponseEntity<List<GetRfiDTO>> showRfiIdsForValidations() {
		List<GetRfiDTO> list = rfiValidationService.showRfiValidations();

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}

	
//	@GetMapping("/rfiDownload/{id}")
//    public void downloadRfiReport(@PathVariable long id, HttpServletResponse response) {
//        response.setContentType("application/pdf");
//        response.setHeader("Content-Disposition", "attachment; filename=RFI_Report_" + id + ".pdf");
//
//       try (OutputStream out = response.getOutputStream()) {
//        	rfiValidationService.generateRfiPdf(id, out);
//        } catch (Exception e) {
//            throw new RuntimeException("Error generating PDF", e);
//        }
//    }
	
	
	@GetMapping("/getRfiReportDetails/{id}")
	public ResponseEntity<List<RfiReportDTO>> getRfiReportDetails(@PathVariable long id) {
		List<RfiReportDTO> list = rfiValidationService.getRfiReportDetails(id);

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}

}
