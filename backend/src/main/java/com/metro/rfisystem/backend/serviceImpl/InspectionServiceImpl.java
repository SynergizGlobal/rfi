package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.metro.rfisystem.backend.constants.ESignStatus;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus;
import com.metro.rfisystem.backend.dto.InspectionStatus;
import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.rfi.Measurements;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;
import com.metro.rfisystem.backend.repository.rfi.MeasurementsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.InspectionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.util.Objects;
import java.util.Optional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.InspectionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InspectionServiceImpl implements InspectionService {
	
	private final JdbcTemplate jdbcTemplate;


	private final RFIRepository rfiRepository;
	private final RFIInspectionDetailsRepository inspectionRepository;
	private final MeasurementsRepository measurementsRepository;

	@Value("${rfi.inspection.images.upload-dir}")
	private String uploadDir;
	
	

	@Override
	public RfiInspectionDTO getById(Long id) {
		RFI rfi = rfiRepository.findById(id).orElseThrow(() -> new RuntimeException("RFI not found with ID: " + id));

		RfiInspectionDTO dto = new RfiInspectionDTO();
		dto.setId(rfi.getId());
		dto.setRfiId(rfi.getRfi_Id());
		dto.setWork(rfi.getWork());
		dto.setContract(rfi.getContract());
		dto.setContractor(rfi.getAssignedPersonContractor());
		dto.setActivity(rfi.getActivity());
		dto.setDescription(rfi.getDescription());
		dto.setLocation(rfi.getLocation());
		dto.setDataOfInspection(rfi.getDateOfInspection());
		dto.setTimeOfInspection(rfi.getTimeOfInspection());
		dto.setNameOfContractorReprsentative(rfi.getNameOfRepresentative());
		return dto;

	}




	@Override
	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie,
			MultipartFile testDocument, String deptFk) {
		
	    String deptFkPar = deptFk.equalsIgnoreCase("Engg") ? "Engg" : "CON";

	    RFI rfi = rfiRepository.findById(dto.getRfiId())
	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

	    if (dto.getNameOfRepresentative() != null 
	            && !dto.getNameOfRepresentative().equals(rfi.getNameOfRepresentative())) {
	        rfi.setNameOfRepresentative(dto.getNameOfRepresentative());
	    }

	    Optional<RFIInspectionDetails> existingInspectionOpt =
	            inspectionRepository.findByRfiAndUploadedBy(rfi, deptFkPar);

	    RFIInspectionDetails inspection = existingInspectionOpt.orElse(new RFIInspectionDetails());
	    
	    Optional<Measurements> existingMeasurementsOpt = measurementsRepository.findByRfiId(dto.getRfiId());
	    
	    Measurements measurements = existingMeasurementsOpt.orElse(new Measurements());
	    
	    
	    inspection.setRfi(rfi);
		if ("Engg".equalsIgnoreCase(deptFk)) {
			inspection.setUploadedBy("Engg");
			rfi.setStatus(EnumRfiStatus.AE_INSP_ONGOING);
		} else {
			inspection.setUploadedBy("CON");
			rfi.setStatus(EnumRfiStatus.CON_INSP_ONGOING);
		}
	    if (dto.getInspectionStatus() != null) {
	        inspection.setInspectionStatus(dto.getInspectionStatus());
	    }

	    if (selfie != null && !selfie.isEmpty()) {
	        inspection.setSelfiePath(saveFile(selfie));
	    }

	    if (testDocument != null && !testDocument.isEmpty()) {
	        inspection.setTestSiteDocuments(saveFile(testDocument));
	    }

	    if (dto.getLocation() != null) inspection.setLocation(dto.getLocation());
	    if (dto.getChainage() != null) inspection.setChainage(dto.getChainage());

	    if (inspection.getId() == null) {
	        inspection.setDateOfInspection(LocalDate.now());
	        inspection.setTimeOfInspection(LocalTime.now());
	    }

	    if (dto.getMeasurementType() != null) measurements.setMeasurementType(dto.getMeasurementType());
	    if (dto.getLength() != null) measurements.setLength(dto.getLength());
	    if (dto.getBreadth() != null) measurements.setBreadth(dto.getBreadth());
	    if (dto.getHeight() != null) measurements.setHeight(dto.getHeight());
	    if (dto.getNoOfItems() != null) measurements.setNoOfItems(dto.getNoOfItems());
	    if (dto.getTotalQty() != null) measurements.setTotalQty(dto.getTotalQty());
	    if (dto.getRfiId() != null) measurements.setRfi(rfi);
	    if (dto.getInspectionStatus() != null) inspection.setInspectionStatus(dto.getInspectionStatus());
	    if (dto.getTestInsiteLab() != null) inspection.setTestInsiteLab(dto.getTestInsiteLab());
	    if (dto.getEngineerRemarks() != null) inspection.setEngineerRemarks(dto.getEngineerRemarks());

	    inspection.setWorkStatus(InspectionWorkFlowStatus.draft);

        rfiRepository.save(rfi);
	    inspectionRepository.save(inspection);
	    measurementsRepository.save(measurements);
	    return inspection.getId();
	}
	
	
	@Transactional
	public InspectionSubmitResult finalizeInspection(RFIInspectionRequestDTO dto,
	                                                 MultipartFile selfie,
	                                                 MultipartFile testDocument,
	                                                 String deptFk) {

	    RFI rfi = rfiRepository.findById(dto.getRfiId())
	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

	    RFIInspectionDetails inspection;
	    
	    String deptFkPar = deptFk.equalsIgnoreCase("Engg") ? "Engg" : "CON";

	    if (dto.getInspectionId() == null) {
	        inspection = inspectionRepository.findByRfiAndUploadedBy(rfi, deptFkPar)
	                .orElse(new RFIInspectionDetails());
	        inspection.setRfi(rfi);
	    } else {
	        inspection = inspectionRepository.findById(dto.getInspectionId())
	                .orElseThrow(() -> new RuntimeException("Inspection not found with ID: " + dto.getInspectionId()));
	    }
	    
	    Optional<Measurements> existingMeasurementsOpt = measurementsRepository.findByRfiId(dto.getRfiId());
	    
	    Measurements measurements = existingMeasurementsOpt.orElse(new Measurements());

		if ("Engg".equalsIgnoreCase(deptFk)) {
			inspection.setUploadedBy("Engg");
		} else {
			inspection.setUploadedBy("CON");
		}	    inspection.setDateOfInspection(LocalDate.now());
	    inspection.setTimeOfInspection(LocalTime.now());

	    if (dto.getLocation() != null) inspection.setLocation(dto.getLocation());
	    if (dto.getChainage() != null) inspection.setChainage(dto.getChainage());
	    if (dto.getMeasurementType() != null) measurements.setMeasurementType(dto.getMeasurementType());
	    if (dto.getLength() != null) measurements.setLength(dto.getLength());
	    if (dto.getBreadth() != null) measurements.setBreadth(dto.getBreadth());
	    if (dto.getHeight() != null) measurements.setHeight(dto.getHeight());
	    if (dto.getNoOfItems() != null) measurements.setNoOfItems(dto.getNoOfItems());
	    if (dto.getTotalQty() != null) measurements.setTotalQty(dto.getTotalQty());
	    if (dto.getRfiId() != null) measurements.setRfi(rfi);
	    if (dto.getInspectionStatus() != null) inspection.setInspectionStatus(dto.getInspectionStatus());
	    if (dto.getTestInsiteLab() != null) inspection.setTestInsiteLab(dto.getTestInsiteLab());
	    if (dto.getEngineerRemarks() != null) inspection.setEngineerRemarks(dto.getEngineerRemarks());

	    if (selfie != null && !selfie.isEmpty()) {
	        inspection.setSelfiePath(saveFile(selfie));
	    }
	    if (testDocument != null && !testDocument.isEmpty()) {
	        inspection.setTestSiteDocuments(saveFile(testDocument));
	    }

	    inspection.setWorkStatus(InspectionWorkFlowStatus.SUBMITTED);

	   		if ("Engg".equalsIgnoreCase(deptFk)) {
			if (dto.getTestInsiteLab() != null && dto.getTestInsiteLab().toString().equalsIgnoreCase("Rejected")) {
				rfi.setStatus(EnumRfiStatus.INSPECTION_DONE);
			} else
				rfi.setStatus(EnumRfiStatus.INSPECTED_BY_AE);
		} else {
			rfi.setStatus(EnumRfiStatus.INSPECTED_BY_CON);
		}

	    inspectionRepository.save(inspection);
	    measurementsRepository.save(measurements);
	    rfiRepository.save(rfi);

	    return "Engg".equalsIgnoreCase(deptFk)
	            ? InspectionSubmitResult.ENGINEER_SUCCESS
	            : InspectionSubmitResult.CONTRACTOR_SUCCESS;
	}
	
	
	@Override
	public String UploadSiteImage(MultipartFile siteImage, Long rfiId, String deptFk) {

	    if (siteImage == null || siteImage.isEmpty()) {
	        throw new RuntimeException("No site image provided for upload.");
	    }

	    String deptFkPar = "Engg".equalsIgnoreCase(deptFk) ? "Engg" : "CON";

	    RFI rfi = rfiRepository.findById(rfiId)
	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + rfiId));
	    
	    if((EnumRfiStatus.INSPECTION_DONE).equals(rfi.getStatus())) {
	    	return "Upload Failed, Inspection Closed!";
	    }
	    
	    if((EnumRfiStatus.VALIDATION_PENDING).equals(rfi.getStatus())) {
	    	return "Upload Failed, Inspection under validation process!";
	    }

	    if ("Engg".equals(deptFkPar)) {
	        if (rfi.getStatus() == EnumRfiStatus.INSPECTED_BY_AE
	                || rfi.getStatus() == EnumRfiStatus.INSPECTION_DONE) {
	            return "Upload Failed, Inspection Already Submitted!";
	        }
	    } else {
	        if (rfi.getStatus() == EnumRfiStatus.INSPECTED_BY_CON
	                || rfi.getStatus() == EnumRfiStatus.INSPECTION_DONE) {
	            return "Upload Failed, Inspection Already Submitted!";
	        }
	    }

	    RFIInspectionDetails inspection = inspectionRepository
	            .findByRfiIdAndUploadedBy(rfiId, deptFkPar)
	            .orElseGet(() -> {
	                RFIInspectionDetails newInspection = new RFIInspectionDetails();
	                newInspection.setRfi(rfi);
	                newInspection.setUploadedBy(deptFkPar);
	                return newInspection;
	            });
	    String newFilePath = saveFile(siteImage);
	    
	    
	    inspection.setWorkStatus(InspectionWorkFlowStatus.draft);
	    if (inspection.getSiteImage() != null && !inspection.getSiteImage().isEmpty()) {
	    	inspection.setSiteImage(inspection.getSiteImage() + "," + newFilePath);
	    }
	    else
	    {
	    	inspection.setSiteImage(newFilePath);
	    }

	    if ("Engg".equals(deptFkPar) && rfi.getStatus() != EnumRfiStatus.AE_INSP_ONGOING) {
	        rfi.setStatus(EnumRfiStatus.AE_INSP_ONGOING);
	    } else if ("CON".equals(deptFkPar) && rfi.getStatus() != EnumRfiStatus.CON_INSP_ONGOING) {
	        rfi.setStatus(EnumRfiStatus.CON_INSP_ONGOING);
	    }

	    inspectionRepository.save(inspection);
	    rfiRepository.save(rfi);

	    return "✅ Site image uploaded successfully for RFI ID " + rfiId + ".";
	}
	
	
	
	

	@Override
	public List<RFIInspectionRequestDTO> getInspectionsByRfiId(Long rfiId, String deptFk) {
	    List<RFIInspectionDetails> inspections = inspectionRepository.findAllByRfiId(rfiId);

	    if (inspections.isEmpty()) {
	        return Collections.emptyList();
	    }

	    List<RFIInspectionDetails> contractorRows = inspections.stream()
	            .filter(ins -> !"Engg".equalsIgnoreCase(ins.getUploadedBy()))
	            .toList();

	    List<RFIInspectionDetails> engineerRows = inspections.stream()
	            .filter(ins -> "Engg".equalsIgnoreCase(ins.getUploadedBy()))
	            .toList();

	    List<RFIInspectionRequestDTO> result = new ArrayList<>();

	    contractorRows.forEach(c -> {
	        RFIInspectionRequestDTO dto = convertToFullDTO(c);

	        engineerRows.forEach(e -> {
	            if (e.getEngineerRemarks() != null) {
	                if (dto.getEngineerRemarks() == null) dto.setEngineerRemarks(e.getEngineerRemarks());
	                else dto.setEngineerRemarks(dto.getEngineerRemarks() + " | " + e.getEngineerRemarks());
	            }
	            if (e.getTestInsiteLab() != null && dto.getTestInsiteLab() == null) {
	                dto.setTestInsiteLab(e.getTestInsiteLab());
	            }
	            if (!dto.getUploadedBy().contains("Engg")) {
	                dto.setUploadedBy(dto.getUploadedBy() + ", Engg");
	            }
	        });

	        result.add(dto);
	    });

	    if (contractorRows.isEmpty()) {
	        engineerRows.forEach(e -> result.add(convertToFullDTO(e)));
	    }

	    return result;
	}

	private RFIInspectionRequestDTO convertToFullDTO(RFIInspectionDetails inspection) {
	    RFIInspectionRequestDTO dto = new RFIInspectionRequestDTO();
	    dto.setRfiId(inspection.getRfi().getId());
	    dto.setInspectionId(inspection.getId());
	    dto.setLocation(inspection.getLocation());
	    dto.setChainage(inspection.getChainage());

	    dto.setInspectionStatus(inspection.getInspectionStatus() != null
	            ? inspection.getInspectionStatus()
	            : null);

	    dto.setUploadedBy(inspection.getUploadedBy());
	    dto.setEngineerRemarks(inspection.getEngineerRemarks());
	    dto.setTestInsiteLab(inspection.getTestInsiteLab());

	    // Fetch measurements if available
	    measurementsRepository.findByRfiId(inspection.getRfi().getId())
	            .ifPresent(m -> {
	                MeasurementDTO mDto = new MeasurementDTO(
	                        m.getMeasurementType(),
	                        m.getLength(),
	                        m.getBreadth(),
	                        m.getHeight(),
	                        m.getNoOfItems(),
	                        m.getTotalQty()
	                );
	                dto.setMeasurements(mDto);
	            });


	    return dto;
	}


	private String saveFile(MultipartFile file) {
		if (file.isEmpty()) {
			throw new IllegalArgumentException("Cannot save empty file");
		}
		try {
			Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
			Files.createDirectories(dirPath);

			String originalFilename = Path.of(file.getOriginalFilename()).getFileName().toString();
			String newFileName = UUID.randomUUID() + "_" + originalFilename;
			Path targetPath = dirPath.resolve(newFileName);

			Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

			return uploadDir + "/" + newFileName;
		} catch (IOException ex) {
			throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
		}
	}

