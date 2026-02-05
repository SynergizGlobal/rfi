package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.metro.rfisystem.backend.dto.EnclosureFileDto;
import com.metro.rfisystem.backend.dto.InspectionStatus;
import com.metro.rfisystem.backend.dto.RFIInspectionAutofillDTO;
import com.metro.rfisystem.backend.dto.TestType;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIEnclosure;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIEnclosureService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIEnclosureServiceImpl implements RFIEnclosureService {

	private final RFIEnclosureRepository enclosureRepository;
	private final RFIInspectionDetailsRepository inspectionRepository;
	private final RFIRepository rfiRepository;

	@Value("${rfi.enclosures.upload-dir}")
	private String uploadDir;

	@Override
	public String uploadEnclosureFile(Long rfiId, String deptFk, String enclosureName, MultipartFile file,
	        String description) {

	    if (file == null || file.isEmpty()) {
	        throw new IllegalArgumentException("No file provided.");
	    }

	    long maxSize = 100 * 1024 * 1024;
	    if (file.getSize() > maxSize) {
	        throw new IllegalArgumentException("File size exceeds 100MB limit.");
	    }

	    String originalFilename = file.getOriginalFilename();
	    if (originalFilename == null || !originalFilename.contains(".")) {
	        throw new IllegalArgumentException("Invalid file name.");
	    }

	    String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();

	    if (!ext.equals(".pdf")) {
	        throw new IllegalArgumentException("Only PDF files are allowed.");
	    }

	    if (isEncryptedPdf(file)) {
	        throw new IllegalArgumentException("Encrypted PDF is not allowed.");
	    }

	    String timeStamp = String.valueOf(System.currentTimeMillis());
	    String storedFileName = "rfi_" + rfiId + "_" + enclosureName +"_"+ timeStamp + ext;

	    Path uploadPath = Paths.get(uploadDir);

	    try {
	        if (!Files.exists(uploadPath)) {
	            Files.createDirectories(uploadPath);
	        }

	        Path filePath = uploadPath.resolve(storedFileName);
	        file.transferTo(filePath.toFile());

	        RFI rfi = rfiRepository.findById(rfiId)
	                .orElseThrow(() -> new IllegalArgumentException("Invalid RFI ID"));

	        RFIEnclosure enclosure = new RFIEnclosure();
	        enclosure.setRfi(rfi);
	        enclosure.setEnclosureName(enclosureName);              
	        enclosure.setEnclosureUploadFile(filePath.toString());  
	        enclosure.setDescription(description);
	        enclosure.setUploadedBy("Engg".equalsIgnoreCase(deptFk) ? "Engg" : "CON");
	        enclosure.setLocked(!"Engg".equalsIgnoreCase(deptFk));



	        enclosureRepository.save(enclosure);

	        return storedFileName;

	    } catch (IOException e) {
	        throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
	    }
	}



	private boolean isEncryptedPdf(MultipartFile file) {
		try (InputStream is = file.getInputStream()) {
			PDDocument document = PDDocument.load(is);
			boolean encrypted = document.isEncrypted();
			document.close();
			return encrypted;
		} catch (Exception e) {
			// If PDFBox fails to read, assume encrypted or corrupted
			return true;
		}
	}

	public List<EnclosureFileDto> getEnclosures(Long rfiId) {

		List<Object[]> rows = enclosureRepository.findByRfiId(rfiId);

		Map<String, List<String>> grouped = new LinkedHashMap<>();

		for (Object[] row : rows) {
			String enclosure = (String) row[0];
			String file = (String) row[1];

			grouped.computeIfAbsent(enclosure, k -> new ArrayList<>()).add(file);
		}

		List<EnclosureFileDto> result = new ArrayList<>();

		for (Map.Entry<String, List<String>> entry : grouped.entrySet()) {
			EnclosureFileDto dto = new EnclosureFileDto();
			dto.setEnclosureName(entry.getKey());
			dto.setFiles(entry.getValue());
			result.add(dto);
		}

		return result;
	}

	@Override
	public void deleteSingleFile(Long id, String deptFk) {
		RFIEnclosure file = enclosureRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Invalid file ID"));

		// Normalize deptFk
		String currentUser = deptFk.equalsIgnoreCase("CONTRACTOR") ? "CON"
				: deptFk.equalsIgnoreCase("ENGG") ? "ENGG" : deptFk;

		String fileOwner = file.getUploadedBy().trim().toUpperCase();

		if (!fileOwner.equals(currentUser.toUpperCase())) {
			throw new SecurityException("You cannot delete files uploaded by " + file.getUploadedBy());
		}

		// Delete physical file
		try {
			String path = file.getEnclosureUploadFile();
			if (path != null) {
				Files.deleteIfExists(Paths.get(path));
			}
		} catch (IOException e) {
			throw new RuntimeException("File delete error: " + e.getMessage(), e);
		}

		// Delete DB record
		enclosureRepository.delete(file);
	}

	@Override
	public RFIInspectionAutofillDTO getAutofillData(Long rfiId) {

		RFI rfi = rfiRepository.findById(rfiId).orElseThrow(() -> new RuntimeException("RFI not found"));

		Optional<RFIInspectionDetails> inspectionOpt = inspectionRepository.findByRfiId(rfiId);

		RFIInspectionAutofillDTO dto = new RFIInspectionAutofillDTO();
		dto.setNameOfWork(rfi.getWork());
		dto.setStructureType(rfi.getStructureType());
		dto.setComponent(rfi.getComponent());
		dto.setRfiNo(rfi.getRfi_Id());

		dto.setDate(rfi.getDateOfInspection() != null ? rfi.getDateOfInspection().toString() : "");

		if (inspectionOpt.isPresent()) {
			RFIInspectionDetails insp = inspectionOpt.get();
			dto.setLocation(insp.getLocation() != null ? insp.getLocation() : rfi.getLocation());
		} else {
			dto.setLocation(rfi.getLocation());
		}

		return dto;
	}

	@Value("${file.site.test.dir}")
	private String uploadDirTest;

	@Override
	public void processConfirmation(InspectionStatus status, TestType testType, List<MultipartFile> files) {

		if (files != null) {
			files.forEach(file -> {
				try {
					saveFile(file);
				} catch (Exception e) {

					e.printStackTrace();
				}
			});
		}

		// Optional: persist to DB
		// System.out.println("Saved: status=" + status + ", test=" + testType);
	}

	private void saveFile(MultipartFile file) throws Exception {
		if (file.isEmpty())
			return;

		try {
			Files.createDirectories(Paths.get(uploadDirTest));
			Path dest = Paths.get(uploadDirTest).resolve(Paths.get(file.getOriginalFilename())).normalize()
					.toAbsolutePath();

			if (!dest.getParent().equals(Paths.get(uploadDirTest).toAbsolutePath())) {
				throw new Exception("Cannot write file outside designated directory");
			}

			try (InputStream is = file.getInputStream()) {
				Files.copy(is, dest, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new Exception("Failed to store " + file.getOriginalFilename(), e);
		}
	}

}
