package com.metro.rfisystem.backend.controller;

import java.io.File;

import java.io.IOException;
import java.net.URLDecoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.service.InspectionService;
import com.metro.rfisystem.backend.service.RFIEnclosureService;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
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
	public ResponseEntity<Long> startInspection(HttpSession session, @RequestPart("data") String dataJson,
			@RequestPart("selfie") MultipartFile selfie, @RequestPart("siteImages") MultipartFile[] siteImages) {
		String UserRole = (String) session.getAttribute("userRoleNameFk");

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);

			Long inspectionId = inspectionService.startInspection(dto, selfie, siteImages, UserRole);

			return ResponseEntity.ok(inspectionId);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);

		}
	}

	@PostMapping("/upload")
	public ResponseEntity<String> uploadEnclosure(@RequestParam("rfiId") Long rfiId,

			@RequestParam("enclosureName") String enclosureName, @RequestParam("file") MultipartFile file) {

		try {
			String savedFileName = rfiEnclosureService.uploadEnclosureFile(rfiId, enclosureName, file);
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
	public ResponseEntity<String> saveChecklist(HttpSession session, @RequestPart("data") String checklistJson,
			@RequestPart(value = "contractorSignature", required = false) MultipartFile contractorSignature,
			@RequestPart(value = "clientSignature", required = false) MultipartFile clientSignature) {
		String UserRole = (String) session.getAttribute("userRoleNameFk");
		try {
			ObjectMapper mapper = new ObjectMapper();

			RFIInspectionChecklistDTO dto = mapper.readValue(checklistJson, RFIInspectionChecklistDTO.class);

			checklistService.saveChecklistWithFiles(dto, contractorSignature, clientSignature, UserRole);
			return ResponseEntity.ok("Checklist saved successfully");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to save checklist: " + e.getMessage());
		}
	}



	@PostMapping(value = "/inspection/status", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> updateInspectionStatus(HttpSession session,@RequestPart("data") String dataJson,
			@RequestPart(value = "testReport", required = false) MultipartFile testDocument) {
	
		String userRole = (String) session.getAttribute("userRoleNameFk");
		
		try {
			ObjectMapper mapper = new ObjectMapper();
			RFIInspectionRequestDTO dto = mapper.readValue(dataJson, RFIInspectionRequestDTO.class);
			inspectionService.updateInspectionStatus(dto, testDocument, userRole);
			return ResponseEntity.ok("Inspection status updated successfully");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to update inspection status: " + e.getMessage());
		}
	}

	@GetMapping("/downloadSiteImagesPdf")
	public ResponseEntity<byte[]> downloadSiteImagesPdf(@RequestParam Long id, @RequestParam String uploadedBy)
			throws IOException, DocumentException {

		return inspectionService.generateSiteImagesPdf(id, uploadedBy);
	}
	
	 @GetMapping("/getChecklist")
	    public ResponseEntity<RFIInspectionChecklistDTO> getChecklist(
	            @RequestParam("rfiId") Long rfiId,
	            @RequestParam("enclosureName") String enclosureName) {
       
	        try {
	        	RFIInspectionChecklistDTO dto = checklistService.getChecklist(rfiId, enclosureName);
	        	
	            return ResponseEntity.ok(dto);
	        } catch (EntityNotFoundException ex) {
	        	 System.err.println("Entity not found: " + ex.getMessage());
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
	        } catch (Exception ex) {
	        	ex.printStackTrace(); //
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	        }
	    }
	 
	 @GetMapping("/DownloadPrev")

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

	         .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName().toString() + "\"") // <-- FORCE DOWNLOAD

	         .body(resource);

	 }

	  
}
