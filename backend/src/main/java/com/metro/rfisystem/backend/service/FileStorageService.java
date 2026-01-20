package com.metro.rfisystem.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Value("${rfi.pdf.storage-path}")
    private String pdfStoragePath;
    
    @Value("${rfi.attachments.upload-dir}")
    private String pdfStoragePathAttachments;

    public String saveFile(MultipartFile file) {
        try {
            Path uploadDir = Paths.get(pdfStoragePath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String safeFileName = (originalName != null ? originalName.replaceAll("[\\\\/:*?\"<>|]", "_") : "uploaded.pdf");

            String fileName = System.currentTimeMillis() + "_" + safeFileName;

            Path filePath = uploadDir.resolve(fileName).normalize();

            file.transferTo(filePath.toFile());

            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to store file: " + e.getMessage(), e);
        }
    }
    
    public String saveFileAttachment(MultipartFile file) {
        try {
            Path uploadDir = Paths.get(pdfStoragePathAttachments).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String safeFileName = (originalName != null ? originalName.replaceAll("[\\\\/:*?\"<>|]", "_") : "uploaded.pdf");

            String fileName = System.currentTimeMillis() + "_" + safeFileName;

            Path filePath = uploadDir.resolve(fileName).normalize();

            file.transferTo(filePath.toFile());

            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to store file: " + e.getMessage(), e);
        }
    }
}
