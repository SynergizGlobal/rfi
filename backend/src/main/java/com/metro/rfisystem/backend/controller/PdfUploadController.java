package com.metro.rfisystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.constants.ESignStatus;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;

import java.util.*;
import java.awt.Color;



@RestController
@RequestMapping("/rfi")
public class PdfUploadController {
	
	@Autowired
	RFIRepository rfiRepository;

    @Value("${rfi.pdf.storage-path}")
    private String pdfStoragePath;

    @PostMapping("/uploadPdfContractor")
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
    private List<String> wrapText(String text, float maxWidth, PDFont font, float fontSize) throws IOException {
        List<String> lines = new ArrayList<>();
        StringBuilder currentLine = new StringBuilder();

        // Split by space while preserving punctuation spacing
        for (String word : text.split("(?<=\\s)")) {
            String testLine = currentLine + word;
            float textWidth = font.getStringWidth(testLine.trim()) / 1000 * fontSize;

            if (textWidth > maxWidth && currentLine.length() > 0) {
                // add the current line and start a new one
                lines.add(currentLine.toString().trim());
                currentLine = new StringBuilder(word.trim());
            } else {
                currentLine.append(word);
            }
        }

        // add the last line
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString().trim());
        }

        return lines;
    }
    
    
    private void drawTickMark(PDPageContentStream content, float x, float y) throws IOException {
        content.setStrokingColor(Color.BLACK);
        content.setLineWidth(1.5f);
        content.moveTo(x - 2, y + 5);
        content.lineTo(x + 3, y - 1);
        content.lineTo(x + 10, y + 10);
        content.stroke();
    }


    private void drawCrossMark(PDPageContentStream content, float x, float y) throws IOException {
        content.setStrokingColor(Color.black);
        content.setLineWidth(1.5f);
        content.moveTo(x - 2, y + 6);
        content.lineTo(x + 6, y);
        content.moveTo(x + 6, y + 6);
        content.lineTo(x - 2, y);
        content.stroke();
    }



    
    


    @PostMapping("rfi/uploadPdf/Engg")
    public ResponseEntity<String> uploadPdfEngineer(
            @RequestParam("inspectionStatus") String inspectionStatus,
            @RequestParam("engineerRemarks") String engRemarks,
            @RequestParam("pdf") MultipartFile pdfFile,
            @RequestParam("rfiId") String rfiId
    ) throws IOException {

        if (pdfFile.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded PDF is empty.");
        }

        Long longRfiId = Long.parseLong(rfiId);
        Optional<RFI> rfiOpt = rfiRepository.findById(longRfiId);
        if (rfiOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("RFI Not Found!");
        }

        RFI rfi = rfiOpt.get();
        if (!rfi.getEStatus().equals(ESignStatus.CON_SUCCESS)) {
            return ResponseEntity.badRequest().body("RFI Not Submitted By Contractor!");
        }

        String txnId = rfi.getTxn_id();
        File pdfDir = new File(pdfStoragePath);
        if (!pdfDir.exists()) pdfDir.mkdirs();

        File contractorPdf = new File(pdfDir, "signed_" + txnId + ".pdf");
        if (!contractorPdf.exists()) {
            return ResponseEntity.badRequest().body("Contractor signed PDF not found!");
        }

        File finalPdf = new File(pdfDir, "signed_" + txnId + "_temp.pdf");

        try (PDDocument contractorDoc = PDDocument.load(contractorPdf);
             PDDocument engineerDoc = PDDocument.load(pdfFile.getInputStream());
             PDDocument newDoc = new PDDocument()) {

            PDPage firstPage = contractorDoc.getPage(0);
            PDPage importedPage = newDoc.importPage(firstPage);

            float pageHeight = importedPage.getMediaBox().getHeight();
            PDFont tickFont = PDType1Font.HELVETICA_BOLD;
            PDFont remarkFont = PDType1Font.HELVETICA;

            try (PDPageContentStream content = new PDPageContentStream(
                    newDoc, importedPage, PDPageContentStream.AppendMode.APPEND, true, true)) {


                content.setFont(tickFont, 12);

             // ✅ Coordinate Map (easy to maintain)
                Map<String, float[]> coords = new HashMap<>();
                coords.put("Accepted", new float[]{53, 343});
                coords.put("Rejected", new float[]{353, 343});
                coords.put("Remarks", new float[]{91, 311}); // measure actual Y in your PDF


                // ✅ Draw tick/cross using lines (no font needed)
                if ("Accepted".equalsIgnoreCase(inspectionStatus)) {
                    float[] pos = coords.get("Accepted");
                    drawTickMark(content, pos[0], pos[1]);
                } else if ("Rejected".equalsIgnoreCase(inspectionStatus)) {
                    float[] pos = coords.get("Rejected");
                    drawCrossMark(content, pos[0], pos[1]);
                }




                // ✅ Engineer Remarks
                if (engRemarks != null && !engRemarks.isBlank()) {
                    content.setFont(tickFont, 10);
                    float[] remarkPos = coords.get("Remarks");
                    float startX = remarkPos[0];
                    float startY = remarkPos[1];
                    float maxWidth = 480;
                    float lineHeight = 12;

                    List<String> lines = wrapText(engRemarks, maxWidth, remarkFont, 10);
                    for (String line : lines) {
                        content.beginText();
                        content.newLineAtOffset(startX, startY);
                        content.showText(line);
                        content.endText();
                        startY -= lineHeight;
                    }
                }
            }

            // 2️⃣ Add remaining pages from engineer PDF
            for (int i = 1; i < engineerDoc.getNumberOfPages(); i++) {
                PDPage page = engineerDoc.getPage(i);
                newDoc.importPage(page);
            }

            newDoc.save(finalPdf);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating PDF: " + e.getMessage());
        }

        return ResponseEntity.ok("Engineer signed PDF saved successfully: " + finalPdf.getAbsolutePath());
    }

  
}
