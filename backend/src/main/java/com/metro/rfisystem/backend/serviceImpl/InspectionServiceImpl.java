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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus;
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

@Service
@RequiredArgsConstructor
public class InspectionServiceImpl implements InspectionService {

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


//	@Override
//	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie,
//	         List<MultipartFile> siteImages, MultipartFile testDocument, String deptFk) {
//
//	    RFI rfi = rfiRepository.findById(dto.getRfiId())
//	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));
//
//	    // Update only if changed
//	    if (dto.getNameOfRepresentative() != null 
//	            && !dto.getNameOfRepresentative().equals(rfi.getNameOfRepresentative())) {
//	        rfi.setNameOfRepresentative(dto.getNameOfRepresentative());
//	        rfiRepository.save(rfi);
//	    }
//
//	    // Check existing inspection
//	    Optional<RFIInspectionDetails> existingInspectionOpt =
//	            inspectionRepository.findByRfiAndUploadedBy(rfi, deptFk);
//
//	    RFIInspectionDetails inspection = existingInspectionOpt.orElse(new RFIInspectionDetails());
//	    inspection.setRfi(rfi);
//
//	    // Only update inspectionStatus if passed
//	    if (dto.getInspectionStatus() != null) {
//	        inspection.setInspectionStatus(dto.getInspectionStatus());
//	    }
//
//	    // Save selfie if uploaded
//	    if (selfie != null && !selfie.isEmpty()) {
//	        String selfiePath = saveFile(selfie);
//	        inspection.setSelfiePath(selfiePath);
//	    }
//
//	    // Save site images if uploaded
//	    if (siteImages != null && !siteImages.isEmpty()) {
//	        String siteImagePaths = siteImages.stream()
//	                .filter(f -> f != null && !f.isEmpty())
//	                .map(this::saveFile)
//	                .collect(Collectors.joining(","));
//	        inspection.setSiteImage(siteImagePaths);
//	    }
//
//	    // Save test document if uploaded
//	    if (testDocument != null && !testDocument.isEmpty()) {
//	        String filename = saveFile(testDocument);
//	        inspection.setTestSiteDocuments(filename);
//	    }
//
//	    // Update location fields only if not null
//	    if (dto.getLocation() != null) inspection.setLocation(dto.getLocation());
//	    if (dto.getChainage() != null) inspection.setChainage(dto.getChainage());
//
//	    // Save inspection date/time only for new draft
//	    if (inspection.getId() == null) {
//	        inspection.setDateOfInspection(LocalDate.now());
//	        inspection.setTimeOfInspection(LocalTime.now());
//	    }
//
//	    inspection.setUploadedBy(deptFk);
//
//	    // Update measurement fields only if provided
//	    if (dto.getMeasurementType() != null) inspection.setMeasurementType(dto.getMeasurementType());
//	    if (dto.getLength() != null) inspection.setLength(dto.getLength());
//	    if (dto.getBreadth() != null) inspection.setBreadth(dto.getBreadth());
//	    if (dto.getHeight() != null) inspection.setHeight(dto.getHeight());
//	    if (dto.getNoOfItems() != null) inspection.setNoOfItems(dto.getNoOfItems());
//	    if (dto.getTotalQty() != null) inspection.setTotalQty(dto.getTotalQty());
//
//	    // RFI status should not be finalized on draft → save only for reference
//	    inspection.setWorkStatus(InspectionWorkFlowStatus.draft);
//
//
//	    inspectionRepository.save(inspection);
//	    return inspection.getId();
//	}
//	
//	
//	@Transactional
//	public InspectionSubmitResult finalizeInspection(RFIInspectionRequestDTO dto,
//	                                                 MultipartFile selfie,
//	                                                 List<MultipartFile> siteImages,
//	                                                 MultipartFile testDocument,
//	                                                 String deptFk) {
//
//	    RFI rfi = rfiRepository.findById(dto.getRfiId())
//	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));
//
//	    RFIInspectionDetails inspection;
//
//	    // 🔹 If inspectionId is null → create a new inspection
//	    if (dto.getInspectionId() == null) {
//	        inspection = new RFIInspectionDetails();
//	        inspection.setRfi(rfi);  // link to parent RFI
//	        inspection.setDateOfInspection(LocalDate.now());
//	        inspection.setTimeOfInspection(LocalTime.now());
//	    } else {
//	        inspection = inspectionRepository.findById(dto.getInspectionId())
//	                .orElseThrow(() -> new RuntimeException("Inspection not found with ID: " + dto.getInspectionId()));
//	    }
//
//	    // 🔹 Update fields
//	    if (dto.getLocation() != null) inspection.setLocation(dto.getLocation());
//	    if (dto.getChainage() != null) inspection.setChainage(dto.getChainage());
//	    if (dto.getMeasurementType() != null) inspection.setMeasurementType(dto.getMeasurementType());
//	    if (dto.getLength() != null) inspection.setLength(dto.getLength());
//	    if (dto.getBreadth() != null) inspection.setBreadth(dto.getBreadth());
//	    if (dto.getHeight() != null) inspection.setHeight(dto.getHeight());
//	    if (dto.getNoOfItems() != null) inspection.setNoOfItems(dto.getNoOfItems());
//	    if (dto.getTotalQty() != null) inspection.setTotalQty(dto.getTotalQty());
//	    if (dto.getInspectionStatus() != null) inspection.setInspectionStatus(dto.getInspectionStatus());
//	    if (dto.getTestInsiteLab() != null) inspection.setTestInsiteLab(dto.getTestInsiteLab());
//	    if (dto.getEngineerRemarks() != null) inspection.setEngineerRemarks(dto.getEngineerRemarks());
//
//	    // 🔹 File uploads
//	    if (selfie != null && !selfie.isEmpty()) {
//	        inspection.setSelfiePath(saveFile(selfie));
//	    }
//	    if (siteImages != null && !siteImages.isEmpty()) {
//	        String siteImagePaths = siteImages.stream()
//	                .filter(f -> f != null && !f.isEmpty())
//	                .map(this::saveFile)
//	                .collect(Collectors.joining(","));
//	        inspection.setSiteImage(siteImagePaths);
//	    }
//	    if (testDocument != null && !testDocument.isEmpty()) {
//	        inspection.setTestSiteDocuments(saveFile(testDocument));
//	    }
//
//	    // 🔹 Finalize workflow
//	    inspection.setWorkStatus(InspectionWorkFlowStatus.SUBMITTED);
//
//	    if ("Engg".equalsIgnoreCase(deptFk)) {
//	        rfi.setStatus(EnumRfiStatus.INSPECTED_BY_AE);
//	    } else {
//	        rfi.setStatus(EnumRfiStatus.INSPECTED_BY_CON);
//	    }
//
//	    inspectionRepository.save(inspection);
//	    rfiRepository.save(rfi);
//
//	    return "Engg".equalsIgnoreCase(deptFk)
//	            ? InspectionSubmitResult.ENGINEER_SUCCESS
//	            : InspectionSubmitResult.CONTRACTOR_SUCCESS;
//	}


