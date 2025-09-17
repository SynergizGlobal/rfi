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
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.service.InspectionService;
import com.metro.rfisystem.backend.service.RFIChecklistDescriptionService;
import com.metro.rfisystem.backend.service.RFIEnclosureService;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
	private final RFIChecklistDescriptionService checklistDescriptionService;
	private final RFIInspectionDetailsRepository inspectionRepository;

	@GetMapping("/inspection/{id}")
	public ResponseEntity<RfiInspectionDTO> getInspectionData(@PathVariable Long id) {
		return ResponseEntity.ok(inspectionService.getById(id));
	}
	

	@PostMapping(value = "/saveDraft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Long> saveDraftInspection(
	        HttpSession session,
	        @RequestPart("data") String dataJson,
	        @RequestPart(value = "selfie", required = false) MultipartFile selfie,
	        @RequestPart(value = "siteImages", required = false) List<MultipartFile> siteImages,
	        @RequestPart(value = "testReport", required = false) MultipartFile testDocument) {

	    String deptFk = (String) session.getAttribute("departmentFk");

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);

	        if (siteImages == null) {
	            siteImages = new ArrayList<>();
	        }

	        Long inspectionId = inspectionService.startInspection(dto, selfie, siteImages, testDocument, deptFk);

	        return ResponseEntity.ok(inspectionId);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
	    }
	}
	
	

	
	@PostMapping(value = "/finalSubmit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> finalSubmitInspection(
	        HttpSession session,
	        @RequestPart("data") String dataJson,
	        @RequestPart(value = "selfie", required = false) MultipartFile selfie,
	        @RequestPart(value = "siteImages", required = false) List<MultipartFile> siteImages,
	        @RequestPart(value = "testReport", required = false) MultipartFile testDocument) {

	    String deptFk = (String) session.getAttribute("departmentFk");

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);

	        if (siteImages == null) {
	            siteImages = new ArrayList<>();
	        }

	        InspectionSubmitResult result = inspectionService.finalizeInspection(dto, selfie, siteImages, testDocument, deptFk);

	        switch (result) {
	            case ENGINEER_SUCCESS:
	                return ResponseEntity.ok("Inspection Submitted.");
	            case CONTRACTOR_SUCCESS:
	                return ResponseEntity.ok("Inspection Submitted.");
	            default:
	                return ResponseEntity.ok("RFI Submission Failed..!");
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
	    }
	}


	@GetMapping("/inspections/{rfiId}")
	public ResponseEntity<?> getInspectionByRfiId(@PathVariable Long rfiId, HttpSession session) {
	    String deptFk = (String) session.getAttribute("departmentFk");
	    if (deptFk == null || deptFk.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body("Department not found in session");
	    }

	    try {
	        List<RFIInspectionRequestDTO> inspections = inspectionService.getInspectionsByRfiId(rfiId, deptFk);
	        return ResponseEntity.ok(inspections);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("Failed to fetch inspection: " + e.getMessage());
	    }
	}

	
	
//	@GetMapping("/inspections/{rfiId}")
//	public ResponseEntity<?> getInspectionByRfiId(@PathVariable Long rfiId) {
//	    try {
//	        List<RFIInspectionDetails> inspections = inspectionRepository.findInspectionsByRfiId(rfiId);
//
//	        if (inspections.isEmpty()) {
//	            return ResponseEntity.ok(Collections.emptyList());
//	        }
//	        return ResponseEntity.ok(inspections);
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//	                .body("Failed to fetch inspection: " + e.getMessage());
//	    }
//	}


	
	@GetMapping("/inspection/measurement-data/{rfiId}")
	public ResponseEntity<RFIInspectionDetails> getInspectionMeasurementData(@PathVariable Long rfiId) {
	    Optional<RFIInspectionDetails> inspectionOpt = inspectionRepository.findLatestByRfiId(rfiId);

	    if (inspectionOpt.isPresent()) {
	        return ResponseEntity.ok(inspectionOpt.get());
	    } else {
	        // Return empty object instead of 204 No Content
	        RFIInspectionDetails emptyInspection = new RFIInspectionDetails();
	        emptyInspection.setMeasurementType("");
	        emptyInspection.setLength(0.0);
	        emptyInspection.setBreadth(0.0);
	        emptyInspection.setHeight(0.0);
	        emptyInspection.setNoOfItems(0);
	        emptyInspection.setTotalQty(0.0);

	        return ResponseEntity.ok(emptyInspection);
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

	@PostMapping(value = "/saveChecklist", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> saveChecklist(HttpSession session, @RequestPart("data") String checklistJson) {
		String deptFk = (String) session.getAttribute("departmentFk");
		try {
			ObjectMapper mapper = new ObjectMapper();

			RFIInspectionChecklistDTO dto = mapper.readValue(checklistJson, RFIInspectionChecklistDTO.class);

			checklistService.saveChecklistWithFiles(dto, deptFk);
			return ResponseEntity.ok("Checklist saved successfully");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to save checklist: " + e.getMessage());
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
	        	 
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
	        } catch (Exception ex) {
	        	ex.printStackTrace(); 
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

	         .body(resource);}
	 
	 
		/*
		 * @GetMapping("/description") public List<ChecklistDTO>
		 * getAllChecklists(@RequestParam String enclosername) { return
		 * checklistDescriptionService.getChecklists(enclosername); }
		 */
	    
	    
//	    @GetMapping("/getChecklistDes")
//	     public ResponseEntity<List<String>> getChecklistDes(
//	            @RequestParam String rfiDesc,
//	            @RequestParam String enclosureName) {
//
//	        String descriptions = inspectionChecklistRepository.getChecklistDescriptin(rfiDesc, enclosureName);
//
//	        if (descriptions == null || descriptions.isEmpty()) {
//	            return ResponseEntity.noContent().build();
//	        }
//
//	        // Split by comma and keep inner spaces
//	        List<String> descriptionList = Arrays.stream(descriptions.split(","))
//	                                             .map(String::trim) 
//	                                             .collect(Collectors.toList());
//
//	        return ResponseEntity.ok(descriptionList);
//	    }
//	    

	 
	 @GetMapping("/open")
	    public List<String> getOpenEnclosers() {
	        return  checklistDescriptionService.getUniqueOpenEnclosers();
	    }
	 
	 @GetMapping("/checklistDescription")
	 public List<String> getChecklistDescription(@RequestParam(name = "enclosureName") String enclosureName){
		 return checklistDescriptionService.getChecklistDescription(enclosureName);
	 }
	 
	  
}
