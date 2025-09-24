package com.metro.rfisystem.backend.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.controller.PdfUploadController;

@Service
public class PdfService {
    Logger logger = Logger.getLogger(PdfUploadController.class);

    // Base folder where PDFs will be stored (inside frontend project)
//    private static final String BASE_DIRECTORY = "C:\\projects\\rfi\\frontend\\pdfs";


	@Value("${rfi.pdf.storage-path}")
	private String pdfStoragePath;

    
    /**
     * Save (or replace) PDF for given RFI ID.
     */
    public void savePdf(MultipartFile pdfFile, String rfiId) throws IOException {
        // Directory for each RFI
        Path targetDirectory = Paths.get(pdfStoragePath, rfiId);
        Files.createDirectories(targetDirectory);

        // File path: frontend/pdfs/{rfiId}/{rfiId}.pdf
        File pdfFilePath = new File(targetDirectory.toFile(), rfiId + ".pdf");

        try (FileOutputStream fos = new FileOutputStream(pdfFilePath)) {
            fos.write(pdfFile.getBytes());
        }

        logger.info("PDF saved successfully at: " + pdfFilePath.getAbsolutePath());
    }

    /**
     * Retrieve the PDF file for a given RFI ID.
     */
    public File retrievePdf(Long long1) throws IOException {
        // Convert Long to String
        String longStr = String.valueOf(long1);

        Path pdfPath = Paths.get(pdfStoragePath, longStr, longStr + ".pdf");

        if (!Files.exists(pdfPath)) {
            throw new FileNotFoundException("PDF not found at path: " + pdfPath.toString());
        }

        return pdfPath.toFile();
    }

    /**
     * Get PDF file data as byte[] for download/streaming.
     */
    public byte[] getPdfData(String rfiId) throws IOException {
        Long id = Long.parseLong(rfiId); // Convert String to Long
        File pdfFile = retrievePdf(id);
        return Files.readAllBytes(pdfFile.toPath());
    }
}
