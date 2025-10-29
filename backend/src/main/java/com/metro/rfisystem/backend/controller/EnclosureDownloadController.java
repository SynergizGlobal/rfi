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

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rfi")
public class EnclosureDownloadController {
	
	private final RFIEnclosureRepository enclosureRepository;

	
	
	@GetMapping("/DownloadEnclosure")
	public ResponseEntity<Resource> downloadMergedEnclosure(
	        @RequestParam Long rfiId,
	        @RequestParam String enclosureName) throws Exception {

	    List<String> filePaths = enclosureRepository.findAllByRfi_IdAndEnclosureName(rfiId, enclosureName)
	            .stream()
	            .map(RFIEnclosure::getEnclosureUploadFile)
	            .toList();

	    if (filePaths.isEmpty()) {
	        return ResponseEntity.notFound().build();
	    }

	    Path mergedPdf = Files.createTempFile("merged_", ".pdf");

	    try (OutputStream outputStream = Files.newOutputStream(mergedPdf);
	         PdfWriter writer = new PdfWriter(outputStream);
	         PdfDocument pdfDoc = new PdfDocument(writer);
	         Document document = new Document(pdfDoc)) {

	        PdfMerger merger = new PdfMerger(pdfDoc);

	        List<Path> imageFiles = filePaths.stream()
	                .map(p -> Paths.get(p.replace("\\", File.separator)))
	                .filter(Files::exists)
	                .filter(p -> {
	                    try {
	                        String ct = Files.probeContentType(p);
	                        return ct != null && ct.startsWith("image");
	                    } catch (Exception e) {
	                        return false;
	                    }
	                })
	                .toList();

	        for (int i = 0; i < imageFiles.size(); i++) {
	            Path imagePath = imageFiles.get(i);
	            boolean hasNext = (i < imageFiles.size() - 1);
	            addImageToDocument(document, imagePath, enclosureName, hasNext);
	        }
	        List<Path> pdfFiles = filePaths.stream()
	                .map(p -> Paths.get(p.replace("\\", File.separator)))
	                .filter(Files::exists)
	                .filter(p -> {
	                    try {
	                        return "application/pdf".equals(Files.probeContentType(p));
	                    } catch (Exception e) {
	                        return false;
	                    }
	                })
	                .toList();

	        for (Path pdfPath : pdfFiles) {
	            try (PdfDocument srcDoc = new PdfDocument(new PdfReader(pdfPath.toFile()))) {
	                merger.merge(srcDoc, 1, srcDoc.getNumberOfPages());
	            }
	        }
	    }

	    Resource resource = new UrlResource(mergedPdf.toUri());
	    return ResponseEntity.ok()
	            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + enclosureName + "_merged.pdf\"")
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
