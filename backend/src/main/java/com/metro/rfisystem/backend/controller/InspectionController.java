package com.metro.rfisystem.backend.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.metro.rfisystem.backend.dto.ConfirmationRequestDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.service.InspectionService;
import com.metro.rfisystem.backend.service.RFIEnclosureService;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rfi")
public class InspectionController {

	private final InspectionService inspectionService;
	private final RFIEnclosureService rfiEnclosureService;
	private final RFIInspectionChecklistService checklistService;

	@GetMapping("/inspection/{id}")
	public ResponseEntity<RfiInspectionDTO> getInspectionData(@PathVariable Long id) {
		return ResponseEntity.ok(inspectionService.getById(id));
	}

	@PostMapping(value = "/start", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> startInspection(@RequestPart("data") String dataJson,
			@RequestPart("selfie") MultipartFile selfie, @RequestPart("siteImages") MultipartFile[] siteImages) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);

			inspectionService.startInspection(dto, selfie, siteImages);

			return ResponseEntity.ok("Inspection started successfully.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input");
		}
	}

	@PostMapping("/upload")
	public ResponseEntity<String> uploadEnclosure(

			@RequestParam("rfiId") Long rfiId, @RequestParam("file") MultipartFile file) {

		try {
			String savedFileName = rfiEnclosureService.uploadEnclosureFile(rfiId, file);
			return ResponseEntity.ok("Uploaded successfully as: " + savedFileName);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
		}
	}

	@GetMapping("/autofill/{rfiId}")
	public ResponseEntity<RFIInspectionAutofillDTO> getAutofillDetails(@PathVariable Long rfiId) {
		RFIInspectionAutofillDTO dto = rfiEnclosureService.getAutofillData(rfiId);
		return ResponseEntity.ok(dto);
	}

	@PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> saveChecklist(
	    @RequestPart("data") String checklistJson,
	    @RequestPart(value = "contractorSignature", required = false) MultipartFile contractorSignature,
	    @RequestPart(value = "clientSignature", required = false) MultipartFile clientSignature
	) {
	    try {
	        ObjectMapper mapper = new ObjectMapper();

	        
	        RFIInspectionChecklistDTO dto = mapper.readValue(checklistJson, RFIInspectionChecklistDTO.class);

	        checklistService.saveChecklistWithFiles(dto, contractorSignature, clientSignature);
	        return ResponseEntity.ok("Checklist saved successfully");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body("Failed to save checklist: " + e.getMessage());
	    }
	}
	
	@PutMapping(value = "/checklist/{checklistId}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
      public ResponseEntity<String> updateChecklist(
        @PathVariable Long checklistId,
        @RequestPart("data")  String checklistJson,
        @RequestPart(value = "contractorSignature", required = false)
        MultipartFile contractorSignature,
        @RequestPart(value = "clientSignature",    required = false)
        MultipartFile clientSignature) {

    try {
        RFIInspectionChecklistDTO dto =
                new ObjectMapper().readValue(checklistJson,
                                             RFIInspectionChecklistDTO.class);

        // Be sure the DTO carries the FK (rfiId) that already exists.
        checklistService.updateChecklistWithFiles(
                checklistId, dto, contractorSignature, clientSignature);

        return ResponseEntity.ok("Checklist updated successfully");
    } catch (Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update checklist: " + ex.getMessage());
    }
}
	
	 
	  @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	  public ResponseEntity<String> confirmInspectionDetails(
	          @RequestPart("data") String jsonData,
	          @RequestPart(value = "uploadDocuments", required = false) List<MultipartFile> files
	  ) throws JsonProcessingException {

	      ObjectMapper mapper = new ObjectMapper();
	      ConfirmationRequestDTO  request =
	              mapper.readValue(jsonData,  ConfirmationRequestDTO .class);

	      rfiEnclosureService.processConfirmation(request.getInspectionStatus(), request.getTestsInSiteLab(), files);
	      return ResponseEntity.ok("Confirmation saved successfully");
	  }



	}

