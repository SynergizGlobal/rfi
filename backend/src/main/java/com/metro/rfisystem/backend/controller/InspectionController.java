package com.metro.rfisystem.backend.controller;

import java.io.File;

import java.io.IOException;
import java.net.URLDecoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;


import java.io.ByteArrayInputStream;
import java.io.File;

import java.io.IOException;
import java.net.URLDecoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.result.view.RedirectView;
import org.springframework.web.servlet.ModelAndView;
import org.w3c.dom.NodeList;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.w3c.dom.Document;      // Correct for XML parsing
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.model.rfi.SignedXmlResponse;
import com.metro.rfisystem.backend.service.EsignService;
import com.metro.rfisystem.backend.service.InspectionService;
import com.metro.rfisystem.backend.service.RFIChecklistDescriptionService;
import com.metro.rfisystem.backend.service.RFIEnclosureService;
import com.metro.rfisystem.backend.service.RFIInspectionChecklistService;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://es-staging.cdac.in"})
public class InspectionController {

	private final InspectionService inspectionService;
	private final RFIEnclosureService rfiEnclosureService;
	private final RFIInspectionChecklistService checklistService;
	private final RFIChecklistDescriptionService checklistDescriptionService;
	private final RFIInspectionDetailsRepository inspectionRepository;

	private final EsignService esignService;

	@Value("${rfi.pdf.storage-path}")
	private String pdfStoragePath;

	
	@GetMapping("/rfi/inspection/{id}")
	public ResponseEntity<RfiInspectionDTO> getInspectionData(@PathVariable Long id) {
		return ResponseEntity.ok(inspectionService.getById(id));
	}
	

