package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
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
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.InspectionService;
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
	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, MultipartFile[] siteImages,
			String UserRole) {
		RFI rfi = rfiRepository.findById(dto.getRfiId())
				.orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

		String selfiePath = saveFile(selfie);
		String siteImagePaths = Arrays.stream(siteImages).map(this::saveFile).collect(Collectors.joining(","));

		Optional<RFIInspectionDetails> existingInspectionOpt = inspectionRepository
				.findByRfiAndUploadedBy(rfi, UserRole);

		RFIInspectionDetails inspection =  existingInspectionOpt.orElse(new RFIInspectionDetails());

		inspection.setRfi(rfi);
		inspection.setLocation(dto.getLocation());
		inspection.setChainage(dto.getChainage());
		inspection.setSelfiePath(selfiePath);
		inspection.setSiteImage(siteImagePaths);
		inspection.setDateOfInspection(LocalDate.now());
		inspection.setTimeOfInspection(LocalTime.now());
		inspection.setUploadedBy(UserRole);

		inspectionRepository.save(inspection);
		return inspection.getId();
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

	@Override
	public void updateInspectionStatus(RFIInspectionRequestDTO dto, MultipartFile testDocument) {

		RFI rfi = rfiRepository.findById(dto.getRfiId())
				.orElseThrow(() -> new IllegalArgumentException("Invalid RFI ID: " + dto.getRfiId()));

		RFIInspectionDetails inspection = inspectionRepository.findById(dto.getInspectionId())
				.orElseThrow(() -> new IllegalArgumentException("No inspection found for RFI ID: " + dto.getRfiId()));

		inspection.setInspectionStatus(dto.getInspectionStatus());
		inspection.setTestInsiteLab(dto.getTestInsiteLab());
		rfi.setStatus(EnumRfiStatus.INSPECTED_BY_AE);
		if (testDocument != null && !testDocument.isEmpty()) {
			String filename = saveFile(testDocument);
			inspection.setTestSiteDocuments(filename);
		}
		rfiRepository.save(rfi);
		inspectionRepository.save(inspection);
	}

	@Override
	public ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy)
			throws IOException, DocumentException {
		List<String> imagePathRows = inspectionRepository.findSiteImagesByIdAndUploader(id, uploadedBy);

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
