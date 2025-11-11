package com.metro.rfisystem.backend.controller;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import com.metro.rfisystem.backend.constants.ESignStatus;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
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

import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.io.ByteArrayInputStream;
import org.springframework.web.reactive.result.view.RedirectView;
import org.springframework.web.servlet.ModelAndView;
import org.w3c.dom.NodeList;
import org.w3c.dom.Document;     
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import com.metro.rfisystem.backend.model.rfi.SignedXmlResponse;
import com.metro.rfisystem.backend.service.EsignService;
import com.metro.rfisystem.backend.service.EsignWebSocketService;
import com.metro.rfisystem.backend.service.FileStorageService;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.LocalDate;
import java.util.Base64;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://es-staging.cdac.in"})
public class InspectionController {

	private final InspectionService inspectionService;
	private final RFIEnclosureService rfiEnclosureService;
	private final RFIInspectionChecklistService checklistService;
	private final RFIChecklistDescriptionService checklistDescriptionService;
	private final RFIInspectionDetailsRepository inspectionRepository;
	private final RFIRepository rfiRepository;

	private final EsignWebSocketService esignWebSocketService;
	
	private final EsignService esignService;

	@Value("${rfi.pdf.storage-path}")
	private String pdfStoragePath;
	
	@Autowired
	private FileStorageService fileStorageService;

	
	@GetMapping("/rfi/inspection/{id}")
	public ResponseEntity<RfiInspectionDTO> getInspectionData(@PathVariable Long id) {
		return ResponseEntity.ok(inspectionService.getById(id));
	}
	

	@PostMapping(value = "/rfi/saveDraft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Long> saveDraftInspection(
	        HttpSession session,
	        @RequestPart("data") String dataJson,
	        @RequestPart(value = "selfie", required = false) MultipartFile selfie,
	        @RequestPart(value = "testReport", required = false) MultipartFile testDocument) {

	    String deptFk = (String) session.getAttribute("departmentFk");

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);