	@PostMapping(value = "/rfi/saveDraft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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
	
	

	
	@PostMapping(value = "/rfi/finalSubmit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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


	@GetMapping("/rfi/inspections/{rfiId}")
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


	
	@GetMapping("/rfi/inspection/measurement-data/{rfiId}")
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

	
	
	@PostMapping("/rfi/upload")
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

	@GetMapping("/rfi/autofill/{rfiId}")
	public ResponseEntity<RFIInspectionAutofillDTO> getAutofillDetails(@PathVariable Long rfiId) {
		RFIInspectionAutofillDTO dto = rfiEnclosureService.getAutofillData(rfiId);
		return ResponseEntity.ok(dto);
	}

	@PostMapping(value = "/rfi/saveChecklist", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

	
	
	@GetMapping("/rfi/downloadSiteImagesPdf")
	public ResponseEntity<byte[]> downloadSiteImagesPdf(@RequestParam Long id, @RequestParam String uploadedBy)
			throws IOException, DocumentException {

		return inspectionService.generateSiteImagesPdf(id, uploadedBy);
	}
	
	 @GetMapping("/rfi/getChecklist")
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
	 
	 @GetMapping("/rfi/DownloadPrev")

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

	 
	 @GetMapping("/rfi/open")
	    public List<String> getOpenEnclosers() {
	        return  checklistDescriptionService.getUniqueOpenEnclosers();
	    }
	 
	 @GetMapping("/rfi/checklistDescription")
	 public List<String> getChecklistDescription(@RequestParam(name = "enclosureName") String enclosureName){
		 return checklistDescriptionService.getChecklistDescription(enclosureName);
	 }
	
	 
		@PostMapping(
			    value = "/rfi/getSignedXmlRequest",
			    consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
			    produces = MediaType.APPLICATION_JSON_VALUE
			)
			@CrossOrigin(origins = "https://localhost:3000")
			public ResponseEntity<SignedXmlResponse> getSignedXmlRequest(
			        @RequestPart("pdfBlob") MultipartFile pdfBlob,
			        @RequestParam("sc") String sc,
			        @RequestParam("txnId") String txnId,
			        @RequestParam("rfiId") Long rfiId,
			        @RequestParam("signerName") String signerName,
			        @RequestParam("contractorName") String companyName,
			        @RequestParam("signY") int signY) {
	 
			    System.out.println("Controller hit! RFI ID: " + sc + ", TXN ID: " + txnId);
	 
			    try {
			        byte[] pdfData = pdfBlob.getBytes();
			        boolean isSave = inspectionService.SaveTxnId(txnId,rfiId);
	 
			        SignedXmlResponse signedXmlResponse = esignService.getSignedXmlRequestFromDocument(
			            pdfData, sc, txnId, signerName, companyName, signY
			        );
	 
			        return ResponseEntity.ok(signedXmlResponse);
	 
			    } catch (Exception e) {
			        e.printStackTrace(); // log exception
			        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			    }
			}
		
		
		@PostMapping(
			    value = "/rfi/getEngSignedXmlRequest",
			    consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
			    produces = MediaType.APPLICATION_JSON_VALUE
			)
			@CrossOrigin(origins = "https://localhost:3000")
			public ResponseEntity<SignedXmlResponse> getEngSignedXmlRequest(
			        @RequestParam("sc") String sc,
			        @RequestParam("rfiId") Long rfiId,
			        @RequestParam("signerName") String signerName,
			        @RequestParam("engineerName") String companyName,
			        @RequestParam("signY") int signY) {
	 
	 
			    try {
			        String contractorTxnId = inspectionService.getLastTxnIdForRfi(rfiId);
			        
				    System.out.println("Engineer hit! Txn ID: " + sc + ", TXN ID: " + contractorTxnId);
			        
			        
			        Path signedPdfPath = Paths.get(pdfStoragePath, "signed_" + contractorTxnId + ".pdf");
			        if (!Files.exists(signedPdfPath)) {
			            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
			        }
	 
			        byte[] pdfData = Files.readAllBytes(signedPdfPath);		
			        
	 
			        SignedXmlResponse signedXmlResponse = esignService.getEngSignedXmlRequestFromDocument(
			            pdfData, sc, contractorTxnId, signerName, companyName, signY
			        );
			        signedXmlResponse.setTxnId(contractorTxnId);
			        return ResponseEntity.ok(signedXmlResponse);
	 
			    } catch (Exception e) {
			        e.printStackTrace();
			        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			    }
			}
		@PostMapping("/rfi/signedResponse")
		public String signedResponse(@RequestParam("espTxnID") String espTxnID,
		                             @RequestParam("eSignResponse") String eSignResponse,
		                             HttpSession session) {
		    try {
		        String signerName = extractSignerName(eSignResponse);
		        esignService.signWithDS(espTxnID, eSignResponse, signerName);

		        // Mark eSign success in session
		        session.setAttribute("eSignSuccess", true);

		        // Redirect to front-end with txnId
		        String redirectUrl = "https://localhost:3000/rfiSystem/Inspection?txnId=" + espTxnID;
		        return buildHtmlRedirect(redirectUrl, "Contractor Digital signed successfully!", true);
		    } catch (Exception e) {
		        e.printStackTrace();
		        return buildHtmlRedirect("https://localhost:3000/rfiSystem/Inspection?txnId=" + espTxnID,
		                                 "Contractor eSign Failed!", false);
		    }
		}

		private String buildHtmlRedirect(String redirectUrl, String message, boolean success) {
		    String bgColor = success ? "#d4edda" : "#f8d7da";
		    String textColor = success ? "#155724" : "#721c24";

		    return "<!DOCTYPE html>\n" +
		           "<html>\n" +
		           "<head>\n" +
		           "<title>eSign Status</title>\n" +
		           "<meta http-equiv='refresh' content='3; URL=" + redirectUrl + "' />\n" +
		           "<style>body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }\n" +
		           ".msg { background-color: " + bgColor + "; color: " + textColor +
		           "; padding: 20px; border-radius: 5px; display: inline-block; }</style>\n" +
		           "</head>\n" +
		           "<body><div class='msg'>" + message + "</div></body></html>";
		}

		
		@PostMapping("/rfi/engineerSignedResponse")
		public String engineerSignedResponse(
		        @RequestParam("espTxnID") String espTxnID,
		        @RequestParam("eSignResponse") String eSignResponse,
		        HttpSession session) {
			
		    String redirectUrl = "https://localhost:3000/rfiSystem/Inspection?txnId=" + espTxnID;
		    String message = "Engineer Digital signed successfully!";		
	 
		    try {
		    	String signerName = extractSignerName(eSignResponse);
		        esignService.signWithDSEngineer(espTxnID, eSignResponse,signerName);
	 
		        // Fetch Engineer RFI details if needed
		        RFIInspectionDetails rfi = inspectionService.getRFIIdTxnId(espTxnID, "Engineer");
		        session.setAttribute("rfi", rfi);
	 
		        return "<!DOCTYPE html>\n" +
	            "<html>\n" +
	            "<head>\n" +
	            "<title>eSign Completed</title>\n" +
	            "<meta http-equiv='refresh' content='3; URL=" + redirectUrl + "' />\n" +  // 3 sec delay
	            "<style>\n" +
	            "body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }\n" +
	            ".msg { background-color: #d4edda; color: #155724; padding: 20px; border-radius: 5px; display: inline-block; }\n" +
	            "</style>\n" +
	            "</head>\n" +
	            "<body>\n" +
	            "<div class='msg'>" + message + "</div>\n" +
	            "</body>\n" +
	            "</html>";
		    } catch (Exception e) {
		        e.printStackTrace();
		        return "<!DOCTYPE html>\n" +
	            "<html>\n" +
	            "<head>\n" +
	            "<title>eSign Failed</title>\n" +
	            "<meta http-equiv='refresh' content='3; URL=" + redirectUrl + "' />\n" +
	            "<style>\n" +
	            "body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }\n" +
	            ".msg { background-color: #f8d7da; color: #721c24; padding: 20px; border-radius: 5px; display: inline-block; }\n" +
	            "</style>\n" +
	            "</head>\n" +
	            "<body>\n" +
	            "<div class='msg'>" + message + "</div>\n" +
	            "</body>\n" +
	            "</html>";
		    }
		}
		
		
		public String extractSignerName(String eSignResponse) throws Exception {
		    // Parse the eSignResponse XML
		    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		    factory.setNamespaceAware(true); // in case XML has namespaces
		    DocumentBuilder builder = factory.newDocumentBuilder();
		    Document doc = builder.parse(new ByteArrayInputStream(eSignResponse.getBytes("UTF-8")));
	 
		    // Get the UserX509Certificate nodes
		    NodeList certNodes = doc.getElementsByTagName("UserX509Certificate");
		    if (certNodes.getLength() > 0) {
		        String base64Cert = certNodes.item(0).getTextContent().replaceAll("\\s+", "");
		        byte[] certBytes = Base64.getDecoder().decode(base64Cert);
	 
		        // Generate X509 certificate
		        CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
		        X509Certificate cert = (X509Certificate) certFactory.generateCertificate(
		                new ByteArrayInputStream(certBytes));
	 
		        // Extract CN (Common Name) from Subject DN
		        String dn = cert.getSubjectX500Principal().getName();
		        for (String part : dn.split(",")) {
		            part = part.trim();
		            if (part.startsWith("CN=")) {
		                return part.substring(3); // Return the CN value
		            }
		        }
		    }
		    return null; // Return null if no certificate or CN found
		}
	 
		@GetMapping("/rfi/getPdf")
		public ResponseEntity<byte[]> getPdf(@RequestParam("rfiId") String rfiId) {
		    try {
		        String pdfPath = pdfStoragePath+ rfiId + ".pdf";
		        File pdfFile = new File(pdfPath);
	 
		        if (!pdfFile.exists()) {
		            return ResponseEntity.notFound().build();
		        }
	 
		        byte[] pdfBytes = Files.readAllBytes(pdfFile.toPath());
	 
		        return ResponseEntity.ok()
		                .contentType(MediaType.APPLICATION_PDF)
		                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + rfiId + ".pdf")
		                .body(pdfBytes);
	 
		    } catch (IOException e) {
		        e.printStackTrace();
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		    }
		}
	 
	  
}