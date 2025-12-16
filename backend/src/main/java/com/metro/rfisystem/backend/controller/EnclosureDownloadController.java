package com.metro.rfisystem.backend.controller;

import java.io.File;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.utils.PdfMerger;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.AreaBreakType;
import com.itextpdf.layout.properties.TextAlignment;
import com.metro.rfisystem.backend.model.rfi.RFIEnclosure;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rfi")
public class EnclosureDownloadController {
	
	private final RFIEnclosureRepository enclosureRepository;

	
	
//	@GetMapping("/DownloadEnclosure")
//	public ResponseEntity<Resource> downloadMergedEnclosure(
//	        @RequestParam Long rfiId,
//	        @RequestParam String enclosureName) throws Exception {
//
//	    List<String> filePaths = enclosureRepository.findAllByRfi_IdAndEnclosureName(rfiId, enclosureName)
//	            .stream()
//	            .map(RFIEnclosure::getEnclosureUploadFile)
//	            .toList();
//
//	    if (filePaths.isEmpty()) {
//	        return ResponseEntity.notFound().build();
//	    }
//
//	    Path mergedPdf = Files.createTempFile("merged_", ".pdf");
//
//	    try (OutputStream outputStream = Files.newOutputStream(mergedPdf);
//	         PdfWriter writer = new PdfWriter(outputStream);
//	         PdfDocument pdfDoc = new PdfDocument(writer);
//	         Document document = new Document(pdfDoc)) {
//
//	        PdfMerger merger = new PdfMerger(pdfDoc);
//
//	        List<Path> imageFiles = filePaths.stream()
//	                .map(p -> Paths.get(p.replace("\\", File.separator)))
//	                .filter(Files::exists)
//	                .filter(p -> {
//	                    try {
//	                        String ct = Files.probeContentType(p);
//	                        return ct != null && ct.startsWith("image");
//	                    } catch (Exception e) {
//	                        return false;
//	                    }
//	                })
//	                .toList();
//
//	        for (int i = 0; i < imageFiles.size(); i++) {
//	            Path imagePath = imageFiles.get(i);
//	            boolean hasNext = (i < imageFiles.size() - 1);
//	            addImageToDocument(document, imagePath, enclosureName, hasNext);
//	        }
//	        List<Path> pdfFiles = filePaths.stream()
//	                .map(p -> Paths.get(p.replace("\\", File.separator)))
//	                .filter(Files::exists)
//	                .filter(p -> {
//	                    try {
//	                        return "application/pdf".equals(Files.probeContentType(p));
//	                    } catch (Exception e) {
//	                        return false;
//	                    }
//	                })
//	                .toList();
//
//	        for (Path pdfPath : pdfFiles) {
//	            try (PdfDocument srcDoc = new PdfDocument(new PdfReader(pdfPath.toFile()))) {
//	                merger.merge(srcDoc, 1, srcDoc.getNumberOfPages());
//	            }
//	        }
//	    }
//
//	    Resource resource = new UrlResource(mergedPdf.toUri());
//	    return ResponseEntity.ok()
//	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + enclosureName + "_merged.pdf\"")
//	            .contentType(MediaType.APPLICATION_PDF)
//	            .body(resource);
//	}

	
//	@GetMapping("/DownloadEnclosure")
//	public ResponseEntity<Resource> downloadEnclosureByRole(
//	        @RequestParam Long rfiId,
//	        @RequestParam String enclosureName,
//	        HttpSession session) throws Exception {
//
//		String deptFk = (String) session.getAttribute("departmentFk");
//
//	    // Fetch files uploaded by this role only
//	    List<RFIEnclosure> files = enclosureRepository
//	            .findAllByRfi_IdAndEnclosureNameAndUploadedBy(rfiId, enclosureName,
//	                    "Engg".equalsIgnoreCase(deptFk) ? "Engg" : "CON");
//
//	    if (files.isEmpty()) return ResponseEntity.notFound().build();
//
//	    // For simplicity, you can send them individually or merge them
//	    // Here, merge only files of the same role
//	    Path mergedPdf = Files.createTempFile("merged_", ".pdf");
//
//	    try (OutputStream outputStream = Files.newOutputStream(mergedPdf);
//	         PdfWriter writer = new PdfWriter(outputStream);
//	         PdfDocument pdfDoc = new PdfDocument(writer);
//	         Document document = new Document(pdfDoc)) {
//
//	        PdfMerger merger = new PdfMerger(pdfDoc);
//
//	        for (RFIEnclosure file : files) {
//	            Path path = Paths.get(file.getEnclosureUploadFile());
//	            if (!Files.exists(path)) continue;
//
//	            // Check if image
//	            String contentType = Files.probeContentType(path);
//	            if (contentType != null && contentType.startsWith("image")) {
//	                addImageToDocument(document, path, file.getEnclosureName(), true);
//	            } else if ("application/pdf".equals(contentType)) {
//	                try (PdfDocument srcDoc = new PdfDocument(new PdfReader(path.toFile()))) {
//	                    merger.merge(srcDoc, 1, srcDoc.getNumberOfPages());
//	                }
//	            }
//	        }
//	    }
//
//	    Resource resource = new UrlResource(mergedPdf.toUri());
//	    return ResponseEntity.ok()
//	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +
//	                    enclosureName + "_" + deptFk + "_merged.pdf\"")
//	            .contentType(MediaType.APPLICATION_PDF)
//	            .body(resource);
//	}

	
	 @GetMapping("/DownloadEnclosure")
	    public ResponseEntity<Resource> downloadEnclosureById(
	            @RequestParam Long id,
	            HttpSession session) throws Exception {

	        String deptFk = (String) session.getAttribute("departmentFk");
	        String role = "Engg".equalsIgnoreCase(deptFk) ? "Engg" : "CON";

	        // ✅ Fetch by ID only
	        RFIEnclosure file = enclosureRepository
	                .findByIdAndUploadedBy(id, role)
	                .orElseThrow(() -> new RuntimeException("File not found or access denied"));

	        Path sourcePath = Paths.get(file.getEnclosureUploadFile());
	        if (!Files.exists(sourcePath)) {
	            return ResponseEntity.notFound().build();
	        }

	        String contentType = Files.probeContentType(sourcePath);

	        // ================= IMAGE → PDF =================
	        if (contentType != null && contentType.startsWith("image")) {

	            Path pdfPath = Files.createTempFile("enclosure_", ".pdf");

	            try (PdfWriter writer = new PdfWriter(pdfPath.toFile());
	                 PdfDocument pdfDoc = new PdfDocument(writer);
	                 Document document = new Document(pdfDoc)) {

	                addImageToDocument(
	                        document,
	                        sourcePath,
	                        file.getEnclosureName(), // only for title text
	                        false
	                );
	            }

	            Resource resource = new UrlResource(pdfPath.toUri());
	            return ResponseEntity.ok()
	                    .header(HttpHeaders.CONTENT_DISPOSITION,
	                            "attachment; filename=\"enclosure_" + id + ".pdf\"")
	                    .contentType(MediaType.APPLICATION_PDF)
	                    .body(resource);
	        }

	        // ================= PDF → DIRECT DOWNLOAD =================
	        Resource resource = new UrlResource(sourcePath.toUri());
	        return ResponseEntity.ok()
	                .header(HttpHeaders.CONTENT_DISPOSITION,
	                        "attachment; filename=\"" + sourcePath.getFileName() + "\"")
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(resource);
	    }

	

	// ✅ Helper method (handles long enclosure names gracefully)
	private void addImageToDocument(Document document, Path imagePath, String enclosureName, boolean hasNext) throws Exception {
	    int fontSize = enclosureName.length() > 40 ? 14 : 20;

	    Paragraph title = new Paragraph("Enclosure: " + enclosureName)
	            .setBold()
	            .setTextAlignment(TextAlignment.CENTER)
	            .setFontSize(fontSize)
	            .setWidth(document.getPdfDocument().getDefaultPageSize().getWidth() - 80) 
	            .setMarginBottom(10)
	            .setMultipliedLeading(1.2f); 

	    document.add(title);

	    document.add(new Paragraph("").setMarginTop(100f));

	    Image img = new Image(ImageDataFactory.create(imagePath.toUri().toURL()));
	    img.setAutoScale(true);
	    document.add(img);

	    if (hasNext) {
	        document.add(new AreaBreak(AreaBreakType.NEXT_PAGE));
	    }
	}



}