	@Override
	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie,
	                            List<MultipartFile> siteImages, MultipartFile testDocument, String deptFk) {

	    RFI rfi = rfiRepository.findById(dto.getRfiId())
	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

	    if (dto.getNameOfRepresentative() != null 
	            && !dto.getNameOfRepresentative().equals(rfi.getNameOfRepresentative())) {
	        rfi.setNameOfRepresentative(dto.getNameOfRepresentative());
	        rfiRepository.save(rfi);
	    }

	    Optional<RFIInspectionDetails> existingInspectionOpt =
	            inspectionRepository.findByRfiAndUploadedBy(rfi, deptFk);

	    RFIInspectionDetails inspection = existingInspectionOpt.orElse(new RFIInspectionDetails());
	    
	    Optional<Measurements> existingMeasurementsOpt = measurementsRepository.findByRfiId(dto.getRfiId());
	    
	    Measurements measurements = existingMeasurementsOpt.orElse(new Measurements());
	    
	    
	    inspection.setRfi(rfi);
		if ("Engg".equalsIgnoreCase(deptFk)) {
			inspection.setUploadedBy("Engg");
		} else {
			inspection.setUploadedBy("CON");
		}
	    if (dto.getInspectionStatus() != null) {
	        inspection.setInspectionStatus(dto.getInspectionStatus());
	    }

	    if (selfie != null && !selfie.isEmpty()) {
	        inspection.setSelfiePath(saveFile(selfie));
	    }

	    if (siteImages != null && !siteImages.isEmpty()) {
	        String siteImagePaths = siteImages.stream()
	                .filter(f -> f != null && !f.isEmpty())
	                .map(this::saveFile)
	                .collect(Collectors.joining(","));
	        inspection.setSiteImage(siteImagePaths);
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

	    
	    inspectionRepository.save(inspection);
	    measurementsRepository.save(measurements);
	    return inspection.getId();
	}
	
	
	@Transactional
	public InspectionSubmitResult finalizeInspection(RFIInspectionRequestDTO dto,
	                                                 MultipartFile selfie,
	                                                 List<MultipartFile> siteImages,
	                                                 MultipartFile testDocument,
	                                                 String deptFk) {

	    RFI rfi = rfiRepository.findById(dto.getRfiId())
	            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

	    RFIInspectionDetails inspection;

	    if (dto.getInspectionId() == null) {
	        inspection = inspectionRepository.findByRfiAndUploadedBy(rfi, deptFk)
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
		}
		inspection.setDateOfInspection(LocalDate.now());
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
	    if (siteImages != null && !siteImages.isEmpty()) {
	        String siteImagePaths = siteImages.stream()
	                .filter(f -> f != null && !f.isEmpty())
	                .map(this::saveFile)
	                .collect(Collectors.joining(","));
	        inspection.setSiteImage(siteImagePaths);
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


	
	public List<RFIInspectionRequestDTO> getInspectionsByRfiId(Long rfiId, String deptFk) {
        List<RFIInspectionDetails> inspections;

        if ("CON".equalsIgnoreCase(deptFk)) {
            inspections = new ArrayList<>(inspectionRepository.findDraftInspections("CON"));
            inspections.addAll(inspectionRepository.findSubmittedByContractor("CON"));
        } else if ("Engg".equalsIgnoreCase(deptFk)) {
            inspections = inspectionRepository.findAllSubmitted();
        } else {
            inspections = inspectionRepository.findAllInspections();
        }

        return inspections.stream()
                .filter(ins -> ins.getRfi().getId().equals(rfiId)) // filter by RFI ID
                .map(this::convertToFullDTO)
                .toList();
    }

	private RFIInspectionRequestDTO convertToFullDTO(RFIInspectionDetails inspection) {
	    RFIInspectionRequestDTO dto = new RFIInspectionRequestDTO();
	    dto.setRfiId(inspection.getRfi().getId());
	    dto.setInspectionId(inspection.getId());
	    dto.setLocation(inspection.getLocation());
	    dto.setSiteImage(inspection.getSiteImage());
	    dto.setChainage(inspection.getChainage());
	    dto.setInspectionStatus(inspection.getInspectionStatus());
	    dto.setTestInsiteLab(inspection.getTestInsiteLab());
	    dto.setEngineerRemarks(inspection.getEngineerRemarks());
	    dto.setUploadedBy(inspection.getUploadedBy());

	    // fetch measurements
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


}