	        Long inspectionId = inspectionService.startInspection(dto, selfie, testDocument, deptFk);

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
	        @RequestPart(value = "testReport", required = false) MultipartFile testDocument) {

	    String deptFk = (String) session.getAttribute("departmentFk");

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        RFIInspectionRequestDTO dto = objectMapper.readValue(dataJson, RFIInspectionRequestDTO.class);

	        InspectionSubmitResult result = inspectionService.finalizeInspection(dto, selfie, testDocument, deptFk);

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
	
	
	
	@PostMapping(value = "/rfi/inspection/uploadSiteImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> uploadSiteImage(
	        @RequestPart("siteImage") MultipartFile siteImage,  // ✅ must have @RequestPart
	        @RequestParam("RfiId") Long rfiId,                // ✅ bind RFI ID
	        HttpSession session) {

	    // Get department from session
	    String deptFk = (String) session.getAttribute("departmentFk");

	    if (deptFk == null || deptFk.isEmpty()) {
	        return ResponseEntity.badRequest().body("❌ Department not found in session.");
	    }

	    try {
	        String message = inspectionService.UploadSiteImage(siteImage, rfiId, deptFk);
	        return ResponseEntity.ok(message);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("❌ Error uploading site image: " + e.getMessage());
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

	     String originalFilename = file.getFileName().toString();
	     String cleanFilename = originalFilename.contains("_")
	             ? originalFilename.substring(originalFilename.indexOf("_") + 1)
	             : originalFilename;

	     return ResponseEntity.ok()
	             .contentType(MediaType.parseMediaType(contentType))
	             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cleanFilename + "\"")
	             .body(resource);
	 }

	 

	 
	 @GetMapping("/rfi/open")
	    public List<String> getOpenEnclosers() {
	        return  checklistDescriptionService.getUniqueOpenEnclosers();
	    }
	 
	 @GetMapping("/rfi/checklistDescription")
	 public List<String> getChecklistDescription(@RequestParam(name = "enclosureName") String enclosureName){
		 return checklistDescriptionService.getChecklistDescription(enclosureName);
	 }
	 
	 
	 @Transactional
	 @PostMapping("/rfi/uploadPostTestReport")
	 public ResponseEntity<String> uploadPostTestReport(
	         @RequestParam("rfiId") Long rfiId,
	         @RequestParam("testType") String testType,
	         @RequestParam("file") MultipartFile file,
	         HttpSession session) {

	     try {
	         Optional<RFI> rfiOpt = rfiRepository.findById(rfiId);
	         if (rfiOpt.isEmpty()) {
	             return ResponseEntity.badRequest().body("RFI NOT FOUND!");
	         }

	         RFI rfi = rfiOpt.get();
	         String txnId = rfi.getTxn_id();
	         if (txnId == null) {
	             return ResponseEntity.badRequest().body("Txn Id not found! to Fetch Signed PDF!");
	         }

	         String department = (String) session.getAttribute("departmentFk");

	         String serverPdfPath = Paths.get(pdfStoragePath, "signed_engineer_" + txnId + "_final.pdf").toString();
	         File conEngSignedPdf = new File(serverPdfPath);
	         if (!conEngSignedPdf.exists()) {
	             return ResponseEntity.badRequest().body("Server PDF not found at: " + conEngSignedPdf.getAbsolutePath());
	         }

	         Optional<RFIInspectionDetails> latest = inspectionRepository.findTopByRfi_IdOrderByIdDesc(rfiId);
	         if (latest.isEmpty()) {
	             return ResponseEntity.status(HttpStatus.NOT_FOUND).body("RFI Inspection not found.");
	         }

	         RFIInspectionDetails inspection = latest.get();

	         Optional<RFIInspectionDetails> inspectionDetails =
	                 (department != null && department.equalsIgnoreCase("engg"))
	                         ? inspectionRepository.findByRfiIdAndUploadedBy(rfiId, "Engg")
	                         : inspectionRepository.findByRfiIdAndUploadedBy(rfiId, "Con");

	         if (inspectionDetails.isEmpty()) {
	             return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                     .body("No inspection details found for department: " + department);
	         }

	         RFIInspectionDetails inspDet = inspectionDetails.get();

	         if (inspection.getRfi().getStatus() != EnumRfiStatus.INSPECTION_DONE) {
	             return ResponseEntity.badRequest().body("RFI not closed yet. Upload only allowed after closure.");
	         }

	         LocalDate closedDate = inspection.getRfi().getClosedDate();
	         if (closedDate != null && closedDate.plusDays(15).isBefore(LocalDate.now())) {
	             return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                     .body("Upload time expired. Allowed only within 15 days of closure.");
	         }

	         String testResultFilePath = fileStorageService.saveFile(file);

	         File uploadedFile = new File(testResultFilePath);

	         if (!uploadedFile.exists()) {
	             return ResponseEntity.badRequest().body("Uploaded file not found after saving: " + uploadedFile.getAbsolutePath());
	         }

	         Path tempMerged = Files.createTempFile("merged_", ".pdf");
	         PDFMergerUtility merger = new PDFMergerUtility();
	         merger.addSource(conEngSignedPdf);
	         merger.addSource(uploadedFile);
	         merger.setDestinationFileName(tempMerged.toString());
	         merger.mergeDocuments(MemoryUsageSetting.setupMainMemoryOnly());


	         inspDet.setPostTestType(testType);
	         inspDet.setPostTestReportPath(testResultFilePath);
	         inspectionRepository.save(inspDet);
	         
	         Files.move(tempMerged, conEngSignedPdf.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);


	         return ResponseEntity.ok("Test Result Uploaded Successfully.");

	     } catch (Exception e) {
	         e.printStackTrace();
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                 .body("❌ Error merging PDFs: " + e.getMessage());
	     }
	 }

	 


	
	 
		@PostMapping(
			    value = "/rfi/getSignedXmlRequest",
			    consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
			    produces = MediaType.APPLICATION_JSON_VALUE
			)
			@CrossOrigin(origins = "https://syntrackpro.com")
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
			        boolean isSave = inspectionService.SaveTxnIdSetEStatusCon(txnId,rfiId,ESignStatus.CON_PENDING);
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
			@CrossOrigin(origins = "https://syntrackpro.com")
			public ResponseEntity<SignedXmlResponse> getEngSignedXmlRequest(
			        @RequestParam("sc") String sc,
			        @RequestParam("rfiId") Long rfiId,
			        @RequestParam("signerName") String signerName,
			        @RequestParam("engineerName") String engineerName,
			        @RequestParam("signY") int signY) {
 
			    try {
			        // Get last contractor txnId
			        String contractorTxnId = inspectionService.getLastTxnIdForRfi(rfiId);
 
			        if (contractorTxnId == null) {
			            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
			        }
 
			        // Check contractor eSign status
			        ESignStatus eStatus = inspectionService.getEsignStatusEngg(rfiId);
 
			        if (eStatus != ESignStatus.CON_SUCCESS) {
			            // Return a response with an error message instead of a plain string
			            SignedXmlResponse errorResponse = new SignedXmlResponse();
			            errorResponse.setError("Contractor not yet submitted");
			            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
			        }
 
 
			        // Load signed contractor PDF
			        Path signedPdfPath = Paths.get(pdfStoragePath, "signed_" + contractorTxnId + "_temp.pdf");
			        if (!Files.exists(signedPdfPath)) {
			            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
			        }
 
			        byte[] pdfData = Files.readAllBytes(signedPdfPath);
 
			        // Generate eSign XML request
			        SignedXmlResponse signedXmlResponse = esignService.getEngSignedXmlRequestFromDocument(
			            pdfData, sc, contractorTxnId, signerName, engineerName, signY
			        );
			        signedXmlResponse.setTxnId(contractorTxnId);
 
			        return ResponseEntity.ok(signedXmlResponse);
 
			    } catch (Exception e) {
			        e.printStackTrace();
			        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
			    }
			}

		
		
		
		@PostMapping("/rfi/signedResponse")
		public String signedResponse(
		        @RequestParam("espTxnID") String espTxnID,
		        @RequestParam("eSignResponse") String eSignResponse,
		        HttpSession session) {
		    try {
		        // 1️⃣ Extract signer name from eSign response
		        String signerName = extractSignerName(eSignResponse);

		        // 2️⃣ Apply digital signature to PDF
		        esignService.signWithDS(espTxnID, eSignResponse, signerName);
		        inspectionService.saveESignStatusCon(ESignStatus.CON_SUCCESS, espTxnID);


		        // 3️⃣ Mark success in session
		        session.setAttribute("eSignSuccess", true);

		        // 4️⃣ Update DB eSign status to SUCCESS

		        // 5️⃣ Redirect frontend with success message
		        String redirectUrl = "https://syntrackpro.com/rfiSystem/InspectionForm";
		        
		        esignWebSocketService.sendStatusUpdate(
		        	    espTxnID,
		        	    "SUCCESS",
		        	    "Contractor eSign completed successfully!"
		        	);

		        
		        return buildHtmlRedirect( "Contractor Digital signed successfully!", true);

		    } catch (Exception e) {
		        e.printStackTrace();

		        // Optional: Update DB eSign status to FAILED
		        try {
		            inspectionService.saveESignStatusCon(ESignStatus.CON_FAILED, espTxnID);
		            esignWebSocketService.sendStatusUpdate(
		            	    espTxnID,
		            	    "FAILED",
		            	    "Contractor eSign failed."
		            	);
		        } catch (Exception ex) {
		            ex.printStackTrace(); // Log but do not block
		        }

		        // Redirect frontend with failure message
		        String redirectUrl = "https://syntrackpro.com/rfiSystem/InspectionForm?txnId=" + espTxnID;
		        return buildHtmlRedirect( "Contractor eSign Failed!", false);
		    }
		}


		private String buildHtmlRedirect(String message, boolean success) {
		    String bgColor = success ? "#d4edda" : "#f8d7da";
		    String textColor = success ? "#155724" : "#721c24";

		    return "<!DOCTYPE html>\n" +
		           "<html>\n" +
		           "<head>\n" +
		           "<title>eSign Status</title>\n" +
		           "<script>\n" +
		           "  if (window.opener) {\n" +
		           "    window.opener.postMessage({ type: 'esignStatus', success: " + success + ", message: '" + message + "' }, '*');\n" +
		           "  }\n" +
		           "  setTimeout(() => window.close(), 3000);\n" +
		           "</script>\n" +
		           "<style>\n" +
		           "body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }\n" +
		           ".msg { background-color: " + bgColor + "; color: " + textColor + 
		           "; padding: 20px; border-radius: 5px; display: inline-block; }\n" +
		           "</style>\n" +
		           "</head>\n" +
		           "<body><div class='msg'>" + message + "</div></body></html>";
		}
		
		@PostMapping("/rfi/engineerSignedResponse")
		public String engineerSignedResponse(
		        @RequestParam("espTxnID") String espTxnID,
		        @RequestParam("eSignResponse") String eSignResponse,
		        HttpSession session) {

		    String message = "Engineer Digital signed successfully!";

		    try {
		        String signerName = extractSignerName(eSignResponse);
		        esignService.signWithDSEngineer(espTxnID, eSignResponse, signerName);

		        // Fetch Engineer RFI details if needed
		        RFI rfi = inspectionService.getRFIIdTxnId(espTxnID, "Engineer");
		        session.setAttribute("rfi", rfi);
		        inspectionService.saveESignStatusEngg(ESignStatus.ENGG_SUCCESS, espTxnID);
		        esignWebSocketService.sendStatusUpdate(
		        	    espTxnID,
		        	    "SUCCESS",
		        	    "Engineer eSign completed successfully!"
		        	);


		        // ✅ Success HTML with postMessage to parent
		        return buildHtmlRedirect(message, true);

		    } catch (Exception e) {
		        e.printStackTrace();
		        // Optional: save failure
		        try {
		        	esignWebSocketService.sendStatusUpdate(
		        		    espTxnID,
		        		    "FAILED",
		        		    "Engineer eSign failed!"
		        		);

		            inspectionService.saveESignStatusEngg(ESignStatus.ENGG_FAILED, espTxnID);
		        } catch (Exception ex) {
		            ex.printStackTrace();
		        }

		        return buildHtmlRedirectEngg("Engineer eSign Failed!", false);
		    }
		}

		// Reuse the same buildHtmlRedirect for both Contractor and Engineer
		private String buildHtmlRedirectEngg(String message, boolean success) {
		    String bgColor = success ? "#d4edda" : "#f8d7da";
		    String textColor = success ? "#155724" : "#721c24";

		    return "<!DOCTYPE html>\n" +
		           "<html>\n" +
		           "<head>\n" +
		           "<title>eSign Status</title>\n" +
		           "<script>\n" +
		           "  if (window.opener) {\n" +
		           "    window.opener.postMessage({ type: 'esignStatus', success: " + success + ", message: '" + message + "' }, '*');\n" +
		           "  }\n" +
		           "  setTimeout(() => window.close(), 3000);\n" +
		           "</script>\n" +
		           "<style>\n" +
		           "body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }\n" +
		           ".msg { background-color: " + bgColor + "; color: " + textColor + 
		           "; padding: 20px; border-radius: 5px; display: inline-block; }\n" +
		           "</style>\n" +
		           "</head>\n" +
		           "<body><div class='msg'>" + message + "</div></body></html>";
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