package com.metro.rfisystem.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/rfi")
public class PdfUploadController {

    @Value("${rfi.pdf.storage-path}")
    private String pdfStoragePath;

    @PostMapping("/uploadPdf")
    public ResponseEntity<String> uploadPdf(
            @RequestParam("pdf") MultipartFile pdfFile,
            @RequestParam("rfiId") String rfiId
    ) throws IOException {

        if (pdfFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded PDF is empty.");
        }

        Path dirPath = Paths.get(pdfStoragePath);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String safeRfiId = rfiId.replaceAll("[^a-zA-Z0-9_-]", "_");
        Path filePath = dirPath.resolve(safeRfiId + ".pdf");

        System.out.println("Saving PDF to: " + filePath.toAbsolutePath());
        System.out.println("Directory writable? " + Files.isWritable(dirPath));

        try {
            pdfFile.transferTo(filePath.toFile());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save PDF: " + e.getMessage());
        }

        return ResponseEntity.ok("PDF saved successfully at: " + filePath.toAbsolutePath());
    }
}