// hepler function for submiRfi to send for validation by Engineer Only	
	@Transactional
	public boolean sendRfiForValidation(Long rfiId) {
		Optional<RfiStatusProjection> rfiProjOpt = rfiRepository.findStatusById(rfiId);

		if (rfiProjOpt.isPresent()) {
			RfiStatusProjection rfi = rfiProjOpt.get();

			if (!EnumRfiStatus.INSPECTED_BY_AE.name().equalsIgnoreCase(rfi.getStatus())) {
				return false;
			}
			RFI fullRfi = rfiRepository.findById(rfi.getId()).orElseThrow(() -> new RuntimeException("RFI not found"));
			fullRfi.setStatus(EnumRfiStatus.VALIDATION_PENDING);

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
	public ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy)
			throws IOException, DocumentException {
		List<String> imagePathRows;
		if ("Regular User".equals(uploadedBy)) {
			imagePathRows = inspectionRepository.findSiteImagesByIdAndUploadedByClient(id);
		} else {
			imagePathRows = inspectionRepository.findSiteImagesByIdAndUploadedByContractor(id);
		}
		if (imagePathRows == null || imagePathRows.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		List<String> allPaths = imagePathRows.stream().filter(Objects::nonNull)
				.flatMap(row -> Arrays.stream(row.split(","))).map(String::trim).filter(path -> !path.isEmpty())
				.collect(Collectors.toList());

		if (allPaths.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		String title = "Images Uploaded by the "
				+ (uploadedBy.equalsIgnoreCase("Contractor") ? "Contractor" : "Client");

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Document document = new Document();
		PdfWriter.getInstance(document, baos);
		document.open();

		Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
		Paragraph heading = new Paragraph(title, titleFont);
		heading.setAlignment(Element.ALIGN_CENTER);
		document.add(heading);
		document.add(Chunk.NEWLINE);

		for (String path : allPaths) {
			try {
				Image img = Image.getInstance(path);
				img.scaleToFit(500, 500);
				img.setAlignment(Element.ALIGN_CENTER);
				document.add(img);
				document.add(Chunk.NEWLINE);
			} catch (Exception e) {
				document.add(new Paragraph("Could not load image: " + path));
			}
		}

		document.close();

		String filename = title.replace(" ", "_") + ".pdf";

		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.APPLICATION_PDF).body(baos.toByteArray());
	}

	
	@Override
	public boolean SaveTxnIdSetEStatusCon(String txnId, Long rfiId,ESignStatus status) {
	    String sql = "UPDATE rfi_data SET txn_id = ?, e_sign_status= ? WHERE id = ?";
	    int rowsUpdated = jdbcTemplate.update(sql, txnId,status.name(), rfiId);
	    return rowsUpdated > 0;
	}
		

	@Override
	public void saveESignStatusCon(ESignStatus status, String txnID) {
	    String sql = "UPDATE rfi_data SET e_sign_status = ?, contractor_submitted_date = CURDATE() " +
	                 "WHERE txn_id = ?";
	    jdbcTemplate.update(sql, status.name(), txnID);
	}
	
	@Override
	public void saveESignStatusEngg(ESignStatus status, String txnID) {
	    String sql = "UPDATE rfi_data SET e_sign_status = ?, engineer_submitted_date = CURDATE() " +
	                 "WHERE txn_id = ? ";
	    jdbcTemplate.update(sql, status.name(), txnID);
	}
	
	
	@Override
	public ESignStatus getEsignStatusEngg(Long rfiId) {
	    String sql = "SELECT e_sign_status FROM rfi_data WHERE id = ?";
	    try {
	        String status = jdbcTemplate.queryForObject(sql, new Object[]{rfiId}, String.class);
	        return status != null ? ESignStatus.valueOf(status) : ESignStatus.CON_PENDING;
	    } catch (EmptyResultDataAccessException e) {
	        // No record found → treat as PENDING
	        return ESignStatus.CON_PENDING;
	    }
	}


 
	@Override
	public RFI getRFIIdTxnId(String espTxnID, String User) {
	    System.out.println("Executing query for txn_id: " + espTxnID);

	    // 1️⃣ Update date first
	    if ("Contractor".equalsIgnoreCase(User)) {
	        String updateSql = "UPDATE rfi_data SET contractor_submitted_date = NOW() WHERE txn_id = ?";
	        int rowsAffected = jdbcTemplate.update(updateSql, espTxnID);
	        System.out.println("Contractor submitted date updated. Rows affected: " + rowsAffected);
	    } else if ("Engineer".equalsIgnoreCase(User)) {
	        String updateSql = "UPDATE rfi_data SET engineer_submitted_date = NOW() WHERE txn_id = ?";
	        int rowsAffected = jdbcTemplate.update(updateSql, espTxnID);
	        System.out.println("Engineer submitted date updated. Rows affected: " + rowsAffected);
	    }

	    // 2️⃣ Fetch the updated RFI
	    String selectSql = "SELECT rfi_id, id, txn_id, created_by, contractor_submitted_date, engineer_submitted_date "
	            + "FROM rfi_data WHERE txn_id = ?";

	    try {
	        return jdbcTemplate.queryForObject(selectSql, new Object[]{espTxnID}, (rs, rowNum) -> {
	            RFI rfiDetails = new RFI();
	            rfiDetails.setId(rs.getLong("id"));
	            rfiDetails.setRfi_Id(rs.getString("rfi_id"));
	            rfiDetails.setTxn_id(rs.getString("txn_id"));
	            rfiDetails.setCreatedBy(rs.getString("created_by"));

	            java.sql.Date contractorDate = rs.getDate("contractor_submitted_date");
	            java.sql.Date engineerDate = rs.getDate("engineer_submitted_date");

	            rfiDetails.setContractor_submitted_date(contractorDate != null ? contractorDate.toLocalDate() : null);
	            rfiDetails.setEngineer_submitted_date(engineerDate != null ? engineerDate.toLocalDate() : null);

	            System.out.println("engineer date after update: " + rfiDetails.getEngineer_submitted_date());

	            return rfiDetails;
	        });
	    } catch (EmptyResultDataAccessException e) {
	        System.out.println("No RFI record found for txn_id: " + espTxnID);
	        return null;
	    }
	}
	@Override
	public String getLastTxnIdForRfi(Long rfiId) {
	    String sql = "SELECT txn_id FROM rfi_data WHERE id = ?";
	    try {
	        return jdbcTemplate.queryForObject(sql, new Object[]{rfiId}, String.class);
	    } catch (EmptyResultDataAccessException e) {
	        return null; // no txnId found
	    }
	}




	public RFIInspectionDetails getLatestInspectionByRfiId(Long rfiId) {
	    return inspectionRepository.findTopByRfi_IdOrderByIdDesc(rfiId).orElse(null);
	}




 
 

}