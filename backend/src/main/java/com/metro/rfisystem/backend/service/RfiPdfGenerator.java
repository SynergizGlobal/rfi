//package com.metro.rfisystem.backend.service;
//
//import java.io.File;
//import java.io.IOException;
//import java.io.OutputStream;
//
//import com.itextpdf.text.*;
//import com.itextpdf.text.pdf.*;
//import com.metro.rfisystem.backend.dto.RfiReportDTO;
//
//public class RfiPdfGenerator {
//
//    public void generateRfiReportPdf(RfiReportDTO dto, OutputStream outputStream) throws Exception {
//        Document document = new Document(PageSize.A4);
//        PdfWriter writer = PdfWriter.getInstance(document, outputStream);
//        document.open();
//
//        Font bold = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
//        Font normal = new Font(Font.FontFamily.HELVETICA, 10);
//
//        PdfPTable table = new PdfPTable(new float[]{2, 2, 2, 2});
//        table.setWidthPercentage(100);
//
//        PdfPCell cell;
//
//        // Row 1: Client + Title
//        cell = new PdfPCell(new Phrase("Client: Mumbai Rail Vikas Corporation", bold));
//        cell.setColspan(2);
//        table.addCell(cell);
//
//        cell = new PdfPCell(new Phrase("REQUEST FOR INSPECTION (RFI)", bold));
//        cell.setColspan(2);
//        table.addCell(cell);
//
//        // Row 2: Consultant, Contract, Contractor, Contract ID
//        table.addCell(new Phrase("Consultant: " + dto.getConsultant(), normal));
//        table.addCell(new Phrase("Contract: " + dto.getContract(), normal));
//        table.addCell(new Phrase("Contractor: " + dto.getContractor(), normal));
//        table.addCell(new Phrase("Contract ID: " + dto.getContractId(), normal));
//
//        // Row 3: RFI ID
//        cell = new PdfPCell(new Phrase("RFI ID: " + dto.getRfiId(), normal));
//        cell.setColspan(4);
//        table.addCell(cell);
//
//        // Row 4
//        table.addCell(new Phrase("Date of Inspection: " + dto.getDateOfInspection(), normal));
//        table.addCell(new Phrase("Location: " + dto.getLocation(), normal));
//        table.addCell(new Phrase("Proposed Inspection Time: " + dto.getProposedInspectionTime(), normal));
//        table.addCell(new Phrase("Actual Inspection Time: " + dto.getActualInspectionTime(), normal));
//
//     // Row 5: RFI Description and Enclosures (each spans 2 columns)
//        cell = new PdfPCell(new Phrase("RFI Description: " + dto.getRfiDescription(), normal));
//        cell.setColspan(2);
//        table.addCell(cell);
//        cell = new PdfPCell(new Phrase("Enclosures: " + dto.getEnclosures(), normal));
//        cell.setColspan(2);
//        table.addCell(cell);
//
//
//     // Row 6: Contractor’s Representative and Client Representative (each spans 2 columns)
//        cell = new PdfPCell(new Phrase("Contractor’s Representative: " + dto.getContractorRepresentative(), normal));
//        cell.setColspan(2);
//        table.addCell(cell);
//
//        cell = new PdfPCell(new Phrase("Client Representative: " + dto.getClientRepresentative(), normal));
//        cell.setColspan(2);
//        table.addCell(cell);
//
//        // Row 7: Contractor Remarks
//        cell = new PdfPCell(new Phrase("Description by Contractor: " + dto.getContractorRemarks(), normal));
//        cell.setColspan(4);
//        cell.setMinimumHeight(40);
//        table.addCell(cell);
//
//        // Row 8: Client Comments
//        cell = new PdfPCell(new Phrase("Comments by Client: " + dto.getClientRemarks(), normal));
//        cell.setColspan(4);
//        cell.setMinimumHeight(40);
//        table.addCell(cell);
//
//        // Row 9: RFI Approval Status Header
//        cell = new PdfPCell(new Phrase("RFI Approval Status:", bold));
//        cell.setColspan(4);
//        table.addCell(cell);
//
//        // Row 10: Radio Buttons
//        String action = dto.getAction() != null ? dto.getAction().trim().toLowerCase() : "";
//        String remarks = dto.getRemarks();
//        boolean hasRemarks = remarks != null && !remarks.trim().isEmpty();
//
//        String checked = "◉";
//        String unchecked = "○";
//
//        String approved = "Approved " + (action.equals("approved") && !hasRemarks ? checked : unchecked);
//        String rejected = "Rejected " + (action.equals("rejected") && !hasRemarks ? checked : unchecked);
//        String comments = hasRemarks ? action + " with Comments " + checked : "Approved with Comments " + unchecked;
//        String remarkText = hasRemarks ? remarks : "";
//
//        table.addCell(new PdfPCell(new Phrase(approved, normal)));
//        table.addCell(new PdfPCell(new Phrase(rejected, normal)));
//        table.addCell(new PdfPCell(new Phrase(comments, normal)));
//        table.addCell(new PdfPCell(new Phrase(remarkText, normal)));
//
//        // Empty row (padding)
//        for (int i = 0; i < 4; i++) {
//            table.addCell(new PdfPCell(new Phrase("")));
//        }
//
//        document.add(table);
//
//        // ---------- Test Site Report ----------
//        if ("1".equals(dto.getTestInsiteLab()) && dto.getTestSiteDocuments() != null) {
//            document.newPage();
//            document.add(new Paragraph("Test Site Documents", bold));
//            addFileToPdf(document, writer, dto.getTestSiteDocuments());
//        }
//
//        // ---------- Images ----------
//        if (dto.getImagesUploadedByContractor() != null) {
//            document.newPage();
//            document.add(new Paragraph("Images Uploaded by Contractor", bold));
//            addImages(document, dto.getImagesUploadedByContractor());
//        }
//
//        if (dto.getImagesUploadedByClient() != null) {
//            document.newPage();
//            document.add(new Paragraph("Images Uploaded by Client", bold));
//            addImages(document, dto.getImagesUploadedByClient());
//        }
//
//        document.close();
//    }
//
//    private void addFileToPdf(Document document, PdfWriter writer, String path) throws Exception {
//        File file = new File(path);
//        if (!file.exists()) throw new IOException("File not found at: " + path);
//
//        if (path.toLowerCase().endsWith(".pdf")) {
//            PdfReader reader = new PdfReader(path);
//            PdfContentByte cb = writer.getDirectContent();
//            for (int i = 1; i <= reader.getNumberOfPages(); i++) {
//                document.newPage();
//                PdfImportedPage page = writer.getImportedPage(reader, i);
//                cb.addTemplate(page, 0, 0);
//            }
//            reader.close();
//        } else {
//            Image img = Image.getInstance(path);
//            img.scaleToFit(500, 500);
//            img.setAlignment(Image.ALIGN_CENTER);
//            document.add(img);
//        }
//    }
//
//    private void addImages(Document document, String commaSeparatedPaths) throws Exception {
//        for (String path : commaSeparatedPaths.split(",")) {
//            if (!path.trim().isEmpty()) {
//                File imgFile = new File(path.trim());
//                if (!imgFile.exists()) continue;
//                Image img = Image.getInstance(path.trim());
//                img.scaleToFit(500, 500);
//                img.setAlignment(Image.ALIGN_CENTER);
//                document.add(img);
//            }
//        }
//    }
//}
